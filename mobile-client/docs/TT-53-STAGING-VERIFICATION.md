# TT-53 staging verification and outstanding release gates

## Tester follow-up: repeated Logbook cards and search keyboard (latest artifacts)

- User clarified that the entire Logbook card list repeats. The grid now builds
  one card per park ID before rendering, keeping first-occurrence order and the
  existing navigation/completion/unlock flags. Distinct duplicate relation row
  IDs cannot repeat cards or collide on the park-ID list key. This is a read-only
  display projection: no records, backups, migrations or devices were reset.
- Root cause of duplicate relations on the tester's device is not proven. Earlier
  staging catalog evidence had 63 unique parks and 63 unique park/Wild relations;
  this change handles repeated local rows without silently deleting or rewriting
  synced catalog data. Testers must confirm the original repeated-list symptom.
- Trail search header was passed as a newly created component function on every
  keystroke. Passing the rendered element preserves input identity across typing,
  debounce, clearing and filter updates, preventing that remount/focus-loss path.
  Regression observed RED (old header) then GREEN (fixed header). Logbook repeated
  relation fixture also observed RED then GREEN. Native keyboard acceptance on
  the tester's device remains outstanding; the old high-code emulator/phone
  installations were not downgraded or uninstalled to install this candidate.
- Both fixes independently reviewed with no blocking security or logic findings.
  Latest release gate: 60 Jest suites, 349 passed, 5 TODO, plus native/env tests.
  Staging APK/AAB rebuilt; signature/staging config/API36/Billing8/native64/16KB
  checks passed. Android next-upload candidate: code 2, name 1.0.0. Confirm code 2
  is unused in Play before upload; no upload/rollout performed by the agent.
- Latest APK SHA-256: `8e2ec3abf41e390b58e1d855462bc2b10e8090a30d353f2269270cc483e30396`.
- Latest AAB SHA-256: `ec986596766dd65b20ce22b89a23b572c8e554fd0898d8d67550de08716674e8`.
- Previous code-1 artifacts preserved at Mac
  `~/.config/trailtasks/tt53-before-tester-bugfix.heoetwuh/`.
  Latest logs: `/tmp/tt53-tester-bugs-quality.log`, `/tmp/tt53-tester-bugs-android.log`.

## First Play upload: sequential Android versioning (historical artifacts)

User confirmed no previous Play release and has not confirmed the timestamp-code
internal-test draft. Removed Unix-time version generation. Current first-upload
candidate is `versionCode 1`, `versionName 1.0.0`; increment the explicit code for
future new uploads. Play Console acceptance of code 1 is NOT yet verified; do not
claim that removing an unconfirmed draft automatically resets store constraints.

Two versioning regression tests observed RED then GREEN. Full release gate passed
again (58 Jest suites, 345 passed, 5 TODO, plus native/env tests). Staging APK/AAB
rebuilt; both manifests explicitly verified as package `app.trailtasks`, code 1,
name 1.0.0. Signature/configuration/API36/Billing8/native64/16KB checks passed.
Latest hashes (supersede historical hashes below):
- APK: `0bdb0f1afb69512ea03268020ed1796e35db3b8da38408230f37f6650dd7299b`.
- AAB: `4a152e350cd17dc882478aec6fb3fe97c055fe1a3d6eec526ccc774a4e43e54a`.

Previous high-code APK/AAB preserved outside the repo under
`~/.config/trailtasks/tt53-before-sequential-version.7qnb4oag/` on the Mac.
No lower-code APK was installed over an existing high-code device install; a
version downgrade may be rejected. Do not uninstall or clear app data to bypass it.
No uploads, draft deletions or rollouts performed by the agent. User must replace
the unconfirmed Play draft artifact and verify store acceptance before rollout.

## Android device-QA follow-up (latest runtime evidence)

User-reported Samsung QA found missing background strikes, an inline quit dialog,
and an inaccessible trail-detail close control. The login keyboard layout passed
user QA and is unchanged by this follow-up.

- Added account-scoped AppState handling for the current solo engine, reusing its
  existing pause policy: one focus strike per departure, no break strike, no extra
  strike or auto-resume for an already manually paused session. Foreground resume
  is restricted to the same engine paused by the lifecycle bridge.
- Quit confirmation now uses a centered native full-screen transparent Modal,
  safe-area layout and bounded scrolling. Android Back cancels/resumes, not quits.
- Pinned an accessible >=48-point Close control above the trail detail scroller,
  including loading state. Fixed the underlying RN 0.86 incompatibility:
  `StyleSheet.absoluteFillObject` no longer exists; image/overlay now use the
  supported `StyleSheet.absoluteFill` so artwork does not displace hero controls.
- Regression tests observed RED then GREEN. Latest `quality:release`: 58 suites,
  345 passed, 5 TODO; includes the real engine + AppState/provider integration.
  Core lifecycle/modal/navigation diff independently reviewed with no blockers;
  the later two-line artwork compatibility correction was test/runtime verified
  but its supplemental independent review was unavailable (provider HTTP 429).
- Latest staging APK/AAB rebuilt successfully; signatures, staging configuration,
  target36/Billing8, native64 parity and 16 KB verification passed again.
  APK SHA-256: `980de20e70cfd63184b385d8d3a273004154c18635b916555dda5f97e70cbec0`.
  AAB SHA-256: `8bd0396a808564f86befe8a3841712e7795027d32df239a14b62014dc9d75848`.
- Latest APK installed in place ONLY on dedicated emulator-5562. Actual native
  background/foreground changed visible strikes 0 -> 1. Manual pause added the
  existing policy strike (2); background/return left it paused with strikes still 2.
  Native quit dialog visually centered over the entire app, Android Back resumed,
  confirmed quit reached results. Test session `TT53BackgroundFix`: 47 sec,
  0.02 miles, 0 completed sets, 0 awarded tokens. Trail detail title/badges and
  pinned Close visible; Close returned Home. Existing phone was not modified.
- Latest local logs: `/tmp/tt53-device-followup-quality.log` and
  `/tmp/tt53-device-followup-final-android.log` on the Mac. Private runtime
  screenshots remain outside the repository. Latest evidence above supersedes
  earlier "final" counts/hashes below; earlier baseline evidence remains historical.

User subsequently reported the staging iOS archive succeeded locally, then clarified
there is no physical iPhone available. The signing failure below is historical
agent-run evidence, not a claim their latest archive failed. Their successful
archive has not been independently inspected; physical iOS acceptance is still open.

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
