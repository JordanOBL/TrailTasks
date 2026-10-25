# shellcheck shell=bash
# Parent entrypoint supplies these validated globals; this is not a standalone CLI.
# shellcheck disable=SC2154
# Local-only operations for refresh-local-from-staging.sh. No standalone CLI.
# Call functions directly under set -e: never use `if ! function` (errexit suppression).
local_compose() {
  # Resolve once and pin every command to this container ID, not a movable service name.
  docker --context desktop-linux exec -i "$local_container" "$@"
}

local_psql() {
  local_compose psql -X --host=/var/run/postgresql --username=postgres \
    --dbname=postgres --set=ON_ERROR_STOP=1 --tuples-only --no-align "$@" < /dev/null
}

verify_local_container() {
  local endpoint
  [[ -z "${DOCKER_HOST:-}" && -z "${DOCKER_CONTEXT:-}" ]] ||
    fail 'Unset DOCKER_HOST and DOCKER_CONTEXT before local restore operations.'
  endpoint="$(docker context inspect desktop-linux --format '{{.Endpoints.docker.Host}}')" || return 1
  [[ "$endpoint" == "unix://$HOME/.docker/run/docker.sock" ]] ||
    fail 'Expected the verified local Docker Desktop socket.'
  # Do not collect or print Config.Env (contains the local password).
  docker --context desktop-linux inspect --type container \
    --format '[{"Id":{{json .Id}},"State":{"Running":{{json .State.Running}}},"Config":{"Image":{{json .Config.Image}},"Labels":{{json .Config.Labels}}},"Mounts":{{json .Mounts}},"NetworkSettings":{"Ports":{{json .NetworkSettings.Ports}}}}]' \
    "$local_container" | python3 "$script_dir/lib/refresh_local_guard.py" "$local_container" || return 1
}

database_oid() {
  local_psql --command "SELECT oid FROM pg_database WHERE datname = '$database_name'"
}

require_same_database() {
  local current_oid
  current_oid="$(database_oid)"
  [[ "$current_oid" == "$original_oid" ]] ||
    fail 'Local database identity changed. Refusing to replace a different database.'
}

require_idle_database() {
  local connections
  connections="$(local_psql --command "SELECT count(*) FROM pg_stat_activity WHERE datname = '$database_name'")"
  [[ "$connections" == '0' ]] ||
    fail 'Target database is in use. Stop the local API and all clients before retrying; no connections were terminated.'
}

recovery_instructions() {
  printf '\nSafety backup: %s\n' "$backup_path" >&2
  printf 'Staging archive (if downloaded): %s\n' "$output_path" >&2
  printf 'Recovery: keep the API stopped. After verifying the same local Docker context/container,\n' >&2
  printf 'restore this safety backup into a NEW empty local database (never over a partial restore):\n' >&2
  printf '  docker --context desktop-linux exec -i %q createdb --host=/var/run/postgresql --username=postgres --template=template0 trailtasks_recovery\n' "$local_container" >&2
  printf '  docker --context desktop-linux exec -i %q pg_restore --host=/var/run/postgresql --username=postgres --dbname=trailtasks_recovery --no-owner --no-privileges --single-transaction --exit-on-error < %q\n' "$local_container" "$backup_path" >&2
  printf 'Use a different unused trailtasks_ name if trailtasks_recovery exists. Validate recovered data before reconnecting clients.\n' >&2
  printf 'Archive catalog readability is NOT proof of a complete recovery.\n' >&2
}

replace_cleanup() {
  local status=$?
  trap - EXIT
  if [[ -n "$backup_tmp" ]]; then
    rm -f -- "$backup_tmp"
  fi
  # If DROP failed, restore connectivity only to the exact original database.
  # Never turn connections on for a newly-created/different database.
  if [[ "$connections_blocked" == '1' && "$database_dropped" == '0' ]]; then
    # Subshell keeps fail() from aborting the cleanup/recovery report. The guard
    # explicitly propagates every tool failure even in a conditional context.
    if (verify_local_container) && current_oid="$(database_oid)" && [[ "$current_oid" == "$original_oid" ]]; then
      if ! local_psql --command "ALTER DATABASE \"$database_name\" ALLOW_CONNECTIONS true" >/dev/null; then
        printf 'WARNING: reconnecting the original database failed. Re-enable ALLOW_CONNECTIONS manually after local identity verification.\n' >&2
      fi
    else
      printf 'WARNING: local context/container/database identity unavailable; no recovery write attempted. Original database may still have ALLOW_CONNECTIONS false. Verify locally before manually re-enabling it.\n' >&2
    fi
  fi
  if [[ "$backup_saved" == '1' ]]; then
    recovery_instructions
  fi
  if ! rmdir -- "$lock_path"; then
    printf 'WARNING: could not release local refresh lock: %s\n' "$lock_path" >&2
    status=1
  fi
  exit "$status"
}

