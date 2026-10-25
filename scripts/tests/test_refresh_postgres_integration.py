"""Opt-in real PostgreSQL 16 SQL/archive tests, never the AWS export CLI.

Run from the repository root:
  TT54_RUN_DOCKER_TESTS=1 python3 -m unittest discover -s scripts/tests \
      -p test_refresh_postgres_integration.py -v

The fixed repository local helper is sourced by a test-only Bash harness. A
strict Docker wrapper simulates Desktop context/Compose/inspect metadata so
prepare_local_destination can run on Linux against ONLY our new container ID.
Identity guard coverage belongs to the mocked regression suite: this suite is
real SQL/archive verification, NOT proof of Desktop/volume/port guard behavior.
All pg_dump, pg_restore (including catalog checks), psql, dropdb and createdb
commands execute unmodified in PostgreSQL 16. No AWS command is invoked.
Fixtures have no network or host ports; PGDATA is tmpfs. Cleanup removes only
the container ID created here, including anonymous volumes. No production CLI
bypass or configuration knob is added; the opt-in environment is test-only.
"""
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import time
import unittest


REPO = Path(__file__).resolve().parents[2]

# Discovery metadata is deliberately fictional; exec is fail-closed to our ID.
DOCKER_WRAPPER = r'''#!/usr/bin/env python3
import json, os, subprocess, sys
args = sys.argv[1:]
cid = os.environ['TT54_FIXTURE_ID']
if args == ['context', 'inspect', 'desktop-linux', '--format', '{{.Endpoints.docker.Host}}']:
    print('unix://' + os.environ['HOME'] + '/.docker/run/docker.sock')
    sys.exit(0)
if args[:2] != ['--context', 'desktop-linux']:
    sys.exit('Unexpected Docker operation: ' + repr(args))
args = args[2:]
if args == ['compose', '--project-name', 'postgres', '-f', os.environ['TT54_COMPOSE_FILE'], 'ps', '-q', 'postgres']:
    print(cid)
    sys.exit(0)
if len(args) == 6 and args[:3] == ['inspect', '--type', 'container'] and args[3] == '--format' and args[5] == cid:
    print(json.dumps([{'Id': cid, 'State': {'Running': True},
        'Config': {'Image': 'postgres:16-bookworm', 'Labels': {
            'com.docker.compose.project': 'postgres', 'com.docker.compose.service': 'postgres'}},
        'Mounts': [{'Destination': '/var/lib/postgresql/data', 'Type': 'volume',
                    'Name': 'trailtasks-local-postgres16', 'RW': True}],
        'NetworkSettings': {'Ports': {'5432/tcp': [{'HostIp': '127.0.0.1', 'HostPort': '5433'}]}}}]))
    sys.exit(0)
if len(args) < 4 or args[:3] != ['exec', '-i', cid] or args[3] not in {'psql', 'pg_dump', 'pg_restore', 'dropdb', 'createdb'}:
    sys.exit('Refusing operation outside isolated fixture: ' + repr(args))
result = subprocess.run([os.environ['TT54_REAL_DOCKER'], *args])
with open(os.environ['TT54_COMMAND_LOG'], 'a') as handle:
    handle.write(json.dumps({'args': args[3:], 'status': result.returncode}) + '\n')
sys.exit(result.returncode)
'''

HARNESS = r'''
set -euo pipefail
umask 077
fail() { printf '%s\n' "$*" >&2; exit 1; }
script_dir="$TT54_SCRIPT_DIR"
source "$script_dir/lib/refresh-local.sh"
mode=replace
database_name="$TT54_DATABASE"
output_path="$TT54_SOURCE_ARCHIVE"
output_dir="$(dirname "$output_path")"
prepare_local_destination
verify_local_container
local_compose pg_restore --list < "$output_path" > /dev/null
replace_existing_database
local_compose createdb --host=/var/run/postgresql --username=postgres \
  --maintenance-db=postgres --template=template0 "$database_name" < /dev/null
restore_input="$output_path"
if [[ "$TT54_INVALID_RESTORE" == 1 ]]; then
  # Corrupt only the restore input AFTER valid catalog preflight and replacement.
  # PostgreSQL, not a stub exit code, must reject this actual archive input.
  restore_input="$output_dir/invalid-restore.dump"
  printf 'not a PostgreSQL custom archive\n' > "$restore_input"
fi
local_compose pg_restore --host=/var/run/postgresql --username=postgres \
  --dbname="$database_name" --no-owner --no-privileges \
  --single-transaction --exit-on-error < "$restore_input"
'''


