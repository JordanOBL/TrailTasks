import json
import pathlib
import sys

script_path = pathlib.Path(__file__).with_name("inspect-staging-schema.mjs")
overrides = {
    "containerOverrides": [{
        "name": "api",
        "command": [
            "node", "--input-type=module", "--eval",
            script_path.read_text(),
        ],
    }],
}

if len(json.dumps(overrides)) > 8192:
    raise SystemExit("Override exceeds the ECS size limit.")

request = {
    "cluster": "trailtasks-staging",
    "taskDefinition": "arn:aws:ecs:us-east-1:890129487844:task-definition/trailtasks-staging-api:8",
    "launchType": "FARGATE",
    "platformVersion": "LATEST",
    "count": 1,
    "startedBy": "TT48-schema-inspection",
    "enableExecuteCommand": False,
    "enableECSManagedTags": False,
    "networkConfiguration": {
        "awsvpcConfiguration": {
            "subnets": [
                "subnet-02603fae968ea2a7f",
                "subnet-01f96649e62768311",
            ],
            "securityGroups": ["sg-08683e12c4632fe7c"],
            "assignPublicIp": "DISABLED",
        },
    },
    "overrides": overrides,
}

directory = pathlib.Path(sys.argv[1])
if not sys.argv[1] or not directory.is_dir():
    raise SystemExit("Inspection output directory is missing.")

output = directory / "run-task.json"
output.write_text(json.dumps(request, indent=2))
print(output.read_text())