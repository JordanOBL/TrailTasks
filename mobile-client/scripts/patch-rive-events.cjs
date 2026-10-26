#!/usr/bin/env node
// Temporary, fail-closed Android compatibility patch for Rive 9.8.6 on RN 0.86.
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const patch = require('./rive-event-dispatcher.patch.json');
const sha256 = source => createHash('sha256').update(source).digest('hex');

function main() {
  const args = process.argv.slice(2);
  let packageDir = path.resolve(__dirname, '../node_modules/rive-react-native');
  let check = false;
  while (args.length) {
    const arg = args.shift();
    if (arg === '--check') check = true;
    else if (arg === '--package-dir' && args.length) packageDir = path.resolve(args.shift());
    else throw new Error(`Unknown or incomplete argument: ${arg}`);
  }
  const {version} = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'));
  if (version !== patch.version) {
    throw new Error(`Unsupported rive-react-native version ${version}; expected ${patch.version}. Review/retire the compatibility patch before upgrading.`);
  }
  const target = path.join(packageDir, patch.file);
  const source = fs.readFileSync(target, 'utf8');
  const fingerprint = sha256(source);
  if (fingerprint === patch.patchedSha256) {
    console.log(`Rive ${version}: event-dispatcher and optional-data-binding patch verified (already applied).`);
    return;
  }
  if (fingerprint !== patch.originalSha256) {
    throw new Error(`Unknown Rive source fingerprint ${fingerprint}; refusing to modify ${target}. Review upstream changes.`);
  }
  if (check) throw new Error('Rive event-dispatcher and optional-data-binding source is not patched. Run npm run postinstall.');
  let patched = source;
  for (const {before, after} of patch.hunks) {
    if (patched.split(before).length !== 2) throw new Error('Expected exactly one match for each Rive patch hunk.');
    patched = patched.replace(before, after);
  }
  if (sha256(patched) !== patch.patchedSha256) throw new Error('Unexpected patched source fingerprint; refusing to write.');
  fs.writeFileSync(target, patched);
  console.log(`Rive ${version}: applied surface-aware, noncoalescing Android event dispatcher and absent-data-binding guard.`);
}

try {
  main();
} catch (error) {
  console.error(`[patch-rive-events] ${error.message}`);
  process.exitCode = 1;
}
