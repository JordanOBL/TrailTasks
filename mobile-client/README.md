# Trail Tasks mobile client

This is the React Native app for Trail Tasks. The current MVP focus is the offline-first solo Pomodoro hiking loop: start a solo session, progress along a trail, persist completed-session data, and show the result on Home/Logbook/Stats.

Friends, group sessions, leaderboards, WebSocket group runtime, and broad social sync are deferred unless a ticket explicitly brings them into scope. See `../docs/mvp-scope.md` and `../docs/typecheck-triage.md` before expanding work into those areas.

## Prerequisites

- Node.js 18+
- npm
- React Native Android and/or iOS local setup
- Android emulator/device or iOS simulator/device for manual app checks

## Install

From this directory:

```sh
npm install
```

Or from the repo root:

```sh
npm install --prefix mobile-client
```

## Environment files

The scripts select an environment file with `ENVFILE`:

- `.env.test` for Jest/tests and test builds
- `.env.development` for local development builds
- `.env.production` for production builds

Do not start the API server or Go WebSocket server for normal solo-MVP work unless the current ticket requires API sync/auth or group-session server behavior.

## Quality gates

Daily MVP gate:

```sh
npm run quality
```

This runs the focused unit suite through `npm run test:unit`.

Release gate:

```sh
npm run quality:release
```

This runs:

1. `npm run typecheck:release`
2. `npm run test:unit`

`typecheck:release` uses `tsconfig.release.json`, which intentionally excludes documented deferred surfaces. Full strict TypeScript still exists as a backlog check:

```sh
npm run typecheck
```

If a ticket makes a deferred surface part of MVP, remove the matching exclusion from `tsconfig.release.json` in the same PR that makes that surface type-clean and tested.

## Running tests directly

```sh
npm test                         # Jest run-in-band with ENVFILE=.env.test
npm run test:unit                # Current focused mobile suite
npm run test:coverage            # Coverage run
npm run typecheck:release        # Scoped release TypeScript check
npm run typecheck                # Full strict backlog check
```

## Running the app

Android emulator:

```sh
npm run android:emulator:dev
```

Android physical device:

```sh
npm run android:device:dev
```

All Android targets:

```sh
npm run android:all:dev
```

iOS development build:

```sh
npm run ios:dev
```

## Production Android build

```sh
npm run build-android-prod
```

## MVP manual smoke check

Before calling a mobile MVP PR release-ready, at minimum:

1. Run `npm run quality:release`.
2. Open the app without relying on the API/WebSocket servers.
3. Confirm Home loads.
4. Start a solo session.
5. Confirm active session timer/progress UI renders.
6. Complete or quit the session.
7. Confirm results, Home, Logbook, and Stats reflect the intended persisted behavior.
8. Open visible deferred screens such as Friends/Group/Leaderboards once and confirm they show safe Coming Soon/placeholder behavior instead of crashing.

## Important references

- `../docs/mvp-scope.md` — shippable MVP boundary.
- `../docs/typecheck-triage.md` — release typecheck exclusions and follow-up rule.
- `watermelon/README.md` — sync architecture and merge rules.
