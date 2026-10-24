# Database migrations

Trail Tasks has two database layers that need migration discipline:

1. Server PostgreSQL, used by the API.
2. Mobile WatermelonDB/SQLite, used locally on each device.

They are related, but they are not the same database. A safe release may need a Postgres migration, a WatermelonDB migration, sync mapping changes, and app code changes in a careful order.

## Why migrations matter

A migration is an ordered, reviewable database change.

Without migrations, schema changes tend to happen through manual SQL, Sequelize `sync()`, app startup side effects, or local database resets. That is risky once tester or production data exists.

Migration goals:

- Make schema changes repeatable across local development, hosted staging,
  and production. A separate preprod environment is optional and deferred.
- Make each change reviewable in a PR.
- Know which changes have already run.
- Avoid wiping local mobile data during app upgrades.
- Create a path for backup, restore, and rollback decisions before risky production changes.

## Server/Postgres migrations

Trail Tasks uses an ESM migration runner at:

```text
api-server/src/db/migrator.js
```

Postgres migration files live in:

```text
api-server/migrations/
```

The runner uses:

- `umzug` as the migration runner
- `sequelize` for the Postgres connection and query interface
- `SequelizeMeta` in Postgres to record which migrations have executed

The runner intentionally uses ESM `import` syntax instead of CommonJS `module.exports`.

## Server environment selection

The migration runner mirrors the API server's current environment file behavior:

| `NODE_ENV`    | Env file loaded               |
| ------------- | ----------------------------- |
| `development` | `api-server/.env.development` |
| `production`  | `api-server/.env.production`  |
| anything else | `api-server/.env.test`        |

Required database variables:

```text
PGDBNAME
PGUSER
PGPASSWORD
PGHOST
```

Optional database variable:

```text
PGPORT
PGSSLMODE
```

Migration tasks targeting staging must explicitly set PGSSLMODE=require.
Do not assume the service task definition supplies it. The inspected
revision 8 task definition did not contain that environment variable.

`PGPORT` defaults to `5432` if it is not set.

## Server migration commands

Run these from the repo root.

Check pending migrations:

```bash
npm --prefix ./api-server run db:migrate:status
```

Apply pending migrations:

```bash
npm --prefix ./api-server run db:migrate
```

Show already executed migrations:

```bash
npm --prefix ./api-server run db:migrate:executed
```

Undo the most recent migration:

```bash
npm --prefix ./api-server run db:migrate:undo
```

Only use undo when the migration's `down` function is known to be safe for the target environment.

## Migration commands in the deployed image

The runtime image contains compiled code under /app/dist and migration
files under /app/migrations. It does not contain /app/src.

Commands inside an approved standalone migration task are:

- npm run db:migrate:dist:status — list pending migrations.
- npm run db:migrate:dist:executed — list recorded migrations that match
  discovered migration files.
- npm run db:migrate:dist — apply pending migrations.

These commands are not instructions to connect from a laptop. Private RDS
requires an approved execution location inside its network.

Staging uses NODE_ENV=production for the Node runtime, with staging-specific
database settings injected by ECS. This does not mean the target database
is production. With PGSSLMODE=require, the runner uses the existing staging
TLS configuration; production requires a separately reviewed certificate
verification configuration.

Before an operation:

1. Confirm the AWS account, region, task definition, image, and target database.
2. Inspect the existing schema and exact migration-history filenames.
3. Review the migration SQL, compatibility requirements, and recovery plan.
4. Before schema/data changes, create and verify an appropriate backup.
5. Ensure no other migration operation is running.
6. Run status using the reviewed image before considering an apply.

Status is not guaranteed to be read-only: Sequelize migration storage may
initialize its tracking table. For strictly read-only inventory, query the
existing metadata directly inside a PostgreSQL read-only transaction.

For the inspected staging baseline, the three historical .mjs migrations
are already recorded. A corrected runner should report none pending.
Unexpected pending historical migrations are a stop condition, not permission
to replay them.

Do not run down against shared staging without reviewing its effects and
recovery procedure. In particular, the historical ledger rollback drops
the ledger table; recreating an old column does not restore lost balances.

## Creating a Postgres migration

Create a timestamped ESM file under:

```text
api-server/migrations/
```

Example name:

```text
20261007120000-add-is-pro-only-to-trails.mjs
```

Example shape:

```js
export async function up({ context }) {
	const { queryInterface, Sequelize } = context;

	await queryInterface.addColumn('trails', 'is_pro_only', {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	});
}

export async function down({ context }) {
	const { queryInterface } = context;

	await queryInterface.removeColumn('trails', 'is_pro_only');
}
```

For data changes, the migration should also backfill the new field when needed.

Example backfill pattern:

```js
await queryInterface.sequelize.query(`
  UPDATE trails
  SET is_pro_only = COALESCE(is_subscribers_only, false);
`);
```

Backfills are important when adding a replacement column. The app should not switch to reading a new column that is empty or wrong for existing rows.

## Current Postgres baseline

The existing staging database predates the connection-only API startup
introduced by TT-48. Earlier API startup could alter its schema through
Sequelize synchronization.

With the TT-48 changes, API startup verifies database connectivity without
calling sequelize.sync(). Schema changes must be performed separately
through a reviewed migration operation.

