# Database migrations

Trail Tasks has two database layers that need migration discipline:

1. Server PostgreSQL, used by the API.
2. Mobile WatermelonDB/SQLite, used locally on each device.

They are related, but they are not the same database. A safe release may need a Postgres migration, a WatermelonDB migration, sync mapping changes, and app code changes in a careful order.

## Why migrations matter

A migration is an ordered, reviewable database change.

Without migrations, schema changes tend to happen through manual SQL, Sequelize `sync()`, app startup side effects, or local database resets. That is risky once tester or production data exists.

Migration goals:

- Make schema changes repeatable across `dev`, `sandbox`, `preprod`, and `prod`.
- Make each change reviewable in a PR.
- Know which changes have already run.
- Avoid wiping local mobile data during app upgrades.
- Create a path for backup, restore, and rollback decisions before risky production changes.

## Server/Postgres migrations

Trail Tasks uses an ESM migration runner at:

```text
api-server/src/db/migrator.mjs
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

| `NODE_ENV` | Env file loaded |
| --- | --- |
| `development` | `api-server/.env.development` |
| `production` | `api-server/.env.production` |
| anything else | `api-server/.env.test` |

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
```

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
  SET is_pro_only = is_subscribers_only
  WHERE is_pro_only IS DISTINCT FROM is_subscribers_only;
`);
```

Backfills are important when adding a replacement column. The app should not switch to reading a new column that is empty or wrong for existing rows.

## Current Postgres baseline

The current API schema was created before a formal migration workflow. For TT-38, the existing database is treated as the baseline.

That means:

- This ticket adds migration infrastructure.
- This ticket does not recreate all existing tables.
- Future schema changes should be added as migrations from this point forward.
- Before `preprod` or `prod`, confirm a clean-database bootstrap strategy if a brand-new database must be created from scratch.

Do not use this ticket to rename trail columns, remove `users.total_miles`, or add token ledger tables. Those are follow-up schema tickets.

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
import { addColumns, createTable, schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        addColumns({
          table: 'trails',
          columns: [
            { name: 'is_pro_only', type: 'boolean', isIndexed: true },
          ],
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
