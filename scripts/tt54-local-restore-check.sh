#!/usr/bin/env bash
set -euo pipefail
umask 077

fail() {
  printf '%s\n' "$*" >&2
  exit 1
}

aws() {
  fail "TEST SAFETY BLOCK: AWS must not be called."
}

mode="restore-new"
database_name="trailtasks_restore_script_check"
output_path="/Users/jordan/Downloads/trailtasks-staging-download-check.dump"

[[ -f "$output_path" && -r "$output_path" ]] ||
  fail "The existing dump must be readable."

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

printf 'Preflight passed. No backup task or restore has started.\n'

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