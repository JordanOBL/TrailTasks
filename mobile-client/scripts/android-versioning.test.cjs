const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const gradle = fs.readFileSync(path.join(__dirname, '../android/app/build.gradle'), 'utf8');

test('Android store version code is an explicit bounded integer, not a timestamp', () => {
  const match = gradle.match(/^\s*versionCode\s+(\d+)\s*$/m);
  assert.ok(match, 'Use an explicit versionCode; increment it for each new Play upload');
  const code = Number(match[1]);
  assert.ok(Number.isSafeInteger(code) && code >= 1 && code <= 2100000000);
  assert.doesNotMatch(gradle, /computeVersionCode|System\.currentTimeMillis/);
});

test('Android user-facing version is an explicit semantic version', () => {
  assert.match(gradle, /^\s*versionName\s+"\d+\.\d+\.\d+"\s*$/m);
});
