import assert from 'node:assert/strict';
import { test } from 'node:test';

import { databaseTlsOptions } from './databaseTlsOptions.js';

test('explicitly configures the existing staging TLS mode', () => {
	assert.deepEqual(databaseTlsOptions('require'), {
		ssl: {
			require: true,
			rejectUnauthorized: false,
		},
	});
});

test('adds no explicit TLS options when the mode is unset', () => {
	assert.deepEqual(databaseTlsOptions(undefined), {});
});
