# Local PostgreSQL and on-demand staging refresh (TT-54)

## Purpose and boundaries

Jordan's workflow: “I want a staging copy on my Mac for development, without
changing staging or losing the local database I already have.”

This tool exports **API PostgreSQL**, not mobile WatermelonDB. It is an on-demand
developer tool, not mandatory scheduled production `pg_dump` infrastructure.
RDS automated backups/snapshots/PITR remain the intended primary production
recovery mechanism. Local → staging → production is the MVP path; a separate
preprod environment remains deferred.

A server restore can recover only server-synced data. It cannot recover unsynced
mobile sessions or other device-only changes. Do not reset WatermelonDB, change
its migration history, or force a mobile resync as part of this operation. Keep
normal mobile clients disconnected while inspecting a restored copy if their
sync could modify it.

## What runs where

| Component | Location | Role |
| --- | --- | --- |
| `infra/docker/postgres/compose.yml` | Docker Desktop on the Mac | Persistent local PostgreSQL 16 server |
| `tools/db-export/Dockerfile` and `export.sh` | Standalone ECS/Fargate task in staging | Read staging PostgreSQL, upload one custom-format archive, exit |
| `scripts/refresh-local-from-staging.sh` | Developer Mac | Validate, launch/wait, download, optionally restore locally |
| `infra/docker/db-restore/Dockerfile` | Separate historical toolbox image | Not used by the local Compose server or this export worker |

A Dockerfile describes software in an image. Compose describes how containers
run (image, ports, storage, environment, health check). `docker compose exec
postgres ...` runs a tool in the existing local server container; it does not
build an image or use the sibling `db-restore` Dockerfile.

## One-time local server setup

Keep any old Homebrew PostgreSQL data intact until the new setup is verified.
Port `5433` must be free; do not kill an unidentified listener.

1. Copy `infra/docker/postgres/.env.example` to `.env` in the same directory.
2. Replace the placeholder with a generated local-only password. For example:
   `python3 -c 'import secrets; print(secrets.token_hex(24))'`.
3. Restrict the file with `chmod 600 infra/docker/postgres/.env`. Never commit it.
4. Validate, then deliberately start the server:

```bash
docker --context desktop-linux compose --project-name postgres \
  -f infra/docker/postgres/compose.yml config --quiet

docker --context desktop-linux compose --project-name postgres \
  -f infra/docker/postgres/compose.yml up --detach --wait
```

The server binds only to `127.0.0.1:5433`; it uses the persistent named volume
`trailtasks-local-postgres16`. `POSTGRES_DB=postgres` initializes the maintenance
database, not a populated application schema. The incremental migrations are
not an empty-database bootstrap; use a reviewed baseline restore.

`stop`/`start` preserve the container and data. `down` normally preserves the
named volume. **`down --volumes` deletes the database volume.** Do not use it as
routine cleanup. Initialization variables affect only a fresh volume: editing
the `.env` password later does not change an existing PostgreSQL role password.

The refresh tool intentionally supports the verified Mac Docker Desktop context
`desktop-linux`, with endpoint `unix://$HOME/.docker/run/docker.sock`. Unset
`DOCKER_HOST` and `DOCKER_CONTEXT`; remote engines and arbitrary destination URLs
are not supported. It uses the `postgres` Compose project/service and local
Unix-socket database connections inside that container.
The tool resolves and pins the container ID, validates the Compose labels,
image, persistent volume and localhost-only port binding, and rechecks identity
before database creation/deletion. It does not trust a service name alone.

## Command contract

From the repository root, with Bash, Python 3, and AWS CLI installed:

```bash
scripts/refresh-local-from-staging.sh dump \
  --output "$HOME/Downloads/staging-fresh.dump"

scripts/refresh-local-from-staging.sh restore-new \
  --output "$HOME/Downloads/staging-new-db.dump" \
  --database trailtasks_scratch

scripts/refresh-local-from-staging.sh replace \
  --output "$HOME/Downloads/staging-replacement.dump" \
  --database trailtasks_development
```

