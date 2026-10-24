import {synchronize} from '@nozbe/watermelondb/sync';
import {checkGlobalUserExists, registerValidation} from '../services/auth';
import {pullCatalogChanges, sync} from '../watermelon/sync';

jest.mock('react-native-config', () => ({
  APP_ENV: 'staging',
  API_BASE_URL: 'https://api-staging.trailtasks.app',
  // Deliberately contradictory: backend selection must not use NODE_ENV.
  NODE_ENV: 'development',
}));
jest.mock('../watermelon/models', () => ({}));
jest.mock('../helpers/ErrorHandler', () => jest.fn());
jest.mock('@nozbe/watermelondb/sync', () => ({synchronize: jest.fn()}));
jest.mock('@nozbe/watermelondb/sync/impl', () => ({
  applyRemoteChanges: jest.fn(async () => {}),
  fetchLocalChanges: jest.fn(async () => ({changes: {}, affectedRecords: []})),
  getLastPulledAt: jest.fn(async () => 123),
  markLocalChangesAsSynced: jest.fn(async () => {}),
}));

const origin = 'https://api-staging.trailtasks.app';
const database = () => ({
  schema: {version: 1},
  adapter: {getLocal: jest.fn(async () => null), setLocal: jest.fn(async () => {})},
  write: jest.fn(async callback => callback()),
}) as any;

describe('API consumers use the same explicit origin and preserve server paths', () => {
  let log: jest.SpyInstance;
  let debug: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    log = jest.spyOn(console, 'log').mockImplementation(() => {});
    debug = jest.spyOn(console, 'debug').mockImplementation(() => {});
    global.fetch = jest.fn(async () => ({ok: true, status: 200, json: async () => ({id: 'user-1', changes: {}, timestamp: 456})})) as any;
  });
  afterEach(() => { log.mockRestore(); debug.mockRestore(); });

  test('credential verification posts to /api/users', async () => {
    await checkGlobalUserExists('a@example.com', 'candidate');
    expect(fetch).toHaveBeenCalledWith(`${origin}/api/users`, expect.objectContaining({method: 'POST', body: JSON.stringify({email: 'a@example.com', password: 'candidate'})}));
  });
  test('registration validation posts to /api/registerValidation', async () => {
    await registerValidation('a@example.com', 'hiker');
    expect(fetch).toHaveBeenCalledWith(`${origin}/api/registerValidation`, expect.objectContaining({method: 'POST'}));
  });
  test('catalog uses /pull with catalog_only, not /api/pull', async () => {
    await pullCatalogChanges(database(), true);
    expect(fetch).toHaveBeenCalledWith(`${origin}/pull?last_pulled_at=null&schema_version=1&catalog_only=true`);
  });
  test('account pull and push use /pull and /push on the same backend', async () => {
    (synchronize as jest.Mock).mockImplementationOnce(async options => {
      await options.pullChanges({lastPulledAt: 123, schemaVersion: 1});
      await options.pushChanges({changes: {}, lastPulledAt: 123});
    });
    await sync(database(), true, 'user-1');
    expect(fetch).toHaveBeenCalledWith(`${origin}/pull?last_pulled_at=123&schema_version=1&userId=user-1`);
    expect(fetch).toHaveBeenCalledWith(`${origin}/push?last_pulled_at=123`, expect.objectContaining({method: 'POST'}));
  });
  test('push-only account sync uses the same /push origin', async () => {
    await sync(database(), true, 'user-1', {pushOnly: true});
    expect(fetch).toHaveBeenCalledWith(`${origin}/push?last_pulled_at=123`, expect.objectContaining({method: 'POST'}));
  });
});
