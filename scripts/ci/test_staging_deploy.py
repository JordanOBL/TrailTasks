"""Synthetic Terraform/AWS fixtures only; never contacts AWS. Refresh drift is rejected except for the staging DB recovery timestamp and
the GitHub role's inline-policy snapshot when it matches unchanged managed
policy resources. Known empty/null values are equivalent only for ipc_mode,
pid_mode, and task_role_arn."""
import copy
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

import staging_deploy as deploy

IMAGE = '890129487844.dkr.ecr.us-east-1.amazonaws.com/trailtasks-api@sha256:' + 'c' * 64
OLD_IMAGE = '890129487844.dkr.ecr.us-east-1.amazonaws.com/trailtasks-api:' + 'b' * 40
ROLE = 'arn:aws:iam::890129487844:role/trailtasks-staging-ecs-task-execution-role'
TASK = 'arn:aws:ecs:us-east-1:890129487844:task-definition/trailtasks-staging-api:7'
DIGEST = 'sha256:' + 'c' * 64
TD = 'aws_ecs_task_definition.api'
SERVICE = 'aws_ecs_service.api'


def plan_fixture(noop=False):
    container = {'name': 'api', 'image': OLD_IMAGE, 'essential': True,
                 'environment': [{'name': 'APP_ENV', 'value': 'staging'}],
                 'secrets': [{'name': 'PASSWORD', 'valueFrom': 'synthetic-secret'}],
                 'portMappings': [{'containerPort': 5500}],
                 'logConfiguration': {'logDriver': 'awslogs'}}
    before = {'family': 'trailtasks-staging-api', 'cpu': '256', 'memory': '512',
              'network_mode': 'awsvpc', 'execution_role_arn': ROLE,
              'container_definitions': json.dumps([container]), 'tags': {'Environment': 'staging'},
              'tags_all': {'Environment': 'staging'}, 'arn': TASK, 'id': TASK, 'revision': 7}
    after = copy.deepcopy(before)
    container['image'] = IMAGE
    after['container_definitions'] = json.dumps([container])
    if noop:
        before = copy.deepcopy(after)
    else:
        for key in ('arn', 'id', 'revision'):
            after.pop(key)
    service_before = {'name': 'trailtasks-staging-api', 'task_definition': TASK,
                      'desired_count': 1, 'network_configuration': [{'subnets': ['subnet-fixture']}]}
    service_after = copy.deepcopy(service_before)
    if not noop:
        service_after.pop('task_definition')
    return {'format_version': '1.2', 'complete': True, 'errored': False,
            'resource_changes': [
                {'address': TD, 'mode': 'managed', 'type': 'aws_ecs_task_definition', 'name': 'api',
                 'change': {'actions': ['no-op'] if noop else ['delete', 'create'],
                            'before': before, 'after': after,
                            'after_unknown': {} if noop else {'arn': True, 'id': True, 'revision': True}}},
                {'address': SERVICE, 'mode': 'managed', 'type': 'aws_ecs_service', 'name': 'api',
                 'change': {'actions': ['no-op'] if noop else ['update'],
                            'before': service_before, 'after': service_after,
                            'after_unknown': {} if noop else {'task_definition': True}}}],
            'planned_values': {'root_module': {'resources': [
                {'address': TD, 'values': after}, {'address': SERVICE, 'values': service_after}]}},
            'configuration': {'root_module': {'resources': [
                {'address': SERVICE, 'expressions': {'task_definition': {'references': [TD + '.arn', TD]}}}]}}}


def rollout_fixture():
    service = {'failures': [], 'services': [{'taskDefinition': TASK, 'desiredCount': 1,
               'runningCount': 1, 'pendingCount': 0, 'deployments': [
                   {'status': 'PRIMARY', 'rolloutState': 'COMPLETED', 'taskDefinition': TASK}]}]}
    tasks = {'failures': [], 'tasks': [{'taskArn': 'arn:aws:ecs:us-east-1:890129487844:task/fixture/1',
             'taskDefinitionArn': TASK, 'lastStatus': 'RUNNING',
             'containers': [{'name': 'api', 'lastStatus': 'RUNNING', 'image': IMAGE, 'imageDigest': DIGEST}]}]}
    return service, tasks


