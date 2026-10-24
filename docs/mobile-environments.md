# Mobile environments (TT-53)

## Purpose and mental model

“As Jordan, I want login and sync to use the same explicitly selected backend,
regardless of whether the app is built in debug or release mode.”

Three independent concepts:

- `ENVFILE` selects the native configuration input file at build time.
- `APP_ENV` identifies the backend target: `local`, `staging`, or `production`.
- `NODE_ENV` controls JavaScript/tooling behavior. It does not select a backend
  or decide HTTP versus HTTPS. A staging release build uses production-mode
  tooling while still talking to staging.

`react-native-config` is the single mobile environment loader. Babel no longer
loads `@env` or private `.env.test` files. Jest supplies deterministic public-only
native config mocks; it does not require your private environment files.

```
explicit npm command -> ENVFILE -> react-native-config
                                   -> config/environment.ts adapter
                                      -> resolveEnvironment(raw) validation
                                      -> auth, catalog, account pull/push, other API consumers
```

This is a configuration adapter and dependency injection: the resolver receives
plain values and can be tested without a native app, file, database, or network.
It rejects missing/invalid configuration rather than guessing a backend.

## Public configuration contract

```
APP_ENV=staging
API_BASE_URL=https://api-staging.trailtasks.app
REVCAT_GOOGLE=
REVCAT_APPLE=
```

`API_BASE_URL` is a full HTTP(S) origin: DNS/IPv4 host and optional TCP port,
without credentials, endpoint path, query, fragment, whitespace, or trailing
slash. IPv6 literal origins are not supported by this resolver. Staging and
production require HTTPS. The protocol belongs in the URL, never in a
`NODE_ENV` conditional.

API paths stay unchanged: auth uses `/api/users` and `/api/registerValidation`;
catalog/account pulls use `/pull`; pushes use `/push`; leaderboards use
`/api/leaderboards`. All share one origin.

Mobile configuration is bundled into the app and is not secret storage. Use
only RevenueCat PUBLIC SDK keys. Never put a PostgreSQL connection string,
database password, AWS credentials, or RevenueCat server secret key here.
Backend secrets remain managed separately in AWS.

## Migrate existing private files safely

Do not overwrite your existing private files. Review them locally and keep any
backup outside Git with restricted permissions. This PR does not change them.

Tracked `.example` files provide public defaults; the actual `.env.*` files are
ignored by Git:

| File | APP_ENV | Destination |
| --- | --- | --- |
| `.env.development` | `local` | laptop API, adjusted for device type |
| `.env.test` | `local` | explicitly chosen local integration-test API |
| `.env.staging` | `staging` | `https://api-staging.trailtasks.app` |
| `.env.production` | `production` | approved production HTTPS origin, once provisioned |

For an absent file only, copy its example from `mobile-client`. For example:

```bash
cp -n .env.staging.example .env.staging
```

`cp -n` avoids replacing an existing file. Inspect/edit existing files instead
of assuming a copy updated them. Add `APP_ENV` and `API_BASE_URL` as above;
copy your existing public `REVCAT_GOOGLE` and `REVCAT_APPLE` values as appropriate
for that target. Blank SDK keys are placeholders, not validated purchases.
Remove obsolete `DATABASE_URL`, `DATABASE_PULL_URL`, `DATABASE_PUSH_URL`,
`DATABASE_LEADERBOARDS_URL`, and `DATABASE_CONNECTION_STRING` fields from the
mobile files. Remove backend secrets rather than migrating them into the app.
Old `NODE_ENV` fields are not used by API consumers; they are not necessary in
these mobile files. `.env.test` is not an alias for hosted staging.

Production is not provisioned. Its example intentionally leaves `API_BASE_URL`
blank: do not invent a production hostname or repoint production to staging.

## Local development

Run from the repository root:

```bash
npm run start:ios:dev
# Or, from mobile-client, choose the Android target explicitly:
npm --prefix mobile-client run android:emulator:dev
npm --prefix mobile-client run android:device:dev
```

The existing Android serials and Metro ports are preserved. The root Android
`start:android:dev` alias selects the existing physical-device command.

`update-ip.sh` writes only `.env.development`, preserving unrelated fields and
public RevenueCat values. It no longer writes `.env` or any hosted/test file.
It sets `APP_ENV=local` and the complete `API_BASE_URL` using:

- Android emulator: `10.0.2.2:5500`.
- iOS simulator: `localhost:5500`.
- Physical device: the laptop LAN host on port 5500.

