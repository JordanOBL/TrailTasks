import assert from 'node:assert/strict';
import { test, mock } from 'node:test';
import { createReadinessHandler } from './readiness.js';

test('Readiness return ok', async () => {
	const client = {
		query: mock.fn(async () => Promise.resolve()),
	};

	const res = {
		status: mock.fn(() => res),
		json: mock.fn(() => res),
	};

	const handler = createReadinessHandler(client);
	await handler({}, res);

	assert.equal(client.query.mock.callCount(), 1);
	assert.deepEqual(client.query.mock.calls[0].arguments, ['SELECT 1']);

	assert.equal(res.status.mock.callCount(), 1);
	assert.deepEqual(res.status.mock.calls[0].arguments, [200]);

	assert.equal(res.json.mock.callCount(), 1);
	assert.deepEqual(res.json.mock.calls[0].arguments, [{ status: 'ok' }]);
});

test('Readiness returns error', async () => {
	const client = {
		query: mock.fn(async () => {
			throw new Error('client query threw an error');
		}),
	};

	const res = {
		status: mock.fn(() => res),
		json: mock.fn(() => res),
	};

	const handler = createReadinessHandler(client);
	await handler({}, res);

	assert.equal(client.query.mock.callCount(), 1);
	assert.deepEqual(client.query.mock.calls[0].arguments, ['SELECT 1']);

	assert.equal(res.status.mock.callCount(), 1);
	assert.deepEqual(res.status.mock.calls[0].arguments, [503]);

	assert.equal(res.json.mock.callCount(), 1);
	assert.deepEqual(res.json.mock.calls[0].arguments, [
		{ status: 'unavailable' },
	]);
});
