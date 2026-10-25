#!/usr/bin/env bash
set -euo pipefail
umask 077

: "${PGHOST:?PGHOST is required}"
: "${PGPORT:?PGPORT is required}"
: "${PGDBNAME:?PGDBNAME is required}"
: "${PGUSER:?PGUSER is required}"
: "${PGPASSWORD:?PGPASSWORD is required}"
: "${AWS_REGION:?AWS_REGION is required}"
: "${EXPORT_ID:?EXPORT_ID is required}"

if [[ ! "$EXPORT_ID" =~ ^[a-f0-9]{32}$ ]]; then
  printf 'EXPORT_ID must contain exactly 32 lowercase hexadecimal characters.\n' >&2
  exit 2
fi

export PGDATABASE="$PGDBNAME"
export PGSSLMODE="require"
export PGCONNECT_TIMEOUT="15"

work_dir="$(mktemp -d /tmp/trailtasks-export.XXXXXX)"
trap 'rm -rf -- "$work_dir"' EXIT

dump_path="$work_dir/staging.dump"
destination="s3://trailtasks-s3/staging-db-exports/$EXPORT_ID/staging.dump"

printf 'Creating staging database export.\n'

pg_dump \
  --format=custom \
  --no-owner \
  --no-privileges \
  --lock-wait-timeout=30s \
  --file "$dump_path"

pg_restore --list "$dump_path" >/dev/null

printf 'Uploading completed archive.\n'

aws s3 cp \
  "$dump_path" \
  "$destination" \
  --region "$AWS_REGION" \
  --sse AES256 \
  --only-show-errors \
  --no-progress

printf 'Export upload completed.\n'