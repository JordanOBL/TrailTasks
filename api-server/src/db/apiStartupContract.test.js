import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mock, test } from 'node:test';
import vm from 'node:vm';

// Execute the real startup function without importing routes, opening sockets,
// registering timers, or connecting to a real database.
function startupHarness() {
  const source = readFileSync(new URL('../index.js', import.meta.url), 'utf8');
  const start = source.indexOf('const connect = async () => {');
  const end = source.indexOf('\nconnect().catch(', start);
  assert(start >= 0 && end > start, 'API startup function must be discoverable');

  const clients = [{ name: 'api' }, { name: 'models' }];
  const authenticate = mock.fn(async () => {});
  const reroll = mock.fn(async () => {});
  const listen = mock.fn((port, callback) => callback());
  const log = mock.fn();
  const connect = vm.runInNewContext(`${source.slice(start, end)}\nconnect;`, {
    verifyDatabaseConnection: authenticate,
    sequelize: clients[0],
    sequelizeModel: clients[1],
    runMonthlyTrailAccessReroll: reroll,
    app: { listen },
    process: { env: { PGDBNAME: 'trailtasks_development' } },
    console: { log },
  });
  return { connect, clients, authenticate, reroll, listen, log };
}

test('API startup verifies both DB clients but never rerolls restored access', async () => {
  const harness = startupHarness();
  await harness.connect();
  assert.equal(harness.authenticate.mock.callCount(), 2);
  assert.equal(harness.authenticate.mock.calls[0].arguments[0], harness.clients[0]);
  assert.equal(harness.authenticate.mock.calls[1].arguments[0], harness.clients[1]);
  assert.equal(harness.reroll.mock.callCount(), 0);
  assert.equal(harness.listen.mock.calls[0].arguments[0], 5500);
  assert(harness.log.mock.calls.some(call => call.arguments[0].includes('trailtasks_development')));
});

test('API startup does not listen or reroll when database verification fails', async () => {
  const harness = startupHarness();
  harness.authenticate.mock.mockImplementation(async () => {
    throw new Error('synthetic database unavailable');
  });
  await assert.rejects(harness.connect(), /synthetic database unavailable/);
  assert.equal(harness.listen.mock.callCount(), 0);
  assert.equal(harness.reroll.mock.callCount(), 0);
});
