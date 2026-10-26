# Rive Android event-dispatcher and optional-data-binding compatibility patch

`rive-react-native` **9.8.6** still calls
`ReactContext.getJSModule(RCTEventEmitter::class.java)` for Android view callbacks.
React Native **0.86.3** uses the New Architecture; those calls produce a
SoftException recommending `UIManagerHelper.getEventDispatcher`.

`npm ci` / `npm install` runs `scripts/patch-rive-events.cjs` via `postinstall`.
No patch-package or other dependency is required. When installing with
`--ignore-scripts`, explicitly run:

```sh
npm run postinstall
node --test scripts/patch-rive-events.test.cjs
npm run test:env
```

`test:env` first checks the installed patch without modifying it; the existing
`quality` and `quality:release` gates already include `test:env`.

## What changes

Only Rive's Android `RiveReactNativeView.kt` is modified. All seven view callback
paths (play, pause, stop, loop end, state changed, Rive event and error) retain
exactly their existing event names and payload construction. A small event
subclass carries the actual view's `surfaceId` from
`UIManagerHelper.getSurfaceId(this)`, its view tag, event name and `WritableMap`.
`getEventData()` lets React Native perform modern dispatch; no legacy emitter
or custom `dispatch` override remains. `canCoalesce() = false` preserves
consecutive callbacks rather than dropping intermediate state/play/error events.
The nullable dispatcher follows the React Native API's lifecycle behavior; no
legacy fallback, warning suppression or Rive-disable workaround is introduced.

The second fix returns before view-model lookup for absent binding and for
`AutoBind(false)`, which is the JavaScript component's default. Upstream 9.8.6
looks up `file.defaultViewModelForArtboard(artboard)` unconditionally, even when
binding is disabled. Animation-only assets can therefore emit a binding error
and trigger `WildAvatar`'s static fallback. Disabling auto-binding still marks the
view for reload, preserving transitions from enabled to disabled binding.
Explicit enabled AutoBind/Index/Name/Empty configuration, instance binding,
property listeners and both error handlers remain unchanged. Genuine explicit
binding errors are not swallowed.

The event-dispatcher implementation follows the installed RN 0.86.3 Android `Event.kt`,
`UIManagerHelper.kt`, and `ReactTextInputKeyPressEvent.kt` APIs. It does not touch
iOS, animation assets, `WildAvatar`, `resourceName`, `source`, or animation playback setup.

## Guardrails and upgrades

`scripts/rive-event-dispatcher.patch.json` contains exact before/after hunks and
SHA-256 fingerprints for the entire original and patched source. The script
accepts only version 9.8.6 and these exact source states, checks every hunk once,
checks the complete output fingerprint before writing, and is byte-idempotent.
Unknown versions, changed original/patched sources and missing packages fail
installation/checks instead of silently skipping or guessing. `--check` never
writes. The tests use temporary copies of the real installed source (reversing
the exact manifest hunks when already patched), so they exercise the actual CLI
against both states without mutating the installed package.

The manifest now has ten hunks. The previous dispatcher-only patched fingerprint
is deliberately rejected, including in `--check` mode. To update an existing
local installation, restore the exact original source by reversing the old
manifest's hunks (only after checking its old patched fingerprint), then apply
the current script; alternatively reinstall the locked package. Do not accept
the old fingerprint as a completed patch or loosen the full-file guard.

On a Rive upgrade, inspect upstream callbacks and optional data binding first.
Retire each fix when upstream handles its case correctly. Otherwise explicitly review/rebase the hunks,
version and both fingerprints, then rerun the tests and native acceptance gates;
do not simply loosen the version/fingerprint checks.

## Required native acceptance

Node tests prove early-return placement before view-model lookup, byte-preserved
explicit-binding branches/error handling, callback preservation, idempotency and fail-closed
behavior, **not Kotlin compilation or event delivery**. Rebuild Android and
exercise Scout/Rive rendering, state/play callbacks and an intentional error
callback on the 16 KB emulator. Confirm callbacks still reach JS and the legacy
`getJSModule(RCTEventEmitter)` SoftExceptions are gone. Also exercise a no-binding
animation without view models and an invalid explicit binding: the former must
render without a binding error and the latter must still report its error.
Keep the existing 16 KB,
release/native and app-runtime gates; iOS remains unchanged by this patch.
