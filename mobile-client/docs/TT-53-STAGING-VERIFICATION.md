# TT-53 staging verification and outstanding release gates

## Scope

React Native 0.86.3 / React 19.2.3 dependency alignment, RevenueCat / Play Billing 8,
Android API 36 / 16 KB compatibility, native startup fixes, safe-area/session layout,
Session Settings, grouped Settings and Shop presentation, and credential-log removal.
Preserves session/reward/purchase rules, migrations and existing user data.

Rive 9.8.6 uses a fail-closed, whole-file-hash postinstall patch. It dispatches seven
surface-aware noncoalescing events and skips optional binding for null or
`AutoBind(false)` without skipping reload state. See `scripts/RIVE-EVENT-DISPATCHER.md`.

## Verified

- Final Mac `npm run quality:release`: PASS (release TypeScript check, native/env
  tests, 57 Jest suites; 332 tests passed, 5 TODO). Final Rive tests include disabled
  auto-binding; prior RED/GREEN evidence and independent reviews reused.
- Fresh Linux and Mac `npm ci` completed with zero audit vulnerabilities at the
  integration checkpoint. Deprecation warnings remain.
- Final staging Android `bundleRelease assembleRelease`: BUILD SUCCESSFUL.
- Final APK and AAB: package `app.trailtasks`, target SDK 36, Billing 8.0.0,
  expected staging API origin and Google configuration, bundled JS, verified
  non-debug signatures. Each contains 40 checked 64-bit ELF libraries; every LOAD
  segment is >=16 KB aligned and congruent. APK/AAB library bytes match and APK
  ZIP alignment passes 16 KB verification.
- APK SHA-256: `61f3562372eab1412d1493c5d9751e345886a278d8cfbaf68406d078deea52b0`.
- AAB SHA-256: `e258d0394c803f85cf5aaa80c6d9123c512e27184f3e7c286340d203fa83c73d`.
- Final APK installed with `adb install -r` only on the dedicated disposable API 36
  arm64 / 16 KB emulator. Cold start before and after restoration of emulator
  settings retained 0.13 miles and 50 tokens; no uninstall/data clear/reset.
- Read-only staging readback confirmed `TT53Final16KB` (0.11 miles), two session
  records and a token-ledger balance of 50 for the disposable test account.
- Prior runtime checkpoint: session pause/resume, background/foreground, quit
  cancel/resume, quit/results; Settings dark/light and large-text landscape;
  Shop scrolling; modal keyboard Save reachability; active-session and results
  bottom actions. MainActivity recreation crash reproduced and fixed by installing
  RNScreensFragmentFactory before super; recreation retained persisted data.
- Independent Settings/Shop, modal, native and final Rive reviews completed;
  review fixes integrated. No redundant new review cycle.

Local Mac evidence is under `~/.config/trailtasks/build-logs/`:
`tt53-pr-final-quality-20261025-210745.log`,
`tt53-final-rive-android-20261025-205741.log`,
`tt53-final-android-artifact-verification.json`, and
`tt53-final-android-elf-verification.json`. Private snapshots/screenshots remain
outside the repository.

## iOS: confirmed external signing blocker

Xcode 27 / Swift 6.4 source compilation and JS bundling progressed after fixing
privacy-product duplication, pod deployment floors, the guarded RevenueCat
PaywallColor compatibility hunk and local Node selection. The archive then fails
at Embed Pods Frameworks while signing React.framework: `errSecInternalComponent`.

`security find-identity` reports one valid Apple Development identity. Following
two user-confirmed keychain unlock/access approvals, signing a COPY of
`/usr/bin/true` independently failed with the same error. This is an app-independent
signing-access blocker, not evidence of a successful signed archive. No further
keychain retries, ACL changes or credential guesses were performed for this PR.
Last archive log: `tt53-signing-retry-ios-20261025-205034.log`.

The local ignored `ios/.xcode.env.local` was backed up and changed from stale
Node 18 to the existing Node 24.3.0. It is not committed; tracked `.xcode.env`
continues to select PATH Node. Backups and scoped pod lock reconciliation retained.

## Outstanding acceptance (not release-ready)

- Resolve Mac signing access outside this implementation, then verify a signed
  final iOS archive, bundle configuration and privacy contents.
- No physical iPhone acceptance or store purchase readiness established.
- Final Rive patch compiles and passes regression tests; final animation playback,
  explicit binding transitions and native error events remain unverified at
  runtime. Earlier static companion evidence is NOT a playback pass.
- Earlier Android screen/session checks were on the prior binary; only final APK
  installation/cold-start/persistence was repeated after the last native guard.
- The five TODO tests are not represented as passed coverage. This gate uses the
  repository's release typecheck + selected unit suite, not every legacy test or
  full-repo lint.

No release uploads/publication, purchases, merge, production changes, backup
removal, device resets or existing-device changes were performed. Only the
explicitly dedicated disposable emulator was updated, and its font scale,
rotation and gestural navigation settings were restored.