@unittest.skipUnless(os.environ.get('TT54_RUN_DOCKER_TESTS') == '1',
                     'set TT54_RUN_DOCKER_TESTS=1 for disposable real PostgreSQL16 Docker tests')
class PostgreSQLIntegrationTest(unittest.TestCase):
    def setUp(self):
        docker = shutil.which('docker')
        if docker is None:
            self.fail('Docker CLI required for explicit opt-in')
        self.docker = docker
        self.temp = tempfile.TemporaryDirectory(prefix='tt54-synthetic-sql-')
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.container = None
        self.addCleanup(self.remove_container)
        result = subprocess.run([
            self.docker, 'run', '--detach', '--pull=never', '--network=none',
            '--tmpfs', '/var/lib/postgresql/data:rw',
            '--env', 'POSTGRES_HOST_AUTH_METHOD=trust', 'postgres:16-bookworm',
        ], capture_output=True, text=True, check=True, timeout=30)
        cid = result.stdout.strip()
        self.assertRegex(cid, r'^[a-f0-9]{64}$')
        self.container = cid
        deadline = time.monotonic() + 45
        readiness_detail = ''
        while time.monotonic() < deadline:
            logs = subprocess.run([self.docker, 'logs', cid], capture_output=True,
                                  text=True, timeout=5)
            ready = subprocess.run([self.docker, 'exec', cid, 'pg_isready',
                                    '--host=/var/run/postgresql', '--username=postgres'],
                                   capture_output=True, timeout=5)
            readiness_detail = logs.stdout + logs.stderr
            if 'PostgreSQL init process complete' in logs.stdout and ready.returncode == 0:
                break
            # Backoff only after failed health result; bounded by readiness deadline.
            time.sleep(0.1)
        else:
            self.fail('PostgreSQL readiness deadline exceeded: ' + readiness_detail)
        inspect = json.loads(subprocess.run([self.docker, 'inspect', cid],
                             capture_output=True, text=True, check=True, timeout=10).stdout)[0]
        self.assertEqual(inspect['HostConfig']['NetworkMode'], 'none')
        self.assertFalse(inspect['HostConfig']['PortBindings'])
        self.assertEqual(inspect['HostConfig']['Tmpfs'], {'/var/lib/postgresql/data': 'rw'})
        self.assertFalse(inspect['Mounts'], 'No persistent fixture mounts are permitted')
        self.assertTrue(self.sql('postgres', 'SHOW server_version_num').startswith('16'))
        # Names exist ONLY in the newly created fixture; never discovered externally.
        self.source_db = 'synthetic_source'
        self.target_db = 'synthetic_destination'
        for database in (self.source_db, self.target_db):
            self.db('createdb', '--template=template0', database)
        self.sql(self.source_db, 'CREATE TABLE source_only(id integer PRIMARY KEY); INSERT INTO source_only VALUES (54)')
        self.sql(self.target_db, "CREATE TABLE old_only(note text); INSERT INTO old_only VALUES ('before-backup-marker')")
        self.old_oid = self.sql('postgres', "SELECT oid FROM pg_database WHERE datname='synthetic_destination'")
        self.archive = self.root / 'synthetic-source.dump'
        self.archive.write_bytes(self.db('pg_dump', '--dbname=' + self.source_db,
                                         '--format=custom', '--no-owner', '--no-privileges').stdout)
        self.backup = Path(str(self.archive) + '.before-' + self.target_db + '.dump')
        self.log = self.root / 'commands.jsonl'
        binary_dir = self.root / 'bin'
        binary_dir.mkdir()
        wrapper = binary_dir / 'docker'
        wrapper.write_text(DOCKER_WRAPPER)
        wrapper.chmod(0o700)
        self.env = dict(os.environ)
        for key in ('DOCKER_HOST', 'DOCKER_CONTEXT', 'BASH_ENV', 'ENV'):
            self.env.pop(key, None)
        self.env.update(PATH=str(binary_dir) + os.pathsep + os.environ['PATH'], HOME=str(self.root),
                        TT54_REAL_DOCKER=self.docker, TT54_FIXTURE_ID=cid,
                        TT54_SCRIPT_DIR=str(REPO / 'scripts'), TT54_DATABASE=self.target_db,
                        TT54_SOURCE_ARCHIVE=str(self.archive), TT54_COMMAND_LOG=str(self.log),
                        TT54_COMPOSE_FILE=str(REPO / 'scripts/../infra/docker/postgres/compose.yml'))

    def remove_container(self):
        if self.container is not None:
            result = subprocess.run([self.docker, 'rm', '-fv', self.container],
                                    capture_output=True, text=True, timeout=30)
            self.assertEqual(result.returncode, 0, result.stderr)
            check = subprocess.run([self.docker, 'inspect', self.container],
                                   capture_output=True, text=True, timeout=10)
            self.assertNotEqual(check.returncode, 0, 'Fixture unexpectedly survived cleanup')

    def db(self, tool, *args, data=None):
        assert self.container is not None, 'Fixture container must be created before database commands'
        return subprocess.run([self.docker, 'exec', '-i', self.container, tool,
                               '--host=/var/run/postgresql', '--username=postgres', *args],
                              input=data, capture_output=True, check=True, timeout=30)

    def sql(self, database, query):
        return self.db('psql', '-X', '--no-align', '--tuples-only', '--set=ON_ERROR_STOP=1',
                       '--dbname=' + database, '--command', query).stdout.decode().strip()

    def run_replace(self, invalid=False):
        result = subprocess.run(['bash', '-c', HARNESS], env=dict(self.env, TT54_INVALID_RESTORE=str(int(invalid))),
                                input=self.target_db + '\n', capture_output=True, text=True, timeout=60)
        self.assertEqual(result.returncode == 0, not invalid, result.stdout + result.stderr)
        self.assertTrue(self.backup.exists(), result.stderr)
        self.assertEqual(self.backup.stat().st_mode & 0o777, 0o600)
        self.assertEqual(self.backup.read_bytes()[:5], b'PGDMP')
        self.assertIn(str(self.backup), result.stderr)
        self.assertIn('Recovery:', result.stderr)
        self.assertTrue(self.archive.exists())
        self.assertFalse(list(self.root.glob('.tt54-backup.*')))
        self.assertFalse(list((self.root / '.trailtasks-db-refresh-locks').glob('*.lock')))
        self.assertNotEqual(self.sql('postgres', "SELECT oid FROM pg_database WHERE datname='synthetic_destination'"), self.old_oid)
        calls = [json.loads(line) for line in self.log.read_text().splitlines()]
        operations = [(call['args'][0], call['status']) for call in calls]
        self.assertIn(('pg_dump', 0), operations)
        self.assertGreaterEqual(operations.count(('pg_restore', 0)), 2)  # backup and source catalogs
        self.assertIn(('dropdb', 0), operations)
        self.assertIn(('createdb', 0), operations)
        self.assertLess(operations.index(('pg_dump', 0)), operations.index(('dropdb', 0)))
        return result, calls

    def assert_backup_recovers(self):
        self.db('createdb', '--template=template0', 'synthetic_recovery')
        self.db('pg_restore', '--dbname=synthetic_recovery', '--no-owner', '--no-privileges',
                '--single-transaction', '--exit-on-error', data=self.backup.read_bytes())
        self.assertEqual(self.sql('synthetic_recovery', 'SELECT note FROM old_only'), 'before-backup-marker')
        self.assertEqual(self.sql('synthetic_recovery', "SELECT to_regclass('public.source_only') IS NULL"), 't')

    def test_replace_restores_new_data_and_backup_recovers_original(self):
        self.run_replace()
        self.assertEqual(self.sql(self.target_db, 'SELECT id FROM source_only'), '54')
        self.assertEqual(self.sql(self.target_db, "SELECT to_regclass('public.old_only') IS NULL"), 't')
        self.assert_backup_recovers()

    def test_real_invalid_archive_failure_retains_recoverable_backup(self):
        result, calls = self.run_replace(invalid=True)
        restores = [call for call in calls if call['args'][0] == 'pg_restore']
        self.assertNotEqual(restores[-1]['status'], 0)
        self.assertIn('--dbname=' + self.target_db, restores[-1]['args'])
        self.assertIn('pg_restore: error:', result.stderr)
        self.assertEqual(self.sql(self.target_db, "SELECT count(*) FROM pg_tables WHERE schemaname='public'"), '0')
        self.assert_backup_recovers()


if __name__ == '__main__':
    unittest.main()
