#!/usr/bin/env python3
"""Only the tests install this fake AWS/Docker executable in their private PATH."""
import json
import os
from pathlib import Path
import subprocess
import sys

root = Path(os.environ['STUB_ROOT'])
config = json.loads((root / 'config.json').read_text())
state_path = root / 'state.json'
state = json.loads(state_path.read_text()) if state_path.exists() else {'exists': config.get('exists', False), 'oid': '42', 'checks': 0}
args = sys.argv[1:]
kind = Path(sys.argv[0]).name
with (root / 'calls.jsonl').open('a') as log:
    log.write(json.dumps([kind] + args) + '\n')

def save():
    state_path.write_text(json.dumps(state))

def emit(value):
    print(json.dumps(value))

def option(name):
    return args[args.index(name) + 1]

def stop(message):
    print(message, file=sys.stderr)
    sys.exit(1)

if kind == 'aws':
    assert option('--profile') == 'trailtasks-terraform'
    assert option('--region') == 'us-east-1'
    op = args[:2]
    if op == ['sts', 'get-caller-identity']:
        print(config.get('account', '890129487844'))
    elif op == ['ecs', 'describe-services']:
        emit({'failures': [], 'services': [{'taskDefinition': 'arn:aws:ecs:us-east-1:890129487844:task-definition/trailtasks-staging-api:1', 'network': {'assignPublicIp': config.get('public_ip', 'DISABLED'), 'subnets': ['subnet-123'], 'securityGroups': ['sg-123']}}]})
    elif op == ['ecs', 'describe-task-definition']:
        emit({'taskDefinition': 'api', 'containers': [{'command': ['DO_NOT_PRINT_SECRET']}]})
    elif op == ['ecs', 'run-task']:
        request = json.loads(Path(option('--cli-input-json').removeprefix('file://')).read_text())
        assert request['cluster'] == 'trailtasks-staging'
        assert request['taskDefinition'] == 'arn:aws:ecs:us-east-1:890129487844:task-definition/trailtasks-staging-db-export:1'
        assert request['overrides']['containerOverrides'][0]['name'] == 'db-export'
        state['export_id'] = request['clientToken']
        assert len(state['export_id']) == 32
        save()
        emit({'failures': ['failure'] if config.get('launch_failure') else [], 'tasks': [{'taskArn': config.get('launch_arn', 'arn:aws:ecs:us-east-1:890129487844:task/trailtasks-staging/abc123'), 'lastStatus': 'PENDING'}]})
    elif op == ['ecs', 'wait']:
        if config.get('wait_failure'):
            stop('wait failed')
    elif op == ['ecs', 'describe-tasks']:
        container = {'name': config.get('container', 'db-export'), 'exitCode': config.get('exit', 0)}
        if config.get('missing_exit'):
            del container['exitCode']
        emit({'failures': config.get('completion_failures', []), 'tasks': [{'taskArn': config.get('completion_arn', option('--tasks')), 'status': config.get('status', 'STOPPED'), 'containers': [container]}]})
    elif op == ['s3api', 'head-object']:
        assert option('--bucket') == 'trailtasks-s3'
        assert option('--key') == 'staging-db-exports/' + state['export_id'] + '/staging.dump'
        emit({'ContentLength': config.get('size', Path(config['archive_path']).stat().st_size if 'archive_path' in config else 12), 'ServerSideEncryption': config.get('encryption', 'AES256')})
    elif op == ['s3', 'cp']:
        assert args[2] == 's3://trailtasks-s3/staging-db-exports/' + state['export_id'] + '/staging.dump'
        Path(args[3]).write_bytes(Path(config['archive_path']).read_bytes() if 'archive_path' in config else config.get('payload', 'PGDMParchive').encode())
        if config.get('race_output'):
            Path(config['output']).write_text('racing file')
        if config.get('download_failure'):
            stop('download failed')
    else:
        stop('Unexpected AWS call: ' + repr(args))
