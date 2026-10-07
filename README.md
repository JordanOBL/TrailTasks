# TrailTasks Monorepo

TrailTasks is a productivity game built around an offline-first React Native solo Pomodoro hiking loop. The monorepo contains three packages:

- `mobile-client/` — React Native mobile app and the current MVP focus.
- `api-server/` — Node.js/Express + PostgreSQL API used for account/catalog sync.
- `websockets-server/` — Go WebSocket server for deferred group-session features.

## MVP scope

The first shippable milestone is defined in `docs/mvp-scope.md`. Use that document before expanding scope: the current MVP is the solo/offline loop; friends, group sessions, leaderboards, and WebSocket protocol work are deferred unless a ticket explicitly brings them back into scope.

## Prerequisites

- Node.js 18+
- npm
- React Native Android/iOS tooling for device builds
- Go 1.23+ only if working on `websockets-server/`
- PostgreSQL only if working on API-backed sync/auth flows

## Install

From the repo root:

```sh
npm install
npm install --prefix api-server
npm install --prefix mobile-client
```

For the Go WebSocket server, only when needed:

```sh
cd websockets-server
go mod download
```

## Daily mobile MVP workflow

Most current MVP work should start in `mobile-client`:

```sh
cd mobile-client
npm run quality
```

`npm run quality` runs the focused Jest suite that currently gates day-to-day mobile work.

For release readiness:

```sh
cd mobile-client
npm run quality:release
```

`quality:release` runs the scoped release typecheck plus the focused Jest suite. The full strict typecheck backlog is documented in `docs/typecheck-triage.md`.

## Useful commands

From the repo root:

```sh
npm run test:api      # API node:test suite
npm run test:mobile   # Full mobile Jest command
npm run test:ws       # Go WebSocket tests, requires Go
```

From `mobile-client`:

```sh
npm run quality             # Daily mobile quality gate
npm run typecheck:release   # Scoped solo-MVP TypeScript check
npm run quality:release     # Release gate: scoped typecheck + tests
npm run android:emulator:dev
npm run android:device:dev
```

From `api-server`:

```sh
npm test
npm run start:dev
```

## Environment notes

- Mobile scripts use `ENVFILE=.env.test`, `.env.development`, or `.env.production` depending on the command.
- API config is loaded through dotenv and local environment variables. Use test/development database credentials only for local work.
- The MVP should work without starting the API server or Go WebSocket server unless the ticket is specifically about sync/auth/server behavior.

## Repository layout

- `docs/` — MVP scope, typecheck triage, product/engineering notes.
- `mobile-client/` — React Native app, tests, WatermelonDB models/sync, session engine.
- `api-server/` — Express API and Node test suite.
- `websockets-server/` — deferred group-session WebSocket service.

## Current quality expectations

- Do not hide new errors with broad `// @ts-ignore` comments.
- Keep deferred social/group/WebSocket work out of MVP tickets unless explicitly scoped.
- When a deferred feature becomes active scope, remove its release-typecheck exclusion in the same PR that makes it type-clean and tested.
