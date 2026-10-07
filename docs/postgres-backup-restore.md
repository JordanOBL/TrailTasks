# Postgres backup and restore runbook

This runbook protects Trail Tasks API data before tester or production releases. It covers the server PostgreSQL database only; WatermelonDB is each device's local offline cache and has a separate migration path.

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

Use both provider-native snapshots and logical Postgres dumps when possible:

1. Provider-native snapshots protect against full database loss and are usually fastest to restore inside the same host/provider.
2. `pg_dump` creates portable logical backups that can be restored into local or staging databases for drills.

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
     --clean \
     --if-exists \
     --no-owner \
     --no-privileges \
     --dbname "$RESTORE_DATABASE_URL" \
     trailtasks-YYYYMMDD-HHMMSS.dump
   ```

3. Run the migration status command against the restored database:

   ```bash
   NODE_ENV=production npm --prefix ./api-server run db:migrate:status
   ```

   Use the environment file or secret set for the restore target, not production secrets.

4. Smoke-check protected data:

   ```sql
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM users_sessions;
   SELECT COUNT(*) FROM token_transactions;
   ```

5. If the restore target is staging, start the API against the restored database and log in with a known test account.

A restore drill is successful when the database restores without errors, migration status is understood, and the core user/session/token tables contain expected rows.

## Cadence and retention

Recommended MVP cadence:

- Before every production migration: take an on-demand provider snapshot and a `pg_dump`.
- Production: daily automated backup at minimum once real testers exist.
- Preprod/staging: backup before destructive migration tests or release rehearsals.
- Local development: backup only before manual schema experiments that would be painful to recreate.

Recommended retention once real testers exist:

- Keep daily backups for at least 7 days.
- Keep weekly backups for at least 4 weeks.
- Keep migration-day backups until the release has been stable for at least one week.

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
- [ ] Create a fresh `pg_dump` logical backup.
- [ ] Verify where the backup file/snapshot is stored.
- [ ] Run the restore drill in staging/local when the change is risky.
- [ ] Run `npm --prefix ./api-server run db:migrate:status` against the target.
- [ ] Keep the backup until the release has been stable for at least one week.
