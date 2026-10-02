# Trail Tasks WatermelonDB Sync Architecture

This document explains how Trail Tasks uses WatermelonDB, local SQLite, the API server, and Postgres for offline-first account data.

## Vocabulary

- Local DB / on-device DB: the WatermelonDB SQLite database stored on one phone or emulator.
- Server DB / remote DB / Postgres / server-synced DB: the backend database behind the API server.
- Sync API: the server endpoints that move changes between WatermelonDB and Postgres.
- Catalog data: public/global data such as trails, parks, wilds, achievements, addons, session categories, park states, and park-wild links. This is safe to cache on every device.
- Account data: user-owned data such as the current user's row, wild unlocks/progress, completed trails, purchased trails, sessions, addons, parks, friends, and queued trails. A device should sync the logged-in user's account data, not every user's account data.
- Social/shared data: server-scoped data such as leaderboards, friend search results, current group-room state, and other users' public profile/progress summaries. This should be requested from the server when online instead of fully synced into every device's local database.

## Source of truth model

Trail Tasks is local-first for personal gameplay and server-authoritative for shared/social gameplay.

That means the local WatermelonDB SQLite database is the source of truth while the user is using one device. The UI should read from local WatermelonDB so the app keeps working offline.

Postgres is the server-synced source of truth for account identity, cross-device account data, and shared online/social features such as leaderboards, friend search, and group sessions.

This does not mean each phone should store all server data. Each device should keep only the current user's account data plus offline-safe catalog data. Social screens should ask the server for small scoped views, such as top leaderboard rows, a friend search result, or the current group room state.

A good mental model is:

```text
one device while using solo/offline app: WatermelonDB is source of truth
same account across devices: Postgres is the shared account source of truth
social/leaderboards/group sessions online: server/Postgres is authoritative
sync: reconciles the device truth with the account/server truth
```

## What belongs on the device

Each device should store:

- catalog data needed for offline browsing and gameplay;
- the logged-in user's own account/progress data;
- small optional caches of scoped social data, such as recently viewed friends.

Each device should not store:

- every user account;
- the entire global leaderboard history;
- all group-session rooms;
- every other user's private progress rows.

For example, a leaderboard screen should query the server for `top 100`, `my rank`, or `nearby ranks`. The phone can cache that response for display, but Postgres remains authoritative. A group session should use the server or future group-session service as the online source of truth for the shared room. The local DB can keep the current user's local session/account state, but it should not try to become a global social database.

## Login, local storage, and auto-login

After login, the app stores the active user identity in WatermelonDB local storage. On later app starts, `useAuth` checks local storage and restores that user automatically until logout removes the local storage keys.

That means most users will stay logged in most of the time. In that logged-in case, app startup should run normal account sync with the restored `user.id`. Normal account sync still pulls catalog updates from the server response, so logged-in users continue receiving new trails, parks, wilds, addons, and other catalog changes.

The catalog-only pull exists for the logged-out case. Its purpose is to let the app refresh public catalog content without pretending to be a user and without advancing the account sync timestamp.

Login/register behavior should follow these rules:

- Register requires internet so the server can validate that username/email are unique before local offline progress starts.
- Logging into an account that already exists locally stores that user in local storage and can run a full account pull to catch the device up from Postgres.
- Logging into an account that does not exist locally checks the server first, saves the returned account rows into local WatermelonDB, then stores that user in local storage.
- Later app launches restore the local-storage user automatically and run normal account sync for that `user.id`.
- Normal logged-in account sync still includes catalog updates, so always-logged-in users do not miss new trails/catalog content.

Shared-device behavior, such as siblings using the same tablet or a parent's phone, should be:

```text
User A logs in -> local storage restores User A on app start
User A logs out -> local storage user keys are removed
User B logs in -> local storage now restores User B on app start
```

Account sync should always use the currently restored/logged-in user's id. A device should not mix two users' account rows into one active session.

## Merge-first offline architecture

Normal account sync should be a merge flow, not a destructive replacement flow.

The product goal is:

```text
Device A creates offline facts
Device B creates offline facts
each device pushes those facts to Postgres when online
Postgres merges the facts
Postgres recomputes summary/cache fields
each device pulls the merged account state
```

This is different from Force Account Pull. Force Account Pull is a recovery tool for the case where Postgres has already been verified as the best merged state and the current device should be rebuilt from it. It should not be the normal answer to two devices having different valid offline work.

### Facts vs summaries

Trail Tasks should treat activity/progression rows as durable facts and user summary fields as cached answers.

Example:

```text
users_sessions rows = facts about hikes that happened
users.total_miles = cached/derived answer from those session rows
```

That means `users.total_miles` should not be the primary truth for mileage. It should be recalculated from merged `users_sessions.total_distance_hiked` rows whenever possible. If two devices both hiked offline, the safest merge is to preserve both devices' session rows, then recompute total miles from the union.

Good mental model:

```text
rows/events are facts
summary fields are caches
normal sync merges facts
server recomputes caches
```

### Trail completion is not one session -> one trail

Trail Tasks allows flexible trail completion:

- one trail can be completed across multiple sessions;
- one session can complete one trail;
- one session can complete multiple trails;
- one session can complete the same trail more than once if the user keeps going.

Because of that, simply adding `trail_id` to `users_sessions` is not enough to model progress correctly. A session is the container for hiking time/distance. Trail progress/completions may need their own fact rows that can connect a session to one or more trail-completion events.

A better future shape is a join/event table such as:

```text
users_session_trail_completions
  id
  user_id
  session_id
  trail_id
  distance_applied
  completed_at
  completion_order
```

The exact schema can change, but the principle is important: trail completions are facts that may occur inside sessions, not necessarily a single column on the session row.

### Table-level merge rules

Different tables need different conflict rules. A single generic “last write wins” rule is not safe enough for a great offline MVP.

Recommended MVP direction:

| Table / data | Normal sync behavior | Why |
| --- | --- | --- |
| `users_sessions` | Union/upsert by `id`; do not delete during normal sync | A session row is a fact that a hike happened somewhere. |
| `users.total_miles` | Derived from merged `users_sessions.total_distance_hiked` | Prevents one device's stale summary from overwriting another device's hike. |
| `users_completed_trails` | Merge by logical key such as `user_id + trail_id`, or move to completion event rows | Trails can be completed multiple times and across sessions, so completion history needs explicit facts. |
| `users_achievements` | Union/upsert by `user_id + achievement_id`; keep earliest `completed_at` | If earned anywhere, the achievement should remain earned. |
| `users_purchased_trails` | Union/upsert by `user_id + trail_id`; keep earliest purchase time | If purchased anywhere, the purchase should remain. |
| `users_wilds` | Union/upsert by `user_id + wild_id`; keep safest/highest progression values | Missing wild rows usually mean a device is behind, not that the wild should be removed. |
| `users_parks` | Union/upsert by `user_id + park_id`; keep max `park_level`, latest `last_completed`, and true if either side redeemed | Park progress is an unlock/progression record and should not disappear because another device is behind. |
| `users_addons.quantity` | Conflict-risk until modeled as transactions | Quantity can go up and down; “more is true” can restore consumed addons by mistake. |
| `users.trail_tokens` | Conflict-risk until modeled as transactions | Tokens can be earned and spent; balances should eventually come from a token ledger. |
| `users.trail_progress` / active trail | Needs explicit rule or derived progress from trail-progress events | Two devices can progress different active trail states offline. |
| active wild | Needs explicit one-active-wild conflict rule, likely latest action wins | Different devices can select different active wilds offline. |
| daily streak | Best derived from activity/session dates long-term | Date-based state can conflict across offline devices. |

### “More rows” usually means “more complete,” but not always

For history/unlock tables, a source with more valid rows is usually more complete:

```text
more sessions -> probably more hike history
more wild unlock rows -> probably more complete wild progress
more park rows -> probably more complete park progress
```

Those rows should normally be merged into the server, not deleted from the device.

For balances and mutable state, “more” is not always correct:

```text
more addon quantity may be stale if another device consumed addons offline
more tokens may be stale if another device spent tokens offline
higher trail_progress may conflict with a different active trail choice
```

Those values need derived calculations, transaction rows, or clear conflict rules.

### Best MVP compromise

The MVP does not need a full CRDT/event-sourcing system, but it should avoid losing the user's real work.

Before release, the highest-value hardening is:

1. Make session history append/merge-safe.
2. Stop treating `users.total_miles` as authoritative.
3. Recompute total miles from merged `users_sessions` rows locally and/or on the server.
4. Make park/wild/achievement/purchase rows union/idempotent.
5. Treat tokens, addon quantities, active trail, active wild, and daily streak as known conflict-risk areas until they get explicit transaction/event models.
6. Keep destructive replacement behavior limited to clearly labeled recovery tools after Postgres has been verified as the merged account state.

This keeps the MVP practical while moving the app toward senior-level offline-first architecture: protect user-created facts first, derive summaries second, and only replace local state when the server is intentionally trusted.

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