acquire_target_lock() {
  lock_path="$HOME/.trailtasks-db-refresh-locks/$local_container-$database_name.lock"
  python3 -c '
import os, stat, sys
path = sys.argv[1]
base = os.path.dirname(path)
try:
    os.mkdir(base, 0o700)
except FileExistsError:
    pass
info = os.lstat(base)
if not stat.S_ISDIR(info.st_mode) or info.st_uid != os.getuid() or stat.S_IMODE(info.st_mode) != 0o700:
    sys.exit("Refresh lock directory must be a private, owned directory (0700), not a symlink.")
try:
    os.mkdir(path, 0o700)
except FileExistsError:
    sys.exit("Local refresh lock already exists: " + path + ". No automatic stale-lock breaking: verify no refresh is running before manually removing this directory.")
' "$lock_path"
  backup_tmp=''
  backup_saved=0
  connections_blocked=0
  database_dropped=0
  trap replace_cleanup EXIT
  trap 'exit 130' INT
  trap 'exit 143' TERM
}

prepare_local_destination() {
  command -v docker >/dev/null 2>&1 || fail 'Docker is required for local restore operations.'
  [[ -z "${DOCKER_HOST:-}" && -z "${DOCKER_CONTEXT:-}" ]] ||
    fail 'Unset DOCKER_HOST and DOCKER_CONTEXT before local restore operations.'
  local endpoint
  endpoint="$(docker context inspect desktop-linux --format '{{.Endpoints.docker.Host}}')"
  [[ "$endpoint" == "unix://$HOME/.docker/run/docker.sock" ]] ||
    fail 'Expected the verified local Docker Desktop socket.'
  compose_file="$script_dir/../infra/docker/postgres/compose.yml"
  [[ -f "$compose_file" ]] || fail 'Local PostgreSQL Compose configuration was not found.'
  local_container="$(docker --context desktop-linux compose --project-name postgres -f "$compose_file" ps -q postgres)"
  [[ "$local_container" =~ ^[a-f0-9]{64}$ ]] || fail 'Expected exactly one running local PostgreSQL container.'
  verify_local_container
  # Serialize both restore modes before querying or backing up this target.
  # A killed process leaves a fail-closed stale lock; never auto-break it.
  acquire_target_lock
  local server_version
  server_version="$(local_psql --command 'SHOW server_version_num')"
  [[ "$server_version" =~ ^16[0-9]{4}$ ]] || fail 'Expected a PostgreSQL 16 destination.'
  original_oid="$(database_oid)"
  if [[ "$mode" == 'restore-new' ]]; then
    [[ -z "$original_oid" ]] || fail 'Database already exists. restore-new will not overwrite it.'
    return
  fi
  [[ "$original_oid" =~ ^[0-9]+$ ]] || fail 'replace requires an existing local target database.'
  backup_path="$output_path.before-$database_name.dump"
  [[ ! -e "$backup_path" && ! -L "$backup_path" ]] || fail 'Safety backup path already exists. Choose a new --output path.'
  printf 'Stop the local API and ALL database clients; keep them stopped until this command finishes.\n' >&2
  printf 'Replace local database %s? Type its exact name to confirm: ' "$database_name" >&2
  local confirmation
  IFS= read -r confirmation || fail 'Confirmation cancelled. Nothing was replaced.'
  [[ "$confirmation" == "$database_name" ]] || fail 'Confirmation did not match. Nothing was replaced.'
  require_idle_database
  backup_tmp="$(mktemp "$output_dir/.tt54-backup.XXXXXX")"
  # pg_dump is a consistent snapshot; operator must keep writers stopped.
  local_compose pg_dump --host=/var/run/postgresql --username=postgres \
    --dbname="$database_name" --format=custom --no-owner --no-privileges \
    --lock-wait-timeout=30s < /dev/null > "$backup_tmp"
  python3 -c '
import os, sys
source, destination = sys.argv[1:]
with open(source, "rb") as handle:
    if handle.read(5) != b"PGDMP" or os.fstat(handle.fileno()).st_size <= 5:
        sys.exit("Local safety backup is not a nonempty custom-format archive.")
# Atomic no-overwrite, including symlinks and races. Remains private (umask 077).
try:
    os.link(source, destination)
except FileExistsError:
    sys.exit("Safety backup path appeared during backup. Refusing to overwrite it.")
' "$backup_tmp" "$backup_path"
  backup_saved=1
  rm -f -- "$backup_tmp"
  backup_tmp=''
  printf 'Private local safety backup saved BEFORE cloud export: %s\n' "$backup_path"
  local_compose pg_restore --list < "$backup_path" >/dev/null
}

replace_existing_database() {
  # Everything up to DROP is nondestructive. No --force and no backend termination.
  verify_local_container
  require_same_database
  require_idle_database
  # Prevent new connections in the narrow window preceding DROP. A late connection
  # is detected by the next idle check, or DROP itself refuses it. Cleanup unblocks
  # the original database on failure; it never deletes anything to recover.
  connections_blocked=1
  local_psql --command "ALTER DATABASE \"$database_name\" ALLOW_CONNECTIONS false" >/dev/null
  require_same_database
  require_idle_database
  local_compose dropdb --host=/var/run/postgresql --username=postgres \
    --maintenance-db=postgres "$database_name" < /dev/null
  database_dropped=1
  connections_blocked=0
}
