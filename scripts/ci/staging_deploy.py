#!/usr/bin/env python3
"""Offline, fail-closed staging deploy checks. Python standard library only.

Inputs are Terraform `show -json` plans and AWS ECS describe-services/tasks JSON.
Success exits 0; invalid/unsupported input exits 1 (CLI usage exits 2). Neither
success nor errors print input values, paths, secret contents, or exception text.
Configuration must link the service task_definition directly to the API task ARN.
Computed task identifiers and unknown tags_all are deliberately not compared;
known tags_all, all other task fields, and non-task-definition service fields are.
"""
import argparse
import json
import re
import sys

TD = 'aws_ecs_task_definition.api'
SERVICE = 'aws_ecs_service.api'
TASK_COMPUTED = frozenset({'id', 'arn', 'arn_without_revision', 'revision'})
ECR_IMAGE = re.compile(r'890129487844\.dkr\.ecr\.us-east-1\.amazonaws\.com/trailtasks-api@sha256:[0-9a-f]{64}')
ROLE_ARN = re.compile(r'arn:aws(?:-us-gov|-cn)?:iam::[0-9]{12}:role/[A-Za-z0-9_+=,.@/-]+')
TASK_ARN = re.compile(r'arn:aws(?:-us-gov|-cn)?:ecs:[a-z0-9-]+:[0-9]{12}:task-definition/[A-Za-z0-9_-]+:[1-9][0-9]*')
DIGEST = re.compile(r'sha256:[0-9a-f]{64}')


class ValidationError(Exception):
    """Safe fixed diagnostic, with no source data attached."""


def require(condition):
    if not condition:
        raise ValidationError('deployment validation failed')


def obj(value):
    require(isinstance(value, dict))
    return value


def array(value):
    require(isinstance(value, list))
    return value


def matches(pattern, value):
    return isinstance(value, str) and pattern.fullmatch(value) is not None


def same(left, right):
    # Unlike Python equality, JSON equality here distinguishes bool from int.
    return json.dumps(left, sort_keys=True) == json.dumps(right, sort_keys=True)


def unknown_present(value):
    if isinstance(value, dict):
        return any(unknown_present(v) for v in value.values())
    if isinstance(value, list):
        return any(unknown_present(v) for v in value)
    require(value is True or value is False)
    return value is True


def check_unknown(change, allowed):
    unknown = obj(change.get('after_unknown'))
    for field, value in unknown.items():
        if unknown_present(value):
            require(field in allowed)
            if field != 'tags_all':
                require(value is True)
    return {field for field, value in unknown.items() if unknown_present(value)}


def resources(module):
    """Flatten Terraform module trees, rejecting malformed/duplicate entries."""
    module = obj(module)
    result = []
    for resource in array(module.get('resources', [])):
        result.append(obj(resource))
    for child in array(module.get('child_modules', [])):
        result.extend(resources(child))
    addresses = [r.get('address') for r in result]
    require(all(isinstance(a, str) for a in addresses))
    require(len(set(addresses)) == len(addresses))
    return result


def container_definitions(values):
    raw = obj(values).get('container_definitions')
    require(isinstance(raw, str))
    try:
        containers = json.loads(raw, object_pairs_hook=unique_object)
    except (ValueError, TypeError, RecursionError):
        raise ValidationError('deployment validation failed') from None
    require(isinstance(containers, list) and len(containers) == 1)
    container = obj(containers[0])
    require(container.get('name') == 'api')
    require(isinstance(container.get('image'), str))
    return container


def expected_task(values, image, role):
    values = obj(values)
    for field in ('family', 'cpu', 'memory', 'network_mode'):
        require(isinstance(values.get(field), str) and bool(values[field]))
    require(values.get('execution_role_arn') == role)
    require(container_definitions(values).get('image') == image)


def stripped(values, ignored):
    return {key: value for key, value in values.items() if key not in ignored}


def guard_plan(plan, image, execution_role):
    """Raise ValidationError unless the plan is a no-op or image-only deploy."""
    require(matches(ECR_IMAGE, image) and matches(ROLE_ARN, execution_role))
    plan = obj(plan)
    require(matches(re.compile(r'1\.[0-9]+'), plan.get('format_version')))
    require(plan.get('complete', True) is True and plan.get('errored', False) is False)
    require(not plan.get('deferred_changes'))
    for drift in array(plan.get('resource_drift', [])):
        require(obj(obj(drift).get('change')).get('actions') == ['no-op'])
    changes = array(plan.get('resource_changes'))
    require(bool(changes))
    indexed = {}
    mutations = set()
    for resource in changes:
        resource = obj(resource)
        address = resource.get('address')
        require(isinstance(address, str) and address not in indexed)
        indexed[address] = resource
        change = obj(resource.get('change'))
        actions = array(change.get('actions'))
        require(resource.get('mode') in ('managed', 'data'))
        if actions == ['no-op']:
            continue
        if actions == ['read'] and resource['mode'] == 'data':
            continue
        require(resource['mode'] == 'managed')
        if address == TD:
            require(actions in (['delete', 'create'], ['create', 'delete']))
        elif address == SERVICE:
            require(actions == ['update'])
        else:
            raise ValidationError('deployment validation failed')
        mutations.add(address)
    require(mutations in (set(), {TD, SERVICE}))
    require(TD in indexed and SERVICE in indexed)
    for address, expected_type in ((TD, 'aws_ecs_task_definition'), (SERVICE, 'aws_ecs_service')):
        resource = indexed[address]
        require(resource.get('mode') == 'managed' and resource.get('type') == expected_type)
        require(resource.get('name') == 'api')
        require(not resource.get('previous_address'))
    planned = {r['address']: r for r in resources(obj(plan.get('planned_values')).get('root_module'))}
    require(TD in planned and SERVICE in planned)
    td_change = indexed[TD]['change']
    service_change = indexed[SERVICE]['change']
    before, after = obj(td_change.get('before')), obj(td_change.get('after'))
    expected_task(after, image, execution_role)
    unknown = check_unknown(td_change, TASK_COMPUTED | {'tags_all'} if mutations else set())
    service_unknown_fields = check_unknown(service_change, {'task_definition'} if mutations else set())
    # Terraform values representations can omit unknowns or encode them as null.
    require(same(stripped(obj(planned[TD].get('values')), unknown), stripped(after, unknown)))
    require(same(stripped(obj(planned[SERVICE].get('values')), service_unknown_fields),
                 stripped(obj(service_change.get('after')), service_unknown_fields)))
    if not mutations:
        require(same(before, after))
        require(same(obj(service_change.get('before')), obj(service_change.get('after'))))
        require(matches(TASK_ARN, service_change['after'].get('task_definition')))
        require(service_change['after']['task_definition'] == after.get('arn'))
        return
    before_container = container_definitions(before)
    require(matches(TASK_ARN, before.get('arn')))
    require(obj(service_change.get('before')).get('task_definition') == before['arn'])
    after_container = container_definitions(after)
    require(before_container['image'] != image)
    require(same(stripped(before_container, {'image'}), stripped(after_container, {'image'})))
    ignored = TASK_COMPUTED | {'container_definitions'}
    if 'tags_all' in unknown:
        ignored |= {'tags_all'}
    require(same(stripped(before, ignored), stripped(after, ignored)))
    require(same(stripped(obj(service_change.get('before')), {'task_definition'}),
                 stripped(obj(service_change.get('after')), {'task_definition'})))
    # The replacement ARN is unknown at plan time. Require the precise HCL link,
    # not merely an unknown value which could originate in a different resource.
    configuration = obj(obj(plan.get('configuration')).get('root_module'))
    configured = [r for r in array(configuration.get('resources')) if obj(r).get('address') == SERVICE]
    require(len(configured) == 1)
    expression = obj(obj(configured[0].get('expressions')).get('task_definition'))
    refs = array(expression.get('references'))
    require(TD + '.arn' in refs and all(ref in (TD, TD + '.arn') for ref in refs))
    require('constant_value' not in expression)
    service_unknown = obj(service_change.get('after_unknown'))
    require(service_unknown.get('task_definition') is True)
    require(service_change['after'].get('task_definition') is None)


def verify_rollout(service_document, tasks_document, task_definition, image, digest):
    """Validate describe-services/tasks snapshots for the exact deployed image."""
    require(matches(TASK_ARN, task_definition) and matches(ECR_IMAGE, image) and matches(DIGEST, digest))
    service_document, tasks_document = obj(service_document), obj(tasks_document)
    require(service_document.get('failures') == [] and tasks_document.get('failures') == [])
    services = array(service_document.get('services'))
    require(len(services) == 1)
    service = obj(services[0])
    require(service.get('taskDefinition') == task_definition)
    desired = service.get('desiredCount')
    require(type(desired) is int and desired >= 1)
    require(type(service.get('runningCount')) is int and service['runningCount'] == desired)
    require(type(service.get('pendingCount')) is int and service['pendingCount'] == 0)
    deployments = array(service.get('deployments'))
    require(len(deployments) == 1)
    deployment = obj(deployments[0])
    require(deployment.get('status') == 'PRIMARY' and deployment.get('rolloutState') == 'COMPLETED')
    require(deployment.get('taskDefinition') == task_definition)
    tasks = array(tasks_document.get('tasks'))
    require(len(tasks) == desired)
    seen = set()
    for task in tasks:
        task = obj(task)
        arn = task.get('taskArn')
        require(isinstance(arn, str) and bool(arn) and arn not in seen)
        seen.add(arn)
        require(task.get('taskDefinitionArn') == task_definition and task.get('lastStatus') == 'RUNNING')
        containers = array(task.get('containers'))
        require(len(containers) == 1)
        container = obj(containers[0])
        require(container.get('name') == 'api' and container.get('lastStatus') == 'RUNNING')
        require(container.get('image') == image and container.get('imageDigest') == digest)


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        require(key not in result)
        result[key] = value
    return result


def load_document(path):
    with open(path, encoding='utf-8') as handle:
        return json.load(handle, object_pairs_hook=unique_object,
                         parse_constant=lambda _: require(False))


class SafeParser(argparse.ArgumentParser):
    def error(self, message):
        # argparse's default error includes arbitrary command-line values.
        self.exit(2, 'invalid command arguments\n')


def main(argv=None):
    parser = SafeParser(description=__doc__)
    commands = parser.add_subparsers(dest='command', required=True)
    guard = commands.add_parser('guard-plan')
    guard.add_argument('plan')
    guard.add_argument('--image', required=True)
    guard.add_argument('--execution-role', required=True)
    verify = commands.add_parser('verify-rollout')
    verify.add_argument('service')
    verify.add_argument('tasks')
    verify.add_argument('--task-definition', required=True)
    verify.add_argument('--image', required=True)
    verify.add_argument('--digest', required=True)
    args = parser.parse_args(argv)
    try:
        if args.command == 'guard-plan':
            guard_plan(load_document(args.plan), args.image, args.execution_role)
        else:
            verify_rollout(load_document(args.service), load_document(args.tasks),
                           args.task_definition, args.image, args.digest)
    except (ValidationError, OSError, ValueError, TypeError, KeyError, RecursionError):
        print('deployment validation failed', file=sys.stderr)
        return 1
    print('deployment validation passed')
    return 0


if __name__ == '__main__':
    sys.exit(main())