Override `API_PORT` or `API_LAN_HOST` when necessary. For example, from
`mobile-client`:

```bash
API_LAN_HOST=192.168.1.20 API_PORT=5500 bash ./update-ip.sh physical
```

An assignment before a command supplies an environment variable to that command
and its children, not permanently to your terminal. In the script,
`${API_PORT:-5500}` means “use API_PORT unless unset/empty, otherwise 5500.”
Bash selects the target; Python edits text atomically without sourcing/executing
the private env file. Python 3 is therefore required for the updater and iOS
preflight. These scripts do not start your API or database.

## Staging debug and release builds

After migrating your private files, install the changed JavaScript dependencies
and regenerate iOS Pods on the Mac:

```bash
npm --prefix mobile-client ci
cd mobile-client/ios
bundle exec pod install
```

Use your existing working CocoaPods invocation if Bundler is not how your Mac
manages Pods. The Podfile change must be installed to add the config-codegen
guard and rerun config generation on each build.

From repository root:

```bash
npm run start:ios:staging
npm run start:android:staging
npm run build:ios:staging
npm run build:android:staging
```

The start commands are debug runs (Metro required); the build commands create
Release artifacts with staging configuration. iOS archives require your normal
Xcode/signing setup; archive creation is not export/TestFlight distribution.
Android release builds retain the repository's existing signing setup. Neither
command uploads an app or provisions AWS resources.

Production uses `start:ios:prod`, `start:android:prod`, `build:ios`, and
`build:android`, only after an approved production origin is configured.

## Native selection and cache safety

- Android requires an explicit allowlisted `ENVFILE` before loading
  `dotenv.gradle`; missing files fail rather than selecting `.env`.
- iOS commands pass the file as both process environment and an xcodebuild
  setting (`--extra-params` for React Native CLI). This carries selection to
  the config Pod. The Pod codegen phase and app bundle phase check selection.
- Schemes no longer run the local-IP updater or copy production files over
  `.env`. The bundle phase no longer chooses files based on Debug/Release.
- The pinned iOS loader prioritizes global `/tmp/envfile` over `ENVFILE`.
  Preflight refuses to build while it exists. Inspect it yourself and remove
  it only if safe for other projects; our scripts never delete it.
- The loader can fall back to `.env` if a requested file is missing. Preflight
  blocks that fallback. Direct Xcode/Gradle builds must also explicitly supply
  `ENVFILE`; use the documented npm commands as the supported entry points.
- Environment values are compiled into native artifacts. Fast Refresh or a
  Metro restart is not enough after changing them. Rebuild the native app.
  Release build commands use a clean build; clean native build outputs if
  switching debug targets appears stale. Avoid concurrent builds with different
  targets sharing the same native build directory.
- Local HTTP is intended for development. Release transport policies can differ;
  use hosted HTTPS for staging releases rather than weakening ATS/cleartext
  security globally.

## Local data isolation: important

These targets currently share the existing app ID and Watermelon database name.
Changing the server does NOT isolate existing local account data, queued writes,
or sync timestamps. Do not repoint a real user's production installation.
Use a separate disposable simulator/device installation for each verification
session. If explicitly clearing app data/uninstalling a disposable test app,
first account for unsynced progress: deletion loses local data. This change
never clears it automatically. Separate app IDs/storage per target remain a
possible follow-up, not an implicit guarantee of this PR.

## Automated checks and real-device acceptance

```bash
npm --prefix mobile-client run quality:release
```

This runs release typechecking, Node/Bash helper and wiring tests, Python native
selection tests, and the existing Jest release suite. Resolver/consumer tests
exercise staging even with contradictory development NODE_ENV and do not make
real HTTP requests. Static wiring tests are not successful native builds.

On Jordan's Mac/device, record results before closing TT-53:

- [ ] Migrate private files and preserve appropriate public RevenueCat keys.
- [ ] Install dependencies and regenerate Pods.
- [ ] Build/run a local target; verify the correct laptop URL.
- [ ] Build/run staging on iOS and Android; verify the compiled target/origin.
- [ ] Build a staging Release artifact and verify it still targets HTTPS staging.
- [ ] With a disposable staging test account, verify login, catalog pull, a solo
      session, rewards, account push/pull, and persistence after relaunch.
- [ ] Verify purchase/entitlement behavior separately with appropriate SDK keys;
      a URL/configuration test is not a successful purchase.

Linux validation cannot prove Xcode/Gradle signing, a native app launch, or these
real-device flows. Production remains unprovisioned and unverified.
