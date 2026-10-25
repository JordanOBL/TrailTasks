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
			[[ -z "$output_path" ]] || fail 'Duplicate --output option.'
			if [[ $# -lt 2 || -z "$2" || "$2" == -* ]]; then
        printf '%s\n' '--output requires a path.' >&2
        exit 2
      fi

      output_path="$2"
      shift 2
      ;;
    --database)
			[[ -z "$database_name" ]] || fail 'Duplicate --database option.'
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

if [[ "$mode" != "dump" ]]; then
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

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Only load a fixed repository-relative helper, never user-selected code.
# shellcheck source=scripts/lib/refresh-local.sh
source "$script_dir/lib/refresh-local.sh"

if [[ "$mode" != "dump" ]]; then
  prepare_local_destination
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

printf 'Preflight passed. No cloud export task or restore has started.\n'

readonly ECS_CLUSTER_NAME="trailtasks-staging"
readonly ECS_SERVICE_NAME="trailtasks-staging-api"

service_json="$(aws ecs describe-services \
  --cluster "$ECS_CLUSTER_NAME" \
  --services "$ECS_SERVICE_NAME" \
  --profile "$AWS_PROFILE_NAME" \
  --region "$AWS_REGION_NAME" \
  --query '{failures:failures,services:services[].{taskDefinition:taskDefinition,network:networkConfiguration.awsvpcConfiguration}}' \
  --output json)"

printf '%s' "$service_json" | python3 -c '
import json
import sys

document = json.load(sys.stdin)
services = document.get("services", [])

if document.get("failures") != [] or len(services) != 1:
    sys.exit("Expected exactly one staging service and no lookup failures.")

arn = services[0].get("taskDefinition")
if not isinstance(arn, str) or not arn:
    sys.exit("The staging service has no task-definition ARN.")

' > /dev/null


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
import re
import sys

with open(sys.argv[1]) as handle:
    response = json.load(handle)

tasks = response.get("tasks", [])

if response.get("failures") != [] or len(tasks) != 1:
    sys.exit("Launch did not return exactly one task without failures. Inspect the saved launch response.")

arn = tasks[0].get("taskArn")
if not isinstance(arn, str) or not re.fullmatch(r"arn:aws:ecs:us-east-1:890129487844:task/trailtasks-staging/[a-zA-Z0-9-]+", arn):
    sys.exit("Launch response is not a task in the expected staging account/region/cluster.")

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

  # Called indirectly by the EXIT trap.
  # shellcheck disable=SC2329
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

if [[ "$mode" != "dump" ]]; then
  verify_local_container
  # Catalog preflight before any DROP. This is not a full recovery proof.
  local_compose pg_restore --list < "$output_path" >/dev/null
  if [[ "$mode" == "replace" ]]; then
    replace_existing_database
  fi
  printf 'Creating new local database: %s\n' "$database_name"

  local_compose createdb \
    --host=/var/run/postgresql \
    --username=postgres \
    --maintenance-db=postgres \
    --template=template0 \
    "$database_name" < /dev/null

  local_compose pg_restore \
    --host=/var/run/postgresql \
    --username=postgres \
    --dbname="$database_name" \
    --no-owner \
    --no-privileges \
    --single-transaction \
    --exit-on-error \
    < "$output_path"

  printf 'Restore completed into empty local database: %s\n' "$database_name"
fi

printf 'Command: %s\n' "$mode"
printf 'Output: %s\n' "$output_path"
printf 'Database: %s\n' "${database_name:-not applicable}"
