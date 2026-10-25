# Postgres backup and restore runbook

This runbook protects Trail Tasks API data before tester or production releases. It covers the server PostgreSQL database only; WatermelonDB is each device's local offline cache and has a separate migration path.

For the on-demand staging-to-local developer refresh tool, see
[Local PostgreSQL and staging refresh](local-postgres-refresh.md). That tool is
not scheduled production backup infrastructure. The MVP environment path is
local development → hosted staging → production; separate preprod is deferred.

## Data to protect

The highest-value user data tables are:

- `users`: account identity, preferences, active trail state, prestige, and current profile fields.
- `users_sessions`: hike/session facts used for mileage, progress, rewards, and history.
- `token_transactions`: append-only Trail Token ledger used to derive balances and audit token movement.
- `users_completed_trails`: completed trail history and best-time facts.
- `users_purchased_trails`: token-unlocked trail access.
- `users_addons`: purchased or stacked add-ons.
- `users_wilds`: unlocked/current wild state.
- `users_achievements`: earned achievements.
- `users_queued_trails`: saved trail queue.

Reference/seed tables such as `parks`, `trails`, `wilds`, `achievements`, `addons`, `park_states`, and `session_categories` should also be included in a full database backup so restores can preserve foreign-key context and match the app version that produced the user facts.

## Backup methods

Use recovery mechanisms according to their purpose:

1. RDS automated backups, snapshots, and point-in-time recovery (PITR) are the intended primary production recovery mechanism. Verify retention and understand the restore/reconnect procedure separately. RDS recovery normally creates another DB instance; it does not produce a file for `pg_restore`.
2. `pg_dump` creates portable logical archives for developer refreshes or a justified additional recovery requirement. A scheduled production dump pipeline is not a mandatory MVP launch gate.

Create a logical backup with custom format:

```bash
pg_dump \
  --format=custom \
  --no-owner \
  --no-privileges \
  --file "trailtasks-$(date +%Y%m%d-%H%M%S).dump" \
  "$DATABASE_URL"
```

If the environment uses discrete Postgres variables instead of `DATABASE_URL`, construct the connection string from the same secret source used by the API/migration runner:

```bash
PGPASSWORD="$PGPASSWORD" pg_dump \
  --host "$PGHOST" \
  --port "${PGPORT:-5432}" \
  --username "$PGUSER" \
  --dbname "$PGDBNAME" \
  --format=custom \
  --no-owner \
  --no-privileges \
  --file "trailtasks-$(date +%Y%m%d-%H%M%S).dump"
```

Do not commit dump files. Store them in the provider backup area, encrypted object storage, or another private backup location.

## Restore drill

Practice restores into staging or a local disposable database, never directly into production.

1. Create a fresh empty database.
2. Restore the dump:

   ```bash
   pg_restore \
     --no-owner \
     --no-privileges \
     --single-transaction \
     --exit-on-error \
     --dbname "$RESTORE_DATABASE_URL" \
     trailtasks-YYYYMMDD-HHMMSS.dump
   ```

3. Inspect the restored migration history first. For a local drill, after verifying
   `api-server/.env.development` points only to the local restore target:

   ```bash
   NODE_ENV=development npm --prefix ./api-server run db:migrate:status
   ```

   Clear conflicting exported database variables first. Use a separately reviewed
   target environment for hosted operations, never production secrets for a local
   drill. Status may initialize Umzug's tracking table; it is not guaranteed
   read-only. Do not automatically apply unexpected historical migrations.

4. Smoke-check protected data:

   ```sql
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM users_sessions;
   SELECT COUNT(*) FROM token_transactions;
   ```

5. If the restore target is staging, start the API against the restored database and log in with a known test account.

A restore drill is successful when the database restores without errors, migration status is understood, and the core user/session/token tables contain expected rows.

## Cadence and retention

Right-sized MVP policy:

- Before risky production changes: take an on-demand RDS snapshot and confirm the recovery path. Add a logical dump when portability or the change's recovery plan requires it.
- Production: verify RDS automated backups, retention, and PITR; do not equate a successful logical restore with verified PITR recovery.
- Staging: back up before destructive migration tests or release rehearsals.
- Local development: backup only before manual schema experiments that would be painful to recreate.

Retention planning:

- Select and verify production RDS retention according to the recovery objective.
- Retain pre-change snapshots until the release has been stable for the agreed recovery window.
- On-demand staging exports have a dedicated seven-day S3 lifecycle rule; local downloads and safety backups are not deleted by that rule.

Adjust retention upward if the hosting provider makes it cheap and automatic.

## Secrets and access

Database credentials must stay outside git.

Current Trail Tasks server environment files are documented in `docs/database-migrations.md`:

- `api-server/.env.development`
- `api-server/.env.production`
- `api-server/.env.test`

Required variables for scripts and migration commands are:

- `PGDBNAME`
- `PGUSER`
- `PGPASSWORD`
- `PGHOST`
- `PGPORT` when not using the default `5432`

For hosted production, prefer the provider secret manager or deployment environment variables. Limit backup/restore permissions to maintainers who are allowed to access user data.

## Pre-release checklist

Before running a production migration or destructive database operation:

- [ ] Confirm the target environment and database name.
- [ ] Confirm the exact migration or SQL that will run.
- [ ] Take a provider-native snapshot if available.
- [ ] Create a logical dump if the reviewed recovery plan calls for one.
- [ ] Verify where the backup file/snapshot is stored.
- [ ] Run the restore drill in staging/local when the change is risky.
- [ ] Run `npm --prefix ./api-server run db:migrate:status` against the target.
- [ ] Keep the backup until the release has been stable for at least one week.
