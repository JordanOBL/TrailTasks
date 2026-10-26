const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const script = path.join(__dirname, 'patch-rive-events.cjs');

function fixture(t) {
  const manifest = require('./rive-event-dispatcher.patch.json');
  let source = fs.readFileSync(path.join(root, 'node_modules/rive-react-native', manifest.file), 'utf8');
  // Test against the real installed package, whether postinstall already ran or not.
  if (!source.includes('import com.facebook.react.uimanager.events.RCTEventEmitter')) {
    for (const {before, after} of [...manifest.hunks].reverse()) source = source.replace(after, before);
  }
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rive-events-'));
  t.after(() => fs.rmSync(directory, {recursive: true, force: true}));
  const target = path.join(directory, manifest.file);
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, source);
  fs.writeFileSync(path.join(directory, 'package.json'), JSON.stringify({version: '9.8.6'}));
  return {directory, target, source, manifest};
}
const run = (directory, ...args) => spawnSync(process.execPath, [script, '--package-dir', directory, ...args], {encoding: 'utf8'});

test('patches all seven callbacks with surface-aware noncoalescing events, preserving payloads', t => {
  const {directory, target, source} = fixture(t);
  const result = run(directory);
  assert.equal(result.status, 0, result.stderr);
  const patched = fs.readFileSync(target, 'utf8');
  assert.doesNotMatch(patched, /RCTEventEmitter|\.receiveEvent\(/);
  assert.match(patched, /UIManagerHelper\.getEventDispatcher\(reactContext\)/);
  assert.match(patched, /UIManagerHelper\.getSurfaceId\(this\)/);
  assert.match(patched, /Event<RiveCallbackEvent>\(surfaceId, viewTag\)/);
  assert.match(patched, /override fun getEventName\(\): String = callbackName/);
  assert.match(patched, /override fun getEventData\(\): WritableMap = payload/);
  assert.match(patched, /override fun canCoalesce\(\): Boolean = false/);
  for (const event of ['PLAY', 'PAUSE', 'STOP', 'LOOP_END', 'STATE_CHANGED', 'RIVE_EVENT', 'ERROR']) {
    const payload = event === 'RIVE_EVENT' ? 'topLevelDict' : 'data';
    assert.ok(patched.includes(`dispatchRiveEvent(reactContext, Events.${event}.toString(), ${payload})`));
  }
  // All original data construction, resource handling and other code must survive unchanged.
  const manifest = require('./rive-event-dispatcher.patch.json');
  let restored = patched;
  for (const {before, after} of [...manifest.hunks].reverse()) restored = restored.replace(after, before);
  assert.equal(restored, source);
});

test('absent and disabled default data binding skip view-model lookup while explicit binding preserves errors', t => {
  const {directory, target, source} = fixture(t);
  assert.equal(run(directory).status, 0);
  const patched = fs.readFileSync(target, 'utf8');
  const bindingBody = text => text.slice(
    text.indexOf('  private fun configureDataBinding() {'),
    text.indexOf('  // If the user set autoBind to true'),
  );
  const body = bindingBody(patched);
  // JS defaults to AutoBind(false): disabled optional binding must not look up
  // a default view model on legacy animation-only files. Enabled/explicit binding
  // retains the original lookup and error handlers.
  const js = fs.readFileSync(path.join(root, 'node_modules/rive-react-native/src/Rive.tsx'), 'utf8');
  assert.match(js, /dataBinding = AutoBind\(false\)/);
  const guardedEntry = '  private fun configureDataBinding() {\n    if (dataBindingConfig == null) return\n    val bindingConfig = dataBindingConfig\n    if (bindingConfig is DataBindingConfig.AutoBind && !bindingConfig.autoBind) {\n      shouldBeReloaded = true\n      return\n    }\n';
  assert.ok(body.startsWith(guardedEntry), 'no-binding requests must return before any view-model access');
  assert.ok(body.indexOf('if (dataBindingConfig == null) return') < body.indexOf('file.defaultViewModelForArtboard(artboard)'));
  // Every explicit config branch, instance binding and both error handlers must
  // remain byte-identical; the only allowed change here is the early return.
  assert.equal(body.replace(guardedEntry, '  private fun configureDataBinding() {\n'), bindingBody(source));
  assert.match(body, /catch \(ex: RiveException\) \{\n      handleRiveException\(ex\)/);
  assert.match(body, /catch \(ex: Exception\) \{\n      showRNRiveError\("Unexpected error during data binding configuration", ex\)/);
});

test('obsolete dispatcher-only patched source fails closed without writing', t => {
  const {directory, target, source, manifest} = fixture(t);
  let obsolete = source;
  for (const {before, after} of manifest.hunks) {
    if (!after.includes('if (dataBindingConfig == null) return')) obsolete = obsolete.replace(before, after);
  }
  fs.writeFileSync(target, obsolete);
  for (const args of [[], ['--check']]) {
    const result = run(directory, ...args);
    assert.notEqual(result.status, 0, 'obsolete dispatcher-only fingerprint must not be accepted');
    assert.match(result.stderr, /source fingerprint/);
    assert.equal(fs.readFileSync(target, 'utf8'), obsolete);
  }
});

test('repeated application and check mode are byte-idempotent', t => {
  const {directory, target} = fixture(t);
  assert.equal(run(directory).status, 0);
  const first = fs.readFileSync(target);
  assert.equal(run(directory).status, 0);
  assert.equal(run(directory, '--check').status, 0);
  assert.deepEqual(fs.readFileSync(target), first);
});

test('check mode rejects unpatched source without modifying it', t => {
  const {directory, target, source} = fixture(t);
  const result = run(directory, '--check');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /not patched/);
  assert.equal(fs.readFileSync(target, 'utf8'), source);
});

for (const state of ['original', 'patched']) {
  test(`changed ${state} source fails closed without writing`, t => {
    const {directory, target} = fixture(t);
    if (state === 'patched') assert.equal(run(directory).status, 0);
    const changed = fs.readFileSync(target, 'utf8') + '\n// unknown upstream change\n';
    fs.writeFileSync(target, changed);
    const result = run(directory);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /source fingerprint/);
    assert.equal(fs.readFileSync(target, 'utf8'), changed);
  });
}

test('unsupported version fails closed even when the source matches', t => {
  const {directory, target, source} = fixture(t);
  fs.writeFileSync(path.join(directory, 'package.json'), JSON.stringify({version: '9.8.7'}));
  const result = run(directory);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Unsupported rive-react-native version/);
  assert.equal(fs.readFileSync(target, 'utf8'), source);
});

test('missing package fails rather than silently skipping installation repair', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rive-missing-'));
  t.after(() => fs.rmSync(directory, {recursive: true, force: true}));
  assert.notEqual(run(directory).status, 0);
});

test('install and existing environment quality gate enforce the patch', () => {
  const {scripts} = require('../package.json');
  assert.ok(scripts.postinstall.includes('node scripts/patch-rive-events.cjs'));
  assert.ok(scripts['test:env'].includes('node scripts/patch-rive-events.cjs --check'));
});
