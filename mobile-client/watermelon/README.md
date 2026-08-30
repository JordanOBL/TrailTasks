# Trail Tasks WatermelonDB Sync Architecture

This document explains how Trail Tasks uses WatermelonDB, local SQLite, the API server, and Postgres for offline-first account data.

## Vocabulary

- Local DB / on-device DB: the WatermelonDB SQLite database stored on one phone or emulator.
- Server DB / remote DB / Postgres: the backend database behind the API server.
- Sync API: the server endpoints that move changes between WatermelonDB and Postgres.
- Catalog data: public/global data such as trails, parks, wilds, achievements, addons, session categories, park states, and park-wild links.
- Account data: user-owned data such as the user row, wild unlocks/progress, completed trails, purchased trails, sessions, addons, parks, friends, and queued trails.

## Source of truth model

Trail Tasks is local-first and server-synced.

That means the local WatermelonDB SQLite database is the source of truth while the user is using one device. The UI should read from local WatermelonDB so the app keeps working offline.

Postgres is the account-level source of truth across devices. It is how one device shares account progress with another device.

A good mental model is:

```text
one device while using app: WatermelonDB is source of truth
multiple devices for same account: Postgres is the shared source of truth
sync: reconciles the device truth with the account truth
```

## Sync modes

### Startup catalog pull

When the app starts without a logged-in user, it should only refresh catalog data.

This is intentionally separate from account sync because WatermelonDB stores a single `lastPulledAt` timestamp for normal sync. If a logged-out catalog pull advanced the same account sync timestamp, a later login could miss older account rows from Postgres.

Startup catalog pull should:

- pull public/global catalog tables;
- not require `userId`;
- not query user-owned tables on the server;
- not advance the normal account sync timestamp.

### Normal account sync

Normal account sync is for everyday online use after a user is logged in.

It uses WatermelonDB's pending local changes and the server's changes since `lastPulledAt`.

Use this when both device and server are already reasonably in sync.

### Force Account Push

Force Account Push is a developer/manual recovery tool for the source-device case.

Use it when a device or emulator has the account data you want and Postgres is behind.

Unlike normal sync, it does not only send rows WatermelonDB has marked as pending. It reads the local account-owned rows for the logged-in user and sends them to Postgres as updated account rows.

Use this carefully:

```text
emulator has correct progress
Postgres is behind
real phone is behind
=> run Force Account Push on emulator first
=> verify Postgres
=> then pull on the real phone
```

Do not run this from the behind/stale device unless you want that stale device to overwrite server state.

### Force Account Pull

Force Account Pull is a developer/manual recovery tool for the target-device case.

Use it when Postgres has the account data you want and the current device is behind.

It requests a full account pull instead of only rows newer than the device's `lastPulledAt`.

Use this after verifying Postgres has the correct data:

```text
Postgres has correct progress
real phone is behind
=> run Force Account Pull on real phone
```

## Expected scenarios

### 1. User creates an account online, then goes offline and hikes 5 miles

Expected behavior:

1. User creates/logs into account while online.
2. Server has the account identity in Postgres.
3. User loses service.
4. User hikes 5 miles.
5. Local WatermelonDB records the 5 miles and any related rewards/progress.
6. When service returns, normal sync should push the pending local changes to Postgres.

Result:

```text
local phone WatermelonDB: 5 miles
Postgres after sync: 5 miles
```

### 2. Same user logs into a second device after the first device synced

Example: the user hikes on their phone, syncs, then logs into a friend's phone.

Expected behavior:

1. Original phone syncs its local progress to Postgres.
2. Friend's phone logs into the same account while online.
3. Login checks the account against Postgres.
4. The app pulls the account data from Postgres into that friend's local WatermelonDB.

Result:

```text
original phone WatermelonDB: current account progress
Postgres: current account progress
friend phone WatermelonDB after login/pull: current account progress
```

Important: the friend's phone must point to the same API/Postgres environment. For Android emulator, `10.0.2.2` points to the host computer. For a physical phone, use the computer's LAN IP, such as `http://YOUR_COMPUTER_LAN_IP:5500`.

### 3. Same account is used offline on two devices before either side syncs

Example:

1. User logs into a friend's phone while online at some earlier time.
2. Friend's phone later goes offline and hikes 2 miles on that same account.
3. Original phone is online and hikes 2 miles too.
4. Friend's phone reconnects later.

This is a conflict scenario.

Expected MVP behavior:

- Trail Tasks should avoid advertising this as fully conflict-safe.
- Normal sync can merge rows that are naturally additive, such as different completed session rows with different ids.
- For single account summary fields such as `users.total_miles`, `users.trail_progress`, `users.trail_tokens`, active trail, or active wild, the current server code does not yet implement a robust conflict resolver.
- The last device to push may overwrite some summary fields.

Product/architecture decision:

For MVP, this is acceptable only if documented as a limitation. The app is offline-first for one user's device, but not yet fully multi-device concurrent-edit safe.

Safer user expectation:

```text
Use one active device per account while offline.
Sync that device before using the same account on another device.
```

Future conflict-safe behavior could calculate deltas/events instead of overwriting summary fields. For example, completed sessions could be append-only events, and total miles/tokens could be derived from those events instead of being directly overwritten by whichever device pushes last.

### 4. User creates an account offline, makes progress, then goes online and the username/email already exists

This is dangerous if allowed because the local device can create an identity that conflicts with an existing server account.

Expected MVP behavior:

- Account creation should require internet.
- The server should validate username/email uniqueness before local account use begins.
- Offline mode should be available after the account has already been created/validated online.

Result:

```text
allowed: online account creation -> offline usage -> later sync
not allowed for MVP: brand-new offline account creation -> later identity conflict
```

This avoids the hard problem of merging two independently-created accounts that claim the same username/email.

### 5. Emulator has the correct account progress, Postgres and real phone are behind

This is the manual migration/debugging case.

Expected safe sequence:

1. Stop the app on the real phone.
2. Run the API server against the intended local Postgres DB.
3. Make sure emulator points to the API server.
4. On emulator, use Force Account Push.
5. Check Postgres directly and confirm it matches the emulator.
6. Stop emulator or avoid making more progress there.
7. Make sure real phone points to the same API server using the computer LAN IP.
8. On real phone, log into the same account while online.
9. Login/full account pull should bring Postgres account rows into the real phone WatermelonDB.

Result:

```text
emulator WatermelonDB -> Postgres -> real phone WatermelonDB
```

## Current MVP limitations

The current architecture supports offline-first single-device use and account sync, but it is not a full CRDT or event-sourced multi-device conflict system.

Known limitations:

- Concurrent offline use of the same account on multiple devices can conflict.
- Some summary fields can be overwritten by the last push.
- The server does not yet reject stale writes based on each device's last pulled timestamp.
- Force Account Push is a developer/manual recovery tool, not normal user behavior.
- Group/session message-bus behavior is intentionally deferred from MVP.

## Engineering rule of thumb

For tester-ready MVP behavior:

```text
Create account online first.
Use the app offline on one active device.
When service returns, sync that device.
Before using the same account on a second device, make sure the first device has synced.
```

This keeps the product promise honest: Trail Tasks works offline locally and syncs account progress online, while clearly avoiding unsolved multi-device conflict cases.
