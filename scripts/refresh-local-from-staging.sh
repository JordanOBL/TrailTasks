#!/usr/bin/env bash
set -euo pipefail
umask 077

fail() {
	printf '%s\n' "$*" >&2
	exit 1
}

mode="${1:-}"

case "$mode" in
  dump|restore-new|replace)
    shift
    ;;
  -h|--help)
    printf 'Usage:%s <dump|restore-new|replace> --output PATH [--database NAME]\n' "$0"
    exit 0
    ;;
  *)
    printf 'Expected a command: dump, restore-new, or replace.\n' >&2
    exit 2
    ;;
esac

output_path=""
database_name=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --output)
			if [[ $# -lt 2 || -z "$2" || "$2" == -* ]]; then
        printf '%s\n' '--output requires a path.' >&2
        exit 2
      fi

      output_path="$2"
      shift 2
      ;;
    --database)
			if [[ $# -lt 2 || -z "$2" || "$2" == -* ]]; then
        printf '%s\n' '--database requires a name.' >&2
        exit 2
      fi

      database_name="$2"
      shift 2
      ;;
		*)
      printf 'Unknown option: %s\n' "$1" >&2
      exit 2
      ;;
  esac
done

if [[ -z "$output_path" ]]; then
  printf '%s\n' '--output is required.' >&2
  exit 2
fi

if [[ "$mode" == "dump" && -n "$database_name" ]]; then
  printf '%s\n' 'dump does not accept --database.' >&2
  exit 2
fi

if [[ "$mode" != "dump" && -z "$database_name" ]]; then
  printf '%s\n' 'restore-new and replace require --database.' >&2
  exit 2
fi

if [[ "$mode" == "replace" ]]; then
  fail "replace is not implemented yet."
fi

if [[ "$mode" == "restore-new" ]]; then
  if [[ ! "$database_name" =~ ^trailtasks_[a-z0-9_]+$ ||
        ${#database_name} -gt 63 ]]; then
    fail "Database names must start with trailtasks_, contain only lowercase letters, digits, and underscores, and be at most 63 characters."
  fi
fi

if [[ -e "$output_path" || -L "$output_path" ]]; then
  fail "Output already exists. Choose a new dump filename."
fi

output_dir="$(dirname "$output_path")"

if [[ ! -d "$output_dir" || ! -w "$output_dir" ]]; then
  fail "The output directory must already exist and be writable."
fi

for tool in aws python3; do
  command -v "$tool" >/dev/null 2>&1 ||
    fail "Missing required tool: $tool"
done

local_compose() {
  docker --context desktop-linux compose \
    --project-name postgres \
    -f "$compose_file" \
    exec -T postgres "$@"
}

local_psql() {
  local_compose psql -X \
    --host=/var/run/postgresql \
    --username=postgres \
    --dbname=postgres \
    --set=ON_ERROR_STOP=1 \
    "$@"
}

if [[ "$mode" == "restore-new" ]]; then
  command -v docker >/dev/null 2>&1 ||
    fail "Docker is required for local restore operations."

  if [[ -n "${DOCKER_HOST:-}" || -n "${DOCKER_CONTEXT:-}" ]]; then
    fail "Unset DOCKER_HOST and DOCKER_CONTEXT before local restore operations."
  fi

  docker_endpoint="$(docker context inspect desktop-linux \
    --format '{{.Endpoints.docker.Host}}')"

  if [[ "$docker_endpoint" != "unix://$HOME/.docker/run/docker.sock" ]]; then
    fail "Expected the verified local Docker Desktop socket."
  fi

  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  compose_file="$script_dir/../infra/docker/postgres/compose.yml"

  [[ -f "$compose_file" ]] ||
    fail "Local PostgreSQL Compose configuration was not found."

  server_version="$(local_psql \
    --tuples-only --no-align \
    --command 'SHOW server_version_num')"

  [[ "$server_version" =~ ^16[0-9]{4}$ ]] ||
    fail "Expected a PostgreSQL 16 destination."

  database_exists="$(local_psql \
    --tuples-only --no-align \
    --command "SELECT 1 FROM pg_database WHERE datname = '$database_name'")"

  [[ -z "$database_exists" ]] ||
    fail "Database already exists. restore-new will not overwrite it."
fi

readonly AWS_PROFILE_NAME="trailtasks-terraform"
readonly AWS_REGION_NAME="us-east-1"
readonly EXPECTED_ACCOUNT="890129487844"

if ! account="$(aws sts get-caller-identity \
  --profile "$AWS_PROFILE_NAME" \
  --region "$AWS_REGION_NAME" \
  --query Account \
  --output text)"; then
  fail "AWS authentication failed. Refresh your AWS login and retry."
fi

if [[ "$account" != "$EXPECTED_ACCOUNT" ]]; then
  fail "Refusing to use an unexpected AWS account."
fi

printf 'Preflight passed. No backup task or restore has started.\n'

readonly ECS_CLUSTER_NAME="trailtasks-staging"
readonly ECS_SERVICE_NAME="trailtasks-staging-api"

service_json="$(aws ecs describe-services \
  --cluster "$ECS_CLUSTER_NAME" \
  --services "$ECS_SERVICE_NAME" \
  --profile "$AWS_PROFILE_NAME" \
  --region "$AWS_REGION_NAME" \
  --query '{failures:failures,services:services[].{taskDefinition:taskDefinition,network:networkConfiguration.awsvpcConfiguration}}' \
  --output json)"

task_definition="$(printf '%s' "$service_json" | python3 -c '
import json
import sys

document = json.load(sys.stdin)
services = document.get("services", [])

if document.get("failures") != [] or len(services) != 1:
    sys.exit("Expected exactly one staging service and no lookup failures.")

arn = services[0].get("taskDefinition")
if not isinstance(arn, str) or not arn:
    sys.exit("The staging service has no task-definition ARN.")

print(arn)
')"

task_json="$(aws ecs describe-task-definition \
  --task-definition "$task_definition" \
  --profile "$AWS_PROFILE_NAME" \
  --region "$AWS_REGION_NAME" \
  --query 'taskDefinition.{taskDefinition:taskDefinitionArn,cpu:cpu,memory:memory,executionRole:executionRoleArn,taskRole:taskRoleArn,containers:containerDefinitions[].{name:name,image:image,entryPoint:entryPoint,command:command}}' \
  --output json)"

printf '\nStaging service networking:\n'
printf '%s\n' "$service_json"

printf '\nCurrent task configuration:\n'
printf '%s\n' "$task_json"

export_id="$(python3 -c 'import uuid; print(uuid.uuid4().hex)')"

request_json="$(printf '%s' "$service_json" | python3 -c '
import json
import sys

document = json.load(sys.stdin)
services = document.get("services", [])

if document.get("failures") != [] or len(services) != 1:
    sys.exit("Expected exactly one staging service and no failures.")

network = services[0].get("network") or {}

if network.get("assignPublicIp") != "DISABLED":
    sys.exit("Expected private networking with public IP assignment disabled.")

for field in ("subnets", "securityGroups"):
    values = network.get(field)
    if not isinstance(values, list) or not values:
        sys.exit("Missing required staging network configuration.")
    if not all(isinstance(value, str) and value for value in values):
        sys.exit("Invalid staging network configuration.")

export_id = sys.argv[1]

request = {
    "cluster": "trailtasks-staging",
    "taskDefinition": "arn:aws:ecs:us-east-1:890129487844:task-definition/trailtasks-staging-db-export:1",
    "launchType": "FARGATE",
    "platformVersion": "LATEST",
    "count": 1,
    "enableExecuteCommand": False,
    "startedBy": "TT54-db-export",
    "clientToken": export_id,
    "networkConfiguration": {
        "awsvpcConfiguration": {
            "subnets": network["subnets"],
            "securityGroups": network["securityGroups"],
            "assignPublicIp": "DISABLED",
        }
    },
    "overrides": {
        "containerOverrides": [
            {
                "name": "db-export",
                "environment": [
                    {"name": "EXPORT_ID", "value": export_id}
                ],
            }
        ]
    },
}

print(json.dumps(request, indent=2))
' "$export_id")"

printf '\nPrepared task request—NOT launched:\n%s\n' "$request_json"

run_dir="$(mktemp -d "${TMPDIR:-/tmp}/tt54-export-run.XXXXXX")"

printf '%s\n' "$request_json" > "$run_dir/request.json"
printf '\nRun records: %s\n' "$run_dir"
printf 'Launching one staging export task.\n'

aws ecs run-task \
  --cli-input-json "file://$run_dir/request.json" \
  --profile "$AWS_PROFILE_NAME" \
  --region "$AWS_REGION_NAME" \
  --query '{failures:failures,tasks:tasks[].{taskArn:taskArn,lastStatus:lastStatus}}' \
  --output json \
  > "$run_dir/launch.json"

task_arn="$(python3 -c '
import json
import sys

with open(sys.argv[1]) as handle:
    response = json.load(handle)

tasks = response.get("tasks", [])

if response.get("failures") != [] or len(tasks) != 1:
    sys.exit("Launch did not return exactly one task without failures. Inspect the saved launch response.")

arn = tasks[0].get("taskArn")
if not isinstance(arn, str) or not arn:
    sys.exit("The launch response contains no task ARN.")

print(arn)
' "$run_dir/launch.json")"

printf 'Task: %s\n' "$task_arn"
printf 'Export ID: %s\n' "$export_id"

aws ecs wait tasks-stopped \
  --cluster "$ECS_CLUSTER_NAME" \
  --tasks "$task_arn" \
  --profile "$AWS_PROFILE_NAME" \
  --region "$AWS_REGION_NAME"

aws ecs describe-tasks \
  --cluster "$ECS_CLUSTER_NAME" \
  --tasks "$task_arn" \
  --profile "$AWS_PROFILE_NAME" \
  --region "$AWS_REGION_NAME" \
  --query '{failures:failures,tasks:tasks[].{taskArn:taskArn,status:lastStatus,stoppedReason:stoppedReason,containers:containers[].{name:name,exitCode:exitCode,reason:reason}}}' \
  --output json \
  > "$run_dir/completion.json"

python3 -m json.tool "$run_dir/completion.json"

python3 -c '
import json
import sys

completion_path, expected_task_arn = sys.argv[1:]

with open(completion_path) as handle:
    response = json.load(handle)

tasks = response.get("tasks", [])

if response.get("failures") != [] or len(tasks) != 1:
    sys.exit("Expected exactly one completed task and no lookup failures.")

task = tasks[0]

if task.get("taskArn") != expected_task_arn:
    sys.exit("Completion response does not match the launched task.")

if task.get("status") != "STOPPED":
    sys.exit("The export task has not stopped.")

containers = task.get("containers", [])

if not isinstance(containers, list) or len(containers) != 1:
    sys.exit("Expected exactly one export container.")

container = containers[0]

if container.get("name") != "db-export":
    sys.exit("Unexpected export container name.")

exit_code = container.get("exitCode")

if type(exit_code) is not int or exit_code != 0:
    sys.exit("Export container did not finish with exitCode 0. Inspect the run records.")

print("Export task completed successfully. Download is not yet verified.")
' "$run_dir/completion.json" "$task_arn"

readonly EXPORT_BUCKET="trailtasks-s3"
export_key="staging-db-exports/$export_id/staging.dump"

aws s3api head-object \
  --bucket "$EXPORT_BUCKET" \
  --key "$export_key" \
  --profile "$AWS_PROFILE_NAME" \
  --region "$AWS_REGION_NAME" \
  --query '{ContentLength:ContentLength,ServerSideEncryption:ServerSideEncryption}' \
  --output json \
  > "$run_dir/object.json"

expected_size="$(python3 -c '
import json
import sys

with open(sys.argv[1]) as handle:
    metadata = json.load(handle)

size = metadata.get("ContentLength")

if type(size) is not int or size <= 0:
    sys.exit("The export object has no valid positive size.")

if metadata.get("ServerSideEncryption") != "AES256":
    sys.exit("The export object does not have the expected AES256 encryption.")

print(size)
' "$run_dir/object.json")"

(
  download_tmp=""

  cleanup_download() {
    if [[ -n "$download_tmp" ]]; then
      rm -f -- "$download_tmp"
    fi
  }

  trap cleanup_download EXIT

  download_tmp="$(mktemp "$output_dir/.tt54-download.XXXXXX")"

  aws s3 cp \
    "s3://$EXPORT_BUCKET/$export_key" \
    "$download_tmp" \
    --profile "$AWS_PROFILE_NAME" \
    --region "$AWS_REGION_NAME" \
    --only-show-errors

  python3 -c '
import os
import sys

temporary_path, final_path, expected_size_text = sys.argv[1:]
expected_size = int(expected_size_text)

with open(temporary_path, "rb") as handle:
    actual_size = os.fstat(handle.fileno()).st_size
    signature = handle.read(5)

if actual_size <= 0 or actual_size != expected_size:
    sys.exit("Downloaded size does not match the export object.")

if signature != b"PGDMP":
    sys.exit("Downloaded file is not a PostgreSQL custom-format archive.")

try:
    os.link(temporary_path, final_path)
except FileExistsError:
    sys.exit("Output already exists. Refusing to overwrite it.")
' "$download_tmp" "$output_path" "$expected_size"
)

printf 'Download verified and saved: %s\n' "$output_path"

if [[ "$mode" == "restore-new" ]]; then
  printf 'Creating new local database: %s\n' "$database_name"

  local_compose createdb \
    --host=/var/run/postgresql \
    --username=postgres \
    --maintenance-db=postgres \
    --template=template0 \
    "$database_name"

  local_compose pg_restore \
    --host=/var/run/postgresql \
    --username=postgres \
    --dbname="$database_name" \
    --no-owner \
    --no-privileges \
    --single-transaction \
    --exit-on-error \
    < "$output_path"

  printf 'Restore completed into new local database: %s\n' "$database_name"
fi

printf 'Command: %s\n' "$mode"
printf 'Output: %s\n' "$output_path"
printf 'Database: %s\n' "${database_name:-not applicable}"