### Existing staging database

A successful read-only inspection confirmed that staging records these
migration identities in public."SequelizeMeta":

- 20261007000000-add-is-pro-only-to-trails.mjs
- 20261007001000-drop-users-total-miles.mjs
- 20261007002000-create-token-transactions-ledger.mjs

The observed columns match their principal schema outcomes: the Pro-only
trail column and token ledger exist, while the legacy user mileage and
token-balance columns are absent. This inspection did not verify every
constraint, index, or historical data transformation.

Preserve these exact filenames. A historical rename to .js caused the
packaged filenames to disagree with the recorded execution history.

Do not replay these migrations or rewrite migration history merely to
make a status check appear clean. Inspect each target database independently;
other environments must not be assumed to match staging.

### Empty databases

These migration files are not a complete empty-database bootstrap.
The first migration assumes that the trails table already exists.

An empty database requires an approved baseline restore or a separately
reviewed and tested initial-schema procedure before incremental migrations.
API startup must not be used to create or alter that baseline.

Do not reset an existing database or mark migrations executed without
verifying the schema and relevant data.

## `users.total_miles` removal path

`users.total_miles` is removed as an account field. Mileage-sensitive behavior should derive from completed `users_sessions.total_distance_hiked` rows.

Current MVP posture:

- Remove the column from mobile WatermelonDB and the API Sequelize user model.
- Strip any stale `total_miles` from account sync writes before updating Postgres user rows.
- Do not force-push local `users.total_miles` during full account sync.
- Derive API leaderboard and friend mileage by summing `users_sessions.total_distance_hiked` server-side.

Database steps:

1. For an existing Postgres database, inspect its schema and migration history
   before applying changes. Staging already records the historical mileage
   migration; do not replay it merely because a filename changed.
2. Do not reset or recreate a database containing data that must be preserved.
   Mileage remains derived from users_sessions.total_distance_hiked.
3. Do not reset an existing WatermelonDB merely to remove a stale column.
   Use a reviewed, versioned migration and compatible application behavior.
4. Database resets are limited to explicitly disposable local test fixtures.
   They are not the staging, production, or installed-user upgrade procedure.

## Mobile/WatermelonDB migrations

WatermelonDB stores the local device database. Its schema is defined in:

```text
mobile-client/watermelon/schema.js
```

Its migrations are defined in:

```text
mobile-client/watermelon/migrations.js
```

The app already passes migrations into the Watermelon `SQLiteAdapter` in both runtime and test setup:

```js
const adapter = new SQLiteAdapter({
	schema,
	migrations,
});
```

WatermelonDB migrations matter because changing the local schema version without a migration can reset the local database and delete local data.

## Adding a WatermelonDB migration

When changing Watermelon schema:

1. Increase the schema version in `mobile-client/watermelon/schema.js` by exactly one.
2. Add a migration in `mobile-client/watermelon/migrations.js` with `toVersion` equal to the new schema version.
3. Add only supported migration steps unless a more advanced/manual migration is intentionally designed.

WatermelonDB's documented schema migration helpers support:

- `createTable(...)`
- `addColumns(...)`

Example:

```js
import {
	addColumns,
	createTable,
	schemaMigrations,
} from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
	migrations: [
		{
			toVersion: 2,
			steps: [
				addColumns({
					table: 'trails',
					columns: [{ name: 'is_pro_only', type: 'boolean', isIndexed: true }],
				}),
			],
		},
	],
});
```

## WatermelonDB backfill and cleanup cautions

Postgres migrations can backfill rows directly with SQL. WatermelonDB schema migrations are more limited.

For replacement fields such as `is_subscribers_only` to `is_pro_only`, prefer a backward-compatible transition:

1. Add the new local column with a Watermelon migration.
2. Add the new server column with a Postgres migration and backfill it on the server.
3. Update sync to send the new value from the server catalog.
4. Update app reads to prefer the new field.
5. Keep the old local field temporarily if existing installed apps may still have it.

Deleting and rebuilding the local database can be acceptable only for data that is safely recoverable from the server, such as global catalog data. It is not safe for unsynced user/account data, offline sessions, local purchases, or anything the server may not already have.

So: do not rely on local DB deletion as the general migration strategy. Use it only when you have proven the affected data is disposable or fully resyncable.

## Release order for synced schema changes

For a field used by both Postgres and WatermelonDB, prefer this order:

1. Add the new server column/table in a Postgres migration.
2. Backfill server data.
3. Add the new local Watermelon column/table in a Watermelon migration.
4. Update sync mapping to include the new field.
5. Update app code to read/write the new field.
6. Keep old fields through the compatibility window.
7. Remove or ignore old fields only after deployed clients no longer depend on them.

This is more verbose than deleting stale columns immediately, but it avoids breaking installed apps and avoids local data loss.

## Safety rules

- Do not run `sequelize.sync({ force: true })` or destructive manual SQL against `preprod` or `prod`.
- Check migration status before applying migrations.
- Back up `preprod` or `prod` before risky migrations.
- Make migrations backward-compatible when mobile clients may update at different times.
- Include backfills when adding replacement columns.
- Keep Pro entitlement, Trail Token accounting, and mileage facts as separate data concerns.
- Test migration commands locally before using them in `preprod` or `prod`.
