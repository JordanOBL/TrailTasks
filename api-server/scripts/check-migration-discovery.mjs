import assert from 'node:assert/strict';
import { Umzug, memoryStorage } from 'umzug';

const historicalNames = [
	'20261007000000-add-is-pro-only-to-trails.mjs',
	'20261007001000-drop-users-total-miles.mjs',
	'20261007002000-create-token-transactions-ledger.mjs',
];

const storage = memoryStorage();

for (const name of historicalNames) {
	await storage.logMigration({ name });
}

const runner = new Umzug({
	migrations: {
		glob: '/app/migrations/*.mjs',
	},
	storage,
	logger: undefined,
});

const executed = await runner.executed();
const pending = await runner.pending();

assert.deepEqual(
	executed.map((migration) => migration.name).sort(),
	[...historicalNames].sort(),
);
assert.deepEqual(pending, []);

console.log('Packaged migrations match the historical execution names.');
console.log('Pending migrations in the simulated history: 0.');