These are operational examples, not harmless tests. **Every full invocation
requests a fresh staging export.** There is no automatic resume/reuse mode.
Do not rerun blindly after a waiter timeout or download failure. Read the printed
export ID, task ARN, and private run-record path first.

- `dump`: never touches a local DB; Docker is not required.
- `restore-new`: requires a nonexistent local DB, checks before export, and
  relies on `createdb` refusal again immediately before restore.
- `replace`: requires an existing local DB, an exact-name confirmation, an idle
  destination, and a successfully saved local safety backup before deletion.
  Stop the development API and close database GUI sessions first. The tool does
  not forcibly terminate clients.
  The backup filename is `<output>.before-<database>.dump`; it also refuses
  existing files and symlinks. The backup is saved before requesting a cloud
  export. New target connections are briefly blocked immediately before drop;
  on a pre-drop failure, cleanup tries to re-enable only the original verified
  local database, never a newly created or differently identified target.
- Destination names must match `trailtasks_[a-z0-9_]+` and be at most 63 characters.
- Output files/symlinks must not already exist; their parent directory must exist
  and be writable. A temporary file and atomic hard-link publication prevent an
  output created during the operation from being overwritten.
- Local restores use `--no-owner --no-privileges --single-transaction
  --exit-on-error`. No staging/production restore destination is accepted.

The script never applies Terraform, updates the API ECS service, runs schema
migrations, changes the API `.env`, or launches a mobile sync.

## AWS authentication and export source

Refresh the underlying browser login separately when needed:

```bash
aws login --profile trailtasks-dev --region us-east-1
```

The script uses profile `trailtasks-terraform`, region `us-east-1`, and checks
account `890129487844`. It discovers networking from the staging API service,
then launches the dedicated staging export task definition. This is a standalone
Fargate task, not an API service redeployment. Its task role can upload only to
`trailtasks-s3/staging-db-exports/*`; the developer identity separately needs
permission to launch/pass the approved task roles and read the resulting object.
The CI deployment role is not the developer export identity.

Task STOPPED alone is not success. The script validates the exact returned task,
`db-export` container, and integer exit code zero. It checks the exact S3 key,
positive size, and AES256 metadata, then downloads privately and verifies size
and `PGDMP` signature before publishing the final filename.

Those checks do not prove semantic integrity or a full restore. The worker's
`pg_restore --list` check proves catalog readability only. An actual successful
restore, migration-history inspection, core row counts, and application checks
provide separate evidence.

## Failure and recovery

Local restore operations serialize each container/database pair using a private
lock directory below `$HOME/.trailtasks-db-refresh-locks/`. Normal exit removes
the operation's lock. A hard-killed process can leave one behind: the script
fails closed and prints its path. Verify no refresh process is running and
inspect the local database state before manually removing that exact empty lock
directory. It never automatically breaks a stale lock. This lock coordinates
this tool, not arbitrary external SQL writers; keep those stopped throughout.

Keep run records private; they identify the exact operation. A waiter timeout
can leave the existing export task running. Inspect that task rather than
launching another one. No automatic retry launches a second export.

If `restore-new` fails after creation, the new database can remain empty because
the restore transaction rolled back. The downloaded dump is retained. Inspect
before choosing a different name or explicitly cleaning up the failed target.

For replacement, the tool prints the safety-backup path. Keep that backup and
the downloaded staging archive until local application checks pass. If restore
fails after the old DB has been dropped, the command reports failure and does
not pretend rollback succeeded. Recovery is a separate reviewed operation:
stop clients, inspect the target, create a fresh empty local DB if necessary,
and restore the printed safety archive using PostgreSQL 16 tools and
`--single-transaction --exit-on-error --no-owner --no-privileges`. Do not rerun
`replace` to recover: that would request another export and could back up the
wrong state. These logical backups do not preserve cluster-wide roles/grants.

