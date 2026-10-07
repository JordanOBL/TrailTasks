# MVP database final state

This document defines the intended Trail Tasks database shape before MVP release. The goal is to make the data model safe enough for `preprod`, backups, migrations, and future production work without overbuilding infrastructure too early.

## Goals

- Make the source of truth for each user/account value explicit.
- Remove or deprecate summary columns that can be derived from durable facts.
- Avoid using mutable balances as the only record of earned/spent in-game currency.
- Keep Pro membership separate from in-game trail token purchases.
- Keep the MVP rules understandable before adding RDS, Terraform, Lambda, or production deploy automation.

## Environment assumptions

- `dev` currently uses a laptop-hosted API and local PostgreSQL.
- `sandbox` is for AWS and infrastructure experiments with disposable data.
- `preprod` will be the hosted tester environment for real devices before production.
- `prod` will hold real user data and requires stricter migration, backup, restore, and rollback discipline.

## Source-of-truth rules

| Domain | MVP source of truth | Notes |
| --- | --- | --- |
| Mileage | `users_sessions.total_distance_hiked` | `users.total_miles` should not exist as an account truth/cache for MVP. |
| Token balance | Future `token_transactions` ledger | `users.trail_tokens` is currently authoritative but should become a cache or be removed after ledger migration. |
| Pro membership | RevenueCat entitlement state | Pro is a real-money entitlement, not the same thing as trail tokens. |
| Free starter and monthly trails | `trails.is_free` plus policy scripts | Congaree/Scout stays free; five additional Pro-only trails rotate monthly. |
| Featured trail | `trail_of_the_week` | Marketing/highlight flag; the reroll picks one of the current monthly free trails. |
| Pro-only trails | `trails.is_pro_only` | Pro-by-default trail gate; monthly free can temporarily override access. |
| Token-unlocked trails | `users_purchased_trails` | Non-Pro users can unlock a selected subset with tokens; Pro users can unlock any non-Pro-only trail with tokens unless the product rule changes. |
| Add-ons owned | `users_addons` | Purchases should eventually be paired with token ledger entries. |

## Mileage accounting

Current state:

- The app now derives user mileage from completed `users_sessions` facts in important local paths.
- `users.total_miles` used to exist in WatermelonDB, PostgreSQL/Sequelize, sync normalization, leaderboards/friends queries, and cached display paths.
- The original reason for `users.total_miles` was to make internet-backed leaderboards easier, but there are no user rows worth preserving yet and keeping it creates source-of-truth confusion.

MVP direction:

- Keep `users_sessions.total_distance_hiked` as the durable fact.
- Remove `users.total_miles` as an authoritative account field.
- For leaderboards, calculate totals server-side from session rows when the feature is active.
- If leaderboard performance becomes a real issue later, add a separate server-side read model/cache instead of making `users.total_miles` the canonical source again.
- Local cached friend/leaderboard displays may store a snapshot for display, but the snapshot should be clearly treated as stale/cache data.

## Token accounting

Current state:

- `users.trail_tokens` is still the source of truth.
- Tokens can be earned from sessions/streaks and spent on add-ons or trail unlocks.
- Without a transaction ledger, historical balance cannot be audited or safely recomputed.

Problem:

A token balance is currency-like accounting. It should not be treated the same as mileage because reward rules and prices can change over time.

Example risks:

- A future reward formula change could retroactively alter derived balances if old rewards are recalculated from today's rules.
- Add-on prices or trail unlock costs could change after a purchase.
- Offline devices could both spend or earn tokens before sync.
- Bugs become hard to audit if only the final balance is stored.

MVP direction:

- Add a `token_transactions` table before treating token balance as production-safe.
- Keep `users.trail_tokens` only as a temporary cache during migration, or remove it after all read/write paths use the ledger.
- Every earn/spend operation should write an immutable transaction row.
- Purchases should be atomic: create ownership row, create token transaction, and update any cached balance together.

Suggested `token_transactions` fields:

| Field | Purpose |
| --- | --- |
| `id` | Transaction id, generated once. |
| `user_id` | Owner of the transaction. |
| `amount` | Positive for earn, negative for spend. |
| `type` | `session_reward`, `daily_streak_reward`, `addon_purchase`, `trail_unlock`, `manual_adjustment`, `refund`. |
| `source_type` | Domain object type such as `users_session`, `addon`, `trail`, or `admin_adjustment`. |
| `source_id` | Id of the source object, when available. |
| `balance_after` | Optional cache/audit value after applying transaction. |
| `metadata` | JSON/text for rule version, price, reward details, or debugging context. |
| `created_at` / `updated_at` | Sync and audit timestamps. |

## Pro entitlement and trail access

Product language should use Pro consistently.

Current naming issue:

- Some code uses subscription/subscriber language such as `is_subscribers_only`.
- The app UI and product language use Pro.

MVP direction:

- Rename trail entitlement column to `is_pro_only`.
- Keep RevenueCat as the source of truth for whether a user is Pro.
- Do not mix Pro entitlement with trail-token purchase records.

## Trail access rules

MVP product rules:

