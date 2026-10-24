import {resolveEnvironment} from './resolveEnvironment';

describe('mobile environment contract (no native or URL API dependency)', () => {
  test.each([
    ['local', 'http://10.0.2.2:5500'],
    ['local', 'http://localhost:5500'],
    ['local', 'http://192.168.1.20:5500'],
    ['staging', 'https://api-staging.trailtasks.app'],
    ['production', 'https://user-provided.example'],
  ])('accepts %s with explicit origin %s', (APP_ENV, API_BASE_URL) => {
    expect(resolveEnvironment({APP_ENV, API_BASE_URL})).toEqual({APP_ENV, API_BASE_URL});
  });
  test.each([undefined, '', 'development', 'test', 'prod', ' local'])('rejects APP_ENV %s', APP_ENV => {
    expect(() => resolveEnvironment({APP_ENV, API_BASE_URL: 'https://example.com'})).toThrow('APP_ENV');
  });
  test.each([
    undefined, '', 'localhost:5500', 'ftp://example.com', 'https://example.com/',
    'https://example.com/api', 'https://example.com?x=1', 'https://example.com#x',
    'https://user:pass@example.com', ' https://example.com', 'https://example.com\n',
    'https://example.com:0', 'https://example.com:65536', 'https://-bad.example',
    'https://example..com', 'https://999.1.1.1', 'https://example.com\\evil',
  ])('rejects invalid API origin %s', API_BASE_URL => {
    expect(() => resolveEnvironment({APP_ENV: 'local', API_BASE_URL})).toThrow('API_BASE_URL');
  });
  test.each(['staging', 'production'])('%s requires HTTPS independently of NODE_ENV', APP_ENV => {
    expect(() => resolveEnvironment({APP_ENV, API_BASE_URL: 'http://example.com'})).toThrow('HTTPS');
  });
  test('does not depend on React Native partial URL implementation', () => {
    const saved = global.URL;
    try {
      global.URL = undefined as any;
      expect(resolveEnvironment({APP_ENV: 'local', API_BASE_URL: 'http://localhost:5500'}).API_BASE_URL).toBe('http://localhost:5500');
    } finally { global.URL = saved; }
  });
  test('adapter exports the validated single base and environment', () => {
    const {environment, API_BASE_URL, APP_ENV} = require('./environment');
    expect(environment).toEqual({APP_ENV: 'local', API_BASE_URL: 'http://localhost:5500'});
    expect({API_BASE_URL, APP_ENV}).toEqual(environment);
  });
});
