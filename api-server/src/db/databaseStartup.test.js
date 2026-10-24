import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { verifyDatabaseConnection } from './databaseStartup.js';
import { sequelize } from './sequelizeModel.js';

test('verifies the database connection without synchronizing schema', async () => {
	const client = {
		authenticate: mock.fn(async () => {}),
		sync: mock.fn(async () => {}),
	};

	await verifyDatabaseConnection(client);

	assert.equal(client.authenticate.mock.callCount(), 1);
	assert.equal(client.sync.mock.callCount(), 0);
});

test('propagates a database connection failure without synchronizing schema', async () => {
	const connectionError = new Error('Synthetic connection failure');

	const client = {
		authenticate: mock.fn(async () => {
			throw connectionError;
		}),
		sync: mock.fn(async () => {}),
	};

	await assert.rejects(
		verifyDatabaseConnection(client),
		(error) => error === connectionError,
	);

	assert.equal(client.authenticate.mock.callCount(), 1);
	assert.equal(client.sync.mock.callCount(), 0);
});

test('startup failure terminates with a nonzero exit even with active timers', () => {
	const moduleUrl = new URL('./databaseStartup.js', import.meta.url).href;

	const result = spawnSync(
		process.execPath,
		[
			'--input-type=module',
			'-e',
			`
                import { failStartup } from ${JSON.stringify(moduleUrl)};
                setInterval(() => {}, 1000);
                failStartup();
            `,
		],
		{
			encoding: 'utf8',
			timeout: 2000,
		},
	);

	assert.equal(result.error, undefined);
	assert.equal(result.status, 1);
	assert.equal(result.stdout, '');
	assert.equal(result.stderr.trim(), 'API startup failed.');
});
