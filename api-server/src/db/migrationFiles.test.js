import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { test } from 'node:test';

test('preserves the historical filenames of applied migrations', () => {
	const directory = new URL('../../migrations/', import.meta.url);
	const files = readdirSync(directory);

	const historicalNames = [
		'20261007000000-add-is-pro-only-to-trails.mjs',
		'20261007001000-drop-users-total-miles.mjs',
		'20261007002000-create-token-transactions-ledger.mjs',
	];

	for (const name of historicalNames) {
		assert.ok(files.includes(name), `Missing historical migration: ${name}`);

		const renamedAlias = name.replace(/\.mjs$/, '.js');
		assert.equal(
			files.includes(renamedAlias),
			false,
			`Duplicate migration identity: ${renamedAlias}`,
		);
	}
});
