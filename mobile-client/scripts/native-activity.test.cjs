const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Android config-change restoration installs the screens factory before ReactActivity creation', () => {
  const activity = fs.readFileSync(path.join(__dirname, '../android/app/src/main/java/app/trailtasks/MainActivity.kt'), 'utf8');
  assert.match(activity, /import com\.swmansion\.rnscreens\.fragment\.restoration\.RNScreensFragmentFactory/);
  const factory = activity.indexOf('supportFragmentManager.fragmentFactory = RNScreensFragmentFactory()');
  const create = activity.indexOf('super.onCreate(savedInstanceState)');
  assert.ok(factory >= 0 && create > factory, 'screens factory must precede Android saved-state restoration');
  const splash = activity.indexOf('RNBootSplash.init(');
  assert.ok(splash >= 0 && splash < create, 'keep the splash initialization before onCreate');
});