S3 lifecycle applies only to `staging-db-exports/`: current objects expire after
seven days, noncurrent versions after one day if versioning applies, and
incomplete multipart uploads after one day. Expiration is asynchronous. It does
not delete local downloads or safety backups; remove those deliberately when
no longer needed. Treat all dumps as private user data, even in development.

## Connect the local API after verification

Set only the database fields in ignored `api-server/.env.development`:

```dotenv
PGHOST=127.0.0.1
PGPORT=5433
PGDBNAME=trailtasks_development
PGUSER=postgres
PGPASSWORD=the-same-private-local-password
PGSSLMODE=disable
```

Preserve other application settings. Clear conflicting exported `PG*` settings
before startup because dotenv does not normally overwrite them. Verify with
host-side `psql`, then start the API with
`npm --prefix ./api-server run start:dev`. Check both `/api/health` and
`/api/ready` on the port printed by startup (default 5500). Readiness tests a DB
query; it is not an end-to-end mobile-sync test.

API startup no longer rerolls trail access. A staging restore retains its
selection; a genuinely fresh **populated** catalog needs a deliberate one-time
initialization, with reviewed local environment settings:

```bash
NODE_ENV=development npm --prefix ./api-server run trails:reroll-monthly
```

That command writes access selections; do not run it merely because an API
restarts. The existing monthly in-process cron remains. Multiple API instances
can each run that cron; distributed once-per-period rotation protection is a
separate follow-up, not established by removing the startup call.

## Infrastructure reconciliation before a trusted-branch deployment

`db-export.tf` records the operator-applied export role, ECR repository, log
group, standalone task definition pinned by digest, and lifecycle configuration.
The lifecycle resource manages the **whole bucket lifecycle configuration**:
preserve future unrelated rules in this same resource. Do not create a second
lifecycle resource for the bucket or use the Terraform-state bucket for dumps.

Adding those managed resources makes CI refresh their metadata. The narrow
inspection-policy additions in `ci-permissions.tf` allow those reads; they do
not grant export execution, bucket writes, or broader deployment permissions.
They require a separately reviewed operator plan/apply before the trusted-branch
image-only deployment can succeed. The deployment guard intentionally rejects
unapplied IAM/infrastructure changes. This PR does not apply them or bypass the
guard. Preserve the currently deployed API image when preparing that plan,
review it, apply only the reviewed saved plan, and read back the policy. A
backend-disabled validation is not evidence of live reconciliation.

The pinned export image is the artifact previously published by the operator.
Rebuilding source locally does not prove byte-for-byte identity with that digest.
Image-scan review and future publication/task revision changes are separate
operator checkpoints; no image is published automatically by this tool.

## Verification

```bash
bash -n scripts/refresh-local-from-staging.sh
bash -n tools/db-export/export.sh
python3 -m unittest discover -s scripts/tests -p 'test_*.py' -v
python3 -m unittest discover -s tools/db-export -p 'test_*.py' -v

# Opt-in: actual pg_dump/pg_restore and replacement using disposable synthetic
# PostgreSQL 16 data. Requires Docker and the postgres:16-bookworm image.
TT54_RUN_DOCKER_TESTS=1 python3 -m unittest discover -s scripts/tests \
  -p 'test_refresh_postgres_integration.py' -v
```

The default safety suites use explicitly synthetic fixtures/stub executables and
no AWS credentials; the real-Docker suite is skipped unless explicitly enabled.
The opt-in suite executes real PostgreSQL archive and SQL operations only in
new disposable containers/databases, with test-only routing/identity fixtures;
the mock suite separately verifies the production local-destination guard.
Neither suite is a live staging export. The operator's
real staging export/download and isolated local restore are distinct evidence;
this feature must not claim a full fresh-export replacement was exercised when
it was not.