class GuardTests(unittest.TestCase):
    def guard(self, plan):
        return deploy.guard_plan(plan, IMAGE, ROLE)

    def test_accept_image_only_replacement(self):
        self.guard(plan_fixture())

    def test_accept_real_provider_generated_plan_shape(self):
        # Terraform 1.16.4/AWS 5.100.0 generated this offline using synthetic state.
        fixture = Path(__file__).parent / 'fixtures' / 'image_only_plan.json'
        with fixture.open() as handle:
            self.guard(json.load(handle))

    def test_accept_create_before_destroy(self):
        p = plan_fixture(); p['resource_changes'][0]['change']['actions'].reverse(); self.guard(p)

    def test_accept_unknown_null_or_omitted_in_planned_values(self):
        p = plan_fixture(); p['planned_values'] = copy.deepcopy(p['planned_values'])
        for key in ('arn', 'id', 'revision'):
            p['resource_changes'][0]['change']['after'][key] = None
        p['resource_changes'][1]['change']['after']['task_definition'] = None
        self.guard(p)

    def test_accept_noop(self):
        self.guard(plan_fixture(True))

    def test_reject_infrastructure_actions(self):
        for actions in (['update'], ['create'], ['delete'], ['delete', 'create'], ['forget']):
            with self.subTest(actions=actions):
                p = plan_fixture(); p['resource_changes'].append({'address': 'aws_db_instance.db',
                    'mode': 'managed', 'change': {'actions': actions}})
                with self.assertRaises(deploy.ValidationError): self.guard(p)

    def test_allow_noop_and_data_read(self):
        p = plan_fixture()
        p['resource_changes'] += [{'address': 'aws_vpc.main', 'mode': 'managed', 'change': {'actions': ['no-op']}},
                                  {'address': 'data.aws_iam_policy_document.execution', 'mode': 'data', 'change': {'actions': ['read']}}]
        self.guard(p)

    def test_accept_noop_export_infrastructure(self):
        p = plan_fixture()
        for address in ('aws_iam_role.db_export', 'aws_iam_role_policy.db_export_upload',
                        'aws_ecr_repository.db_export', 'aws_cloudwatch_log_group.db_export',
                        'aws_ecs_task_definition.db_export',
                        'aws_s3_bucket_lifecycle_configuration.db_exports'):
            p['resource_changes'].append({'address': address, 'mode': 'managed',
                                          'change': {'actions': ['no-op']}})
        self.guard(p)

    def test_export_changes_still_require_operator_apply(self):
        for address in ('aws_ecs_task_definition.db_export',
                        'aws_iam_role_policy.github_staging_inspect',
                        'aws_s3_bucket_lifecycle_configuration.db_exports'):
            for actions in (['create'], ['update'], ['delete', 'create']):
                with self.subTest(address=address, actions=actions):
                    p = plan_fixture()
                    p['resource_changes'].append({'address': address, 'mode': 'managed',
                                                  'change': {'actions': actions}})
                    with self.assertRaises(deploy.ValidationError):
                        self.guard(p)

    def test_reject_task_settings_changes(self):
        for key, value in [('cpu', '512'), ('memory', '1024'), ('network_mode', 'host'),
                           ('execution_role_arn', ROLE + '-other'), ('tags', {}), ('task_role_arn', ROLE),
                           ('tags_all', {}), ('new_provider_setting', True)]:
            with self.subTest(key=key):
                p = plan_fixture(); p['resource_changes'][0]['change']['after'][key] = value
                with self.assertRaises(deploy.ValidationError): self.guard(p)

    def test_reject_nested_container_changes(self):
        for key, value in [('secrets', []), ('environment', []), ('portMappings', []),
                           ('logConfiguration', {}), ('essential', False), ('name', 'other')]:
            with self.subTest(key=key):
                p = plan_fixture(); after = p['resource_changes'][0]['change']['after']
                cs = json.loads(after['container_definitions']); cs[0][key] = value
                after['container_definitions'] = json.dumps(cs)
                with self.assertRaises(deploy.ValidationError): self.guard(p)

    def test_reject_unknowns(self):
        for index, unknown in [(0, {'cpu': True}), (0, {'container_definitions': True}),
                               (0, {'tags': {'Environment': True}}), (1, {'desired_count': True})]:
            with self.subTest(unknown=unknown):
                p = plan_fixture(); p['resource_changes'][index]['change']['after_unknown'] = unknown
                with self.assertRaises(deploy.ValidationError): self.guard(p)

    def test_allow_computed_tags_all(self):
        p = plan_fixture(); c = p['resource_changes'][0]['change']
        c['after'].pop('tags_all'); c['after_unknown']['tags_all'] = True; self.guard(p)

    def test_reject_service_change(self):
        p = plan_fixture(); p['resource_changes'][1]['change']['after']['desired_count'] = 2
        with self.assertRaises(deploy.ValidationError): self.guard(p)

    def test_reject_unlinked_service(self):
        p = plan_fixture(); p['configuration']['root_module']['resources'][0]['expressions']['task_definition'] = {'references': ['aws_ecs_task_definition.other.arn']}
        with self.assertRaises(deploy.ValidationError): self.guard(p)

    def test_reject_unsupported_plan_version(self):
        for version in ('1.', '1.invalid', '2.0', 1, None):
            p = plan_fixture(); p['format_version'] = version
            with self.subTest(version=version), self.assertRaises(deploy.ValidationError): self.guard(p)

    def test_reject_missing_paired_mutations(self):
        for index in (0, 1):
            p = plan_fixture(); p['resource_changes'][index]['change']['actions'] = ['no-op']
            with self.assertRaises(deploy.ValidationError): self.guard(p)

    def test_reject_mutating_drift(self):
        p = plan_fixture(); p['resource_drift'] = [{'change': {'actions': ['update']}}]
        with self.assertRaises(deploy.ValidationError): self.guard(p)

    def test_reject_malformed_plans(self):
        for p in (None, [], {}, {'format_version': '2.0'}, {'format_version': '1.2', 'resource_changes': []}):
            with self.subTest(plan=p), self.assertRaises(deploy.ValidationError): self.guard(p)
        for key in ('resource_changes', 'planned_values'):
            p = plan_fixture(); p.pop(key)
            with self.assertRaises(deploy.ValidationError): self.guard(p)
        for key in ('complete', 'errored'):
            p = plan_fixture(); p[key] = key == 'errored'
            with self.assertRaises(deploy.ValidationError): self.guard(p)

    def test_reject_bad_image_or_role(self):
        for image, role in [(OLD_IMAGE, ROLE), ('repo:latest', ROLE), (IMAGE, 'bad-role')]:
            with self.assertRaises(deploy.ValidationError): deploy.guard_plan(plan_fixture(), image, role)

    def test_reject_noop_wrong_image(self):
        p = plan_fixture(True); p['planned_values']['root_module']['resources'][0]['values']['container_definitions'] = '[]'
        with self.assertRaises(deploy.ValidationError): self.guard(p)

    def test_reject_malformed_computed_unknown_shape(self):
        for field in ('arn', 'id', 'revision'):
            p = plan_fixture(); p['resource_changes'][0]['change']['after_unknown'][field] = {'nested': True}
            with self.subTest(field=field), self.assertRaises(deploy.ValidationError): self.guard(p)

    def test_reject_service_previously_using_different_task(self):
        p = plan_fixture(); p['resource_changes'][1]['change']['before']['task_definition'] = TASK + '0'
        with self.assertRaises(deploy.ValidationError): self.guard(p)

    def test_reject_missing_taskdef_fields(self):
        for field in ('container_definitions', 'execution_role_arn', 'family', 'cpu', 'memory', 'network_mode'):
            p = plan_fixture(); p['resource_changes'][0]['change']['after'].pop(field)
            with self.subTest(field=field), self.assertRaises(deploy.ValidationError): self.guard(p)

    def test_reject_multiple_api_containers(self):
        p = plan_fixture(); after = p['resource_changes'][0]['change']['after']
        containers = json.loads(after['container_definitions']); containers *= 2
        after['container_definitions'] = json.dumps(containers)
        with self.assertRaises(deploy.ValidationError): self.guard(p)

    def test_reject_managed_reads_and_data_mutations(self):
        for mode, actions in [('managed', ['read']), ('data', ['update'])]:
            p = plan_fixture(); p['resource_changes'].append({'address': 'other.fixture', 'mode': mode, 'change': {'actions': actions}})
            with self.assertRaises(deploy.ValidationError): self.guard(p)

    def test_reject_replacement_without_image_change(self):
        p = plan_fixture(); c = p['resource_changes'][0]['change']
        c['before']['container_definitions'] = c['after']['container_definitions']
        with self.assertRaises(deploy.ValidationError): self.guard(p)

    def test_reject_duplicate_addresses(self):
        p = plan_fixture(); p['resource_changes'].append(copy.deepcopy(p['resource_changes'][0]))
        with self.assertRaises(deploy.ValidationError): self.guard(p)

    def test_accept_latest_restorable_time_only_drift(self):
        p = plan_fixture()
        p["resource_drift"] = [
            {
                "address": "aws_db_instance.postgres",
                "mode": "managed",
                "type": "aws_db_instance",
                "name": "postgres",
                "change": {
                    "actions": ["update"],
                    "before": {
                        "identifier": "synthetic-staging-postgres",
                        "latest_restorable_time": "2026-10-23T12:00:00Z",
                    },
                    "after": {
                        "identifier": "synthetic-staging-postgres",
                        "latest_restorable_time": "2026-10-23T12:05:00Z",
                    },
                    "after_unknown": {},
                },
            }
        ]

        self.guard(p)

    def test_reject_latest_restorable_time_with_db_configuration_drift(self):
        p = plan_fixture()
        p["resource_drift"] = [
            {
                "address": "aws_db_instance.postgres",
                "mode": "managed",
                "type": "aws_db_instance",
                "name": "postgres",
                "change": {
                    "actions": ["update"],
                    "before": {
                        "identifier": "synthetic-staging-postgres",
                        "latest_restorable_time": "2026-10-23T12:00:00Z",
                        "backup_retention_period": 7,
                    },
                    "after": {
                        "identifier": "synthetic-staging-postgres",
                        "latest_restorable_time": "2026-10-23T12:05:00Z",
                        "backup_retention_period": 1,
                    },
                    "after_unknown": {},
                },
            }
        ]

        with self.assertRaises(deploy.ValidationError):
            self.guard(p)

    def _plan_with_role_snapshot(self):
        p = plan_fixture()

        policy = json.dumps({
            "Version": "2012-10-17",
            "Statement": [{
                "Effect": "Allow",
                "Action": "ecr:DescribeImages",
                "Resource": (
                    "arn:aws:ecr:us-east-1:890129487844:"
                    "repository/trailtasks-api"
                ),
            }],
        })

        role_before = {
            "name": "trailtasks-staging-github-deploy",
            "max_session_duration": 3600,
            "inline_policy": [],
        }
        role_after = copy.deepcopy(role_before)
        role_after["inline_policy"] = [
            {"name": "synthetic-inspect-policy", "policy": policy},
        ]

        p["resource_drift"] = [{
            "address": "aws_iam_role.github_staging_deploy",
            "mode": "managed",
            "type": "aws_iam_role",
            "name": "github_staging_deploy",
            "change": {
                "actions": ["update"],
                "before": role_before,
                "after": role_after,
                "after_unknown": {},
            },
        }]

        policy_values = {
            "name": "synthetic-inspect-policy",
            "role": "trailtasks-staging-github-deploy",
            "policy": policy,
        }

        for address, resource_type, name, values in (
            (
                "aws_iam_role.github_staging_deploy",
                "aws_iam_role",
                "github_staging_deploy",
                role_after,
            ),
            (
                "aws_iam_role_policy.synthetic_inspect",
                "aws_iam_role_policy",
                "synthetic_inspect",
                policy_values,
            ),
        ):
            p["resource_changes"].append({
                "address": address,
                "mode": "managed",
                "type": resource_type,
                "name": name,
                "change": {
                    "actions": ["no-op"],
                    "before": copy.deepcopy(values),
                    "after": copy.deepcopy(values),
                    "after_unknown": {},
                },
            })
            p["planned_values"]["root_module"]["resources"].append({
                "address": address,
                "values": copy.deepcopy(values),
            })

        return p

    def test_reject_role_snapshot_with_policy_content_mismatch(self):
        p = self._plan_with_role_snapshot()
        policy_address = "aws_iam_role_policy.synthetic_inspect"

        different_policy = json.dumps({
            "Version": "2012-10-17",
            "Statement": [],
        })

        # Keep the managed policy a no-op, but make its content disagree
        # with the policy reported in the refreshed role snapshot.
        for resource in p["resource_changes"]:
            if resource["address"] == policy_address:
                resource["change"]["before"]["policy"] = different_policy
                resource["change"]["after"]["policy"] = different_policy

        for resource in p["planned_values"]["root_module"]["resources"]:
            if resource["address"] == policy_address:
                resource["values"]["policy"] = different_policy

        with self.assertRaises(deploy.ValidationError):
            self.guard(p)

    def test_accept_role_snapshot_matching_unchanged_managed_policy(self):
        p = self._plan_with_role_snapshot()
        self.guard(p)

    def test_reject_role_snapshot_with_session_duration_drift(self):
        p = self._plan_with_role_snapshot()
        p["resource_drift"][0]["change"]["after"]["max_session_duration"] = 7200

        with self.assertRaises(deploy.ValidationError):
            self.guard(p)

    def test_accept_unset_optional_task_strings(self):
        for field in ("ipc_mode", "pid_mode", "task_role_arn"):
            with self.subTest(field=field):
                p = plan_fixture()
                change = p["resource_changes"][0]["change"]
                change["before"][field] = ""
                change["after"][field] = None

                self.guard(p)

    def test_reject_nonempty_optional_task_string_changes(self):
        changes = {
            "ipc_mode": "host",
            "pid_mode": "task",
            "task_role_arn": (
                "arn:aws:iam::890129487844:role/synthetic-other-role"
            ),
        }

        for field, value in changes.items():
            with self.subTest(field=field):
                p = plan_fixture()
                change = p["resource_changes"][0]["change"]
                change["before"][field] = ""
                change["after"][field] = value

                with self.assertRaises(deploy.ValidationError):
                    self.guard(p)

