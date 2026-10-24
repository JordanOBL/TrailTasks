const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const script = path.resolve(__dirname, '../update-ip.sh');
function fixture(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tt53-env-'));
  try { fn(dir); } finally { fs.rmSync(dir, {recursive: true, force: true}); }
}
function run(dir, target, extra = {}) {
  return spawnSync('bash', [script, target], {cwd: dir, encoding: 'utf8', env: {...process.env, ...extra}});
}
for (const [target, host] of [['android-emulator', '10.0.2.2'], ['ios-simulator', 'localhost'], ['physical', '192.168.1.22']]) {
  test(`updates local only for ${target}, preserves public SDK keys/other fields`, () => fixture(dir => {
    const original = '# retained\nREVCAT_GOOGLE=public-google\nREVCAT_APPLE=public-apple\nOTHER=value\nDATABASE_URL=old\nAPP_ENV=production\nAPI_BASE_URL=old\n';
    fs.writeFileSync(path.join(dir, '.env.development'), original);
    for (const name of ['.env', '.env.staging', '.env.production', '.env.test']) fs.writeFileSync(path.join(dir, name), 'sentinel');
    const result = run(dir, target, {API_LAN_HOST: '192.168.1.22'});
    assert.equal(result.status, 0, result.stderr);
    const local = fs.readFileSync(path.join(dir, '.env.development'), 'utf8');
    assert.match(local, new RegExp(`API_BASE_URL=http://${host.replaceAll('.', '\\.')}:5500\\n`));
    assert.match(local, /APP_ENV=local\n/);
    for (const line of ['# retained', 'REVCAT_GOOGLE=public-google', 'REVCAT_APPLE=public-apple', 'OTHER=value', 'DATABASE_URL=old']) assert.ok(local.includes(line));
    for (const name of ['.env', '.env.staging', '.env.production', '.env.test']) assert.equal(fs.readFileSync(path.join(dir, name), 'utf8'), 'sentinel');
    assert.deepEqual(fs.readdirSync(dir).sort(), ['.env', '.env.development', '.env.production', '.env.staging', '.env.test']);
    assert.equal(run(dir, target, {API_LAN_HOST: '192.168.1.22'}).status, 0);
    assert.equal(fs.readFileSync(path.join(dir, '.env.development'), 'utf8'), local);
  }));
}
test('creates only local file, supports alternate local port', () => fixture(dir => {
  assert.equal(run(dir, 'android-emulator', {API_PORT: '5510'}).status, 0);
  assert.equal(fs.readFileSync(path.join(dir, '.env.development'), 'utf8'), 'APP_ENV=local\nAPI_BASE_URL=http://10.0.2.2:5510\n');
}));
for (const [target, env] of [['staging', {}], ['ios-simulator', {API_PORT: 'bad'}], ['physical', {API_LAN_HOST: 'https://bad/path'}]]) {
  test(`invalid target/input ${target} leaves files unchanged`, () => fixture(dir => {
    fs.writeFileSync(path.join(dir, '.env.development'), 'unchanged');
    assert.notEqual(run(dir, target, env).status, 0);
    assert.equal(fs.readFileSync(path.join(dir, '.env.development'), 'utf8'), 'unchanged');
  }));
}