1. Congaree, Scout's park, is the full free starter park so non-Pro users can complete one park and unlock Scout.
2. Four sampler parks expose one short/non-Pro trail each: Cuyahoga Valley, Saguaro, Petrified Forest, and New River Gorge.
3. All other trails are Pro-only by default.
4. Each month, five additional Pro-only trails are temporarily free.
5. The five monthly free trails rotate on a scheduled job at 3:10 AM America/New_York on the first day of each month.
6. Non-Pro users can access the permanent free Scout trails and the current monthly free trails.
7. Non-Pro users can unlock only non-Pro sampler trails with trail tokens.
8. Non-Pro users cannot unlock `is_pro_only = true` trails with tokens unless the trail is temporarily free for the monthly rotation.
9. Pro members can access every trail.
10. `trail_of_the_week` is a featured/highlight flag chosen from the current five monthly free trails, not a separate access rule.

Important product decision:

- `is_pro_only` should mean “requires active Pro entitlement,” not “costs tokens.”
- Token-locked trails and Pro-only trails are separate gates.

Suggested future trail access fields:

| Field | Purpose |
| --- | --- |
| `is_pro_only` | Active Pro required by default. Token purchases do not unlock this gate. Monthly free can temporarily expose selected Pro-only trails. |
| `is_token_unlockable` | Deferred. Not needed for MVP while all trails are token-unlockable in principle. |
| `unlock_cost_tokens` | Deferred. Not needed for MVP because unlock cost is derived from distance. |
| `is_monthly_free` or monthly rotation table | Whether the trail is part of the current five monthly bonus trails. |
| `trail_of_the_week` | Marketing/highlight flag selected from the current monthly free trails. |

A separate monthly rotation table may be better than a single boolean once history matters:

```text
monthly_free_trails
- id
- trail_id
- month_key
- starts_at
- ends_at
- created_at
- updated_at
```

For MVP, a boolean may be acceptable if the cron job only needs to mark the current five free trails and historical rotation is not needed.

## Economy model

The MVP trail economy is code-defined and documented in `docs/trail-economy.md`.

Important MVP decisions:

- Do not add per-trail unlock-cost columns for MVP.
- Trail unlock cost is derived from `trails.trail_distance`.
- All trails are token-unlockable in principle, but non-Pro users cannot buy `is_pro_only = true` trails unless the trail is currently free.
- Pro users can buy Pro-only trails with tokens.
- Completed-trail token rewards are also distance-derived.

## Add-on and trail purchases

Add-on purchase should eventually be one durable operation:

1. Check the user's token balance.
2. Create a negative `token_transactions` row for the add-on cost.
3. Create or increment the `users_addons` row.
4. Update cached token balance if a balance cache still exists.

Trail unlock should follow the same pattern:

1. Check access rules.
2. Confirm the trail is token-unlockable for the user's current entitlement.
3. Check the user's token balance.
4. Create a negative `token_transactions` row for the unlock cost.
5. Create the `users_purchased_trails` row.
6. Update cached token balance if a balance cache still exists.

## Event bus and services

The EventBus should remain a way to announce domain events, not the source of truth for accounting.

Recommended shape:

```text
SessionEngine emits session lifecycle events
RewardService calculates reward amounts
PersistenceService persists completed session facts
Token/Economy accounting writes token transactions
```

A separate token/economy service can start as an in-app domain service or Watermelon writer. It does not need to be a separate backend microservice for MVP.

When the server becomes authoritative for token spending, the same rules should move server-side so token spend and ownership writes happen transactionally in PostgreSQL.

## Tables or columns to remove, rename, or add

Remove or deprecate:

- `users.total_miles` as an authoritative field.

Rename:

- `trails.is_subscribers_only` / `is_subscription_only` to `trails.is_pro_only`.

Add:

- `token_transactions`.
- A monthly free trail representation, either `trails.is_monthly_free` for MVP simplicity or a `monthly_free_trails` table for history.
- Do not add `unlock_cost_tokens` for MVP; trail unlock cost is distance-derived in code.

Keep:

- `users_sessions` as mileage/session fact table.
- `users_purchased_trails` as token-unlocked trail ownership.
- `users_addons` as add-on ownership.
- `trail_of_the_week` as a highlight/marketing flag selected from the current monthly free trails, not a separate access rule.

## Suggested migration order

1. Document final state and create follow-up tickets.
2. Rename subscription-only trail fields to `is_pro_only` across mobile, API, sync, tests, and seed data.
3. Add token-access fields and monthly-free trail representation.
4. Add token transaction ledger schema and tests.
5. Move add-on and trail purchase writes to the token ledger.
6. Move session/streak token earnings to the token ledger.
7. Treat `users.trail_tokens` as a cache or remove it after reads/writes are migrated.
8. Remove `users.total_miles` from local/server schemas and update leaderboard/friend queries to derive from session facts.
9. Add backup/restore runbook once the intended MVP schema is clear.

## Open questions

- Should monthly free trail rotation be stored as history (`monthly_free_trails`) or current-state booleans on `trails` for MVP?
- Should Pro users unlock every non-Pro-only trail with tokens, or should some trails be neither free nor token-unlockable until later content releases?
- Should token transactions be local-first and synced, or server-authoritative before `preprod`?
- What should happen if an offline client tries to spend tokens that were already spent on another device?
- What minimum leaderboard functionality is needed for MVP, if any, versus post-MVP?