class RolloutTests(unittest.TestCase):
    def verify(self, s, t):
        deploy.verify_rollout(s, t, TASK, IMAGE, DIGEST)

    def test_accept_healthy_rollout(self):
        self.verify(*rollout_fixture())

    def test_reject_unhealthy_service(self):
        for key, value in [('desiredCount', 0), ('desiredCount', True), ('runningCount', 0),
                           ('pendingCount', 1), ('taskDefinition', TASK + '0'), ('deployments', [])]:
            s, t = rollout_fixture(); s['services'][0][key] = value
            with self.subTest(key=key), self.assertRaises(deploy.ValidationError): self.verify(s, t)

    def test_reject_bad_deployment(self):
        for key, value in [('status', 'ACTIVE'), ('rolloutState', 'IN_PROGRESS'), ('taskDefinition', TASK + '0')]:
            s, t = rollout_fixture(); s['services'][0]['deployments'][0][key] = value
            with self.assertRaises(deploy.ValidationError): self.verify(s, t)
        s, t = rollout_fixture(); s['services'][0]['deployments'] *= 2
        with self.assertRaises(deploy.ValidationError): self.verify(s, t)

    def test_reject_bad_task(self):
        for key, value in [('taskDefinitionArn', TASK + '0'), ('lastStatus', 'STOPPED'), ('containers', [])]:
            s, t = rollout_fixture(); t['tasks'][0][key] = value
            with self.assertRaises(deploy.ValidationError): self.verify(s, t)

    def test_reject_bad_container(self):
        for key, value in [('name', 'other'), ('lastStatus', 'PENDING'), ('image', OLD_IMAGE), ('imageDigest', 'sha256:' + 'd' * 64)]:
            s, t = rollout_fixture(); t['tasks'][0]['containers'][0][key] = value
            with self.assertRaises(deploy.ValidationError): self.verify(s, t)

    def test_reject_counts_failures_missing_fields(self):
        for target, key, value in [('s', 'failures', [{}]), ('t', 'failures', [{}]),
                                   ('s', 'services', []), ('t', 'tasks', []),
                                   ('s', 'services', None), ('t', 'tasks', None)]:
            s, t = rollout_fixture(); (s if target == 's' else t)[key] = value
            with self.assertRaises(deploy.ValidationError): self.verify(s, t)
        for target in ('s', 't'):
            s, t = rollout_fixture(); (s if target == 's' else t).pop('failures')
            with self.assertRaises(deploy.ValidationError): self.verify(s, t)

    def test_accept_multiple_distinct_running_tasks(self):
        s, t = rollout_fixture(); s['services'][0]['desiredCount'] = s['services'][0]['runningCount'] = 2
        second = copy.deepcopy(t['tasks'][0]); second['taskArn'] += '2'; t['tasks'].append(second)
        self.verify(s, t)

    def test_reject_missing_rollout_fields(self):
        for section, fields in [('service', ('taskDefinition', 'desiredCount', 'runningCount', 'pendingCount', 'deployments')),
                                ('deployment', ('status', 'rolloutState', 'taskDefinition')),
                                ('task', ('taskArn', 'taskDefinitionArn', 'lastStatus', 'containers')),
                                ('container', ('name', 'lastStatus', 'image', 'imageDigest'))]:
            for field in fields:
                s, t = rollout_fixture()
                targets = {'service': s['services'][0], 'deployment': s['services'][0]['deployments'][0],
                           'task': t['tasks'][0], 'container': t['tasks'][0]['containers'][0]}
                targets[section].pop(field)
                with self.subTest(section=section, field=field), self.assertRaises(deploy.ValidationError): self.verify(s, t)

    def test_reject_malformed_rollout_arguments(self):
        for task, image, digest in [('bad', IMAGE, DIGEST), (TASK, 'repo:latest', DIGEST), (TASK, IMAGE, 'bad')]:
            with self.assertRaises(deploy.ValidationError): deploy.verify_rollout(*rollout_fixture(), task, image, digest)

    def test_reject_duplicate_tasks(self):
        s, t = rollout_fixture(); s['services'][0]['desiredCount'] = s['services'][0]['runningCount'] = 2
        t['tasks'] *= 2
        with self.assertRaises(deploy.ValidationError): self.verify(s, t)