elif kind == 'docker':
    if args[:3] == ['context', 'inspect', 'desktop-linux']:
        print('tcp://remote:2375' if (config.get('endpoint_changed') and state['checks'] > 1) or (config.get('cleanup_endpoint_changed') and state.get('drop_attempt')) else config.get('endpoint', 'unix://' + os.environ['HOME'] + '/.docker/run/docker.sock'))
        sys.exit()
    assert args[:2] == ['--context', 'desktop-linux']
    args = args[2:]
    if args[0] == 'compose' and 'ps' in args:
        print('a' * 64)
    elif args[0] == 'inspect':
        state['checks'] += 1
        save()
        emit([{'Id': 'b' * 64 if config.get('container_changed') and state['checks'] > 1 else 'a' * 64, 'State': {'Running': True}, 'Config': {'Image': config.get('image', 'postgres:16-bookworm'), 'Labels': {'com.docker.compose.project': 'postgres', 'com.docker.compose.service': 'postgres'}}, 'Mounts': [{'Type': 'volume', 'Name': config.get('volume', 'trailtasks-local-postgres16'), 'Destination': '/var/lib/postgresql/data', 'RW': True}], 'NetworkSettings': {'Ports': {'5432/tcp': [{'HostIp': config.get('host_ip', '127.0.0.1'), 'HostPort': '5433'}]}}}])
    else:
        # Support old compose-exec during the red regression run too.
        if args[0] == 'compose':
            args = args[args.index('postgres') + 1:] if 'exec' not in args else args[args.index('exec') + 3:]
        elif args[0] == 'exec':
            args = args[3:]
        op = args[0]
        # Optional integration fixture only: forward DB tools to the uniquely named
        # isolated disposable container, NEVER any host database or AWS command.
        if 'TT54_TEST_CONTAINER' in os.environ:
            assert op in ('psql', 'pg_dump', 'pg_restore', 'createdb', 'dropdb')
            if op == 'pg_restore' and '--list' not in args and config.get('restore_failure'):
                stop('injected restore failure')
            process = subprocess.run([os.environ['TT54_TEST_REAL_DOCKER'], 'exec', '-i', os.environ['TT54_TEST_CONTAINER']] + args)
            sys.exit(process.returncode)
        if op == 'psql':
            query = args[args.index('--command') + 1]
            if 'server_version_num' in query:
                print(config.get('version', '160004'))
            elif 'pg_stat_activity' in query:
                state['idle_checks'] = state.get('idle_checks', 0) + 1
                save()
                print('1' if config.get('active') or (config.get('active_late') and state['idle_checks'] > 1) else '0')
            elif 'ALLOW_CONNECTIONS' in query:
                if config.get('freeze_failure'):
                    stop('freeze failed')
                state['frozen'] = 'false' in query.lower()
                save()
            elif 'oid' in query:
                state['oid_checks'] = state.get('oid_checks', 0) + 1
                save()
                print(('99' if config.get('oid_changed') and state['oid_checks'] > 1 else state['oid']) if state['exists'] else '')
            elif 'pg_database' in query:
                print('1' if state['exists'] else '')
            else:
                stop('Unexpected SQL: ' + query)
        elif op == 'pg_dump':
            if config.get('backup_race'):
                Path(config['output'] + '.before-trailtasks_test.dump').write_text('racing backup')
            if config.get('backup_failure'):
                sys.stdout.buffer.write(b'PGDMPpartial')
                stop('backup failed')
            sys.stdout.buffer.write(b'PGDMPlocal-backup')
        elif op == 'pg_restore':
            data = sys.stdin.buffer.read()
            if '--list' in args:
                if config.get('catalog_failure') or not data.startswith(b'PGDMP'):
                    stop('invalid catalog')
                print('archive catalog')
            elif config.get('restore_failure'):
                stop('restore failed')
            else:
                assert data == b'PGDMParchive'
                assert '--single-transaction' in args and '--exit-on-error' in args
                assert '--no-owner' in args and '--no-privileges' in args
                state['restored'] = True
                save()
        elif op == 'createdb':
            if state['exists'] or config.get('create_race'):
                stop('already exists')
            assert '--template=template0' in args
            state['exists'] = True
            state['oid'] = '43'
            save()
        elif op == 'dropdb':
            assert '--force' not in args
            state['drop_attempt'] = True
            save()
            if config.get('drop_failure'):
                stop('drop failed')
            state['exists'] = False
            state['dropped'] = True
            save()
        else:
            stop('Unexpected docker operation: ' + repr(args))
else:
    stop('Unexpected stub')
