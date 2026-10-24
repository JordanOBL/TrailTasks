const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const scripts = JSON.parse(read('package.json')).scripts;

test('root mobile wrappers all resolve to existing mobile scripts', () => {
  const wrappers = JSON.parse(read('../package.json')).scripts;
  for (const [name, command] of Object.entries(wrappers)) {
    const match = command.match(/^npm run --prefix \.\/mobile-client (\S+)$/);
    if (match) assert.ok(scripts[match[1]], `${name} points at absent ${match[1]}`);
  }
});
test('test/staging/production native runs and release builds select explicit files', () => {
  for (const platform of ['ios', 'android']) {
    for (const [lane, file] of [['test', '.env.test'], ['staging', '.env.staging'], ['prod', '.env.production']]) {
      assert.ok(scripts[`${platform}:${lane}`].includes(`ENVFILE=${file}`));
      assert.ok(!scripts[`${platform}:${lane}`].includes('update-ip'));
      if (platform === 'ios') assert.ok(scripts[`${platform}:${lane}`].includes(`--extra-params="ENVFILE=${file}"`));
    }
    for (const [lane, file] of [['staging', '.env.staging'], ['prod', '.env.production']]) {
      const command = scripts[`build-${platform}-${lane}`];
      assert.ok(command.includes(`ENVFILE=${file}`));
      assert.ok(command.includes('clean'));
    }
  }
});
test('existing local serials, schemes and Metro ports remain intact', () => {
  assert.ok(scripts['android:emulator:dev'].includes('ANDROID_SERIAL=emulator-5554'));
  assert.ok(scripts['android:emulator:dev'].includes('--port=8082 --deviceId=emulator-5554'));
  assert.ok(scripts['android:device:dev'].includes('ANDROID_SERIAL=R5CRB0Q5XRX'));
  assert.ok(scripts['android:device:dev'].includes('--port=8084 --deviceId=R5CRB0Q5XRX'));
  assert.ok(scripts['android:all:dev'].includes('--port=8081'));
  assert.ok(scripts['ios:dev'].includes('--scheme="Copy of TrailTasks" --port=8081'));
});
test('native configuration has no scheme file copies or implicit Gradle env selectors', () => {
  for (const scheme of ['TrailTasks', 'Copy of TrailTasks']) {
    const text = read(`ios/TrailTasks.xcodeproj/xcshareddata/xcschemes/${scheme}.xcscheme`);
    assert.ok(!text.includes('update-ip.sh'));
    assert.ok(!text.includes('.env'));
  }
  const gradle = read('android/app/build.gradle');
  assert.ok(gradle.indexOf('Selected ENVFILE') < gradle.indexOf('/dotenv.gradle'));
  assert.ok(!gradle.includes('ext.envFile'));
  assert.ok(!gradle.includes('buildConfigField "String", "ENVFILE"'));
  const project = read('ios/TrailTasks.xcodeproj/project.pbxproj');
  assert.ok(!project.includes('export ENVFILE='));
  assert.ok(project.includes('check-native-env.py'));
  const podfile = read('ios/Podfile');
  assert.ok(podfile.includes('check-native-env.py'));
  assert.ok(podfile.includes("phase.always_out_of_date = '1'"));
});
test('safe templates are the only committed environment inputs', () => {
  for (const [lane, env] of [['development', 'local'], ['test', 'local'], ['staging', 'staging'], ['production', 'production']]) {
    const text = read(`.env.${lane}.example`);
    assert.ok(text.includes(`APP_ENV=${env}\n`));
    assert.ok(text.includes('API_BASE_URL='));
    assert.ok(text.includes('REVCAT_GOOGLE=\nREVCAT_APPLE=\n'));
    assert.ok(!text.includes('DATABASE_'));
  }
  assert.ok(read('.env.production.example').includes('API_BASE_URL=\n'));
  assert.ok(read('.env.staging.example').includes('API_BASE_URL=https://api-staging.trailtasks.app\n'));
});