class CLITests(unittest.TestCase):
    def invoke(self, args):
        return subprocess.run([sys.executable, str(Path(__file__).with_name('staging_deploy.py')), *args],
                              capture_output=True, text=True)

    def test_guard_cli_success_and_secrecy(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'plan.json'; p = plan_fixture()
            path.write_text(json.dumps(p))
            args = ['guard-plan', str(path), '--image', IMAGE, '--execution-role', ROLE]
            self.assertEqual(self.invoke(args).returncode, 0)
            p['resource_changes'][0]['change']['after']['execution_role_arn'] = 'DO-NOT-PRINT-SECRET'
            path.write_text(json.dumps(p)); result = self.invoke(args)
            self.assertNotEqual(result.returncode, 0)
            self.assertNotIn('DO-NOT-PRINT-SECRET', result.stdout + result.stderr)
            self.assertNotIn('Traceback', result.stderr)
            path.write_text('{DO-NOT-PRINT-SECRET'); result = self.invoke(args)
            self.assertNotEqual(result.returncode, 0)
            self.assertNotIn('DO-NOT-PRINT-SECRET', result.stdout + result.stderr)

    def test_cli_sanitizes_io_usage_and_duplicate_json_errors(self):
        result = self.invoke(['guard-plan', '/nonexistent/DO-NOT-PRINT-SECRET', '--image', IMAGE, '--execution-role', ROLE])
        self.assertEqual(result.returncode, 1)
        self.assertNotIn('DO-NOT-PRINT-SECRET', result.stdout + result.stderr)
        result = self.invoke(['DO-NOT-PRINT-SECRET'])
        self.assertEqual(result.returncode, 2)
        self.assertNotIn('DO-NOT-PRINT-SECRET', result.stdout + result.stderr)
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'plan.json'
            path.write_text('{"format_version":"1.2","format_version":"DO-NOT-PRINT-SECRET"}')
            result = self.invoke(['guard-plan', str(path), '--image', IMAGE, '--execution-role', ROLE])
            self.assertEqual(result.returncode, 1)
            self.assertNotIn('DO-NOT-PRINT-SECRET', result.stdout + result.stderr)

    def test_verify_cli(self):
        with tempfile.TemporaryDirectory() as directory:
            s, t = rollout_fixture(); paths = [Path(directory) / n for n in ('service.json', 'tasks.json')]
            for path, value in zip(paths, (s, t)): path.write_text(json.dumps(value))
            result = self.invoke(['verify-rollout', *map(str, paths), '--task-definition', TASK,
                                  '--image', IMAGE, '--digest', DIGEST])
            self.assertEqual(result.returncode, 0, result.stderr)


if __name__ == '__main__':
    unittest.main()
