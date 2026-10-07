# Trail economy model

This document locks the MVP Trail Tasks token model for trail unlock costs and session rewards.

## Trail access and purchase rules

All trails are unlockable with trail tokens in principle. Whether a user can buy a specific trail depends on membership, current access, and token balance.

A user can start a trail when any of these are true:

- The trail is the user's current trail.
- The trail is currently free (`trails.is_free = true`).
- The user already purchased the trail (`users_purchased_trails`).
- The user already completed the trail.

A user can buy a trail with tokens when:

- The trail is not already accessible.
- The user has enough trail tokens for the distance-derived unlock cost.
- Either the user is Pro, or the trail is not Pro-only.

Free/non-Pro users cannot buy `is_pro_only = true` trails unless the trail is currently free through the monthly rotation. Pro users can buy Pro-only trails with tokens.

## Trail unlock cost

Unlock cost is based only on trail distance:

| Trail distance | Unlock cost |
| --- | ---: |
| `< 5` miles | 5 trail tokens |
| `>= 5` and `< 10` miles | 10 trail tokens |
| `>= 10` and `< 20` miles | 25 trail tokens |
| `>= 20` miles | 50 trail tokens |

The app source of truth is `mobile-client/helpers/Trails/trailEconomy.ts`.

## Completed-trail token rewards

Completed trail rewards use a simple distance formula:

```text
max(5, ceil(completed_trail_distance_miles * 3))
```

Examples:

| Completed trail distance | Reward |
| --- | ---: |
| 1 mile | 5 trail tokens |
| 1.7 miles | 6 trail tokens |
| 10 miles | 30 trail tokens |

If a session completes multiple trails, calculate the reward for each completed trail and sum them.

Flat token bonuses apply after base completed-trail rewards. Percent bonuses apply after flat bonuses.

## Time token rewards

Focus/session time rewards are separate from completed-trail rewards:

| Rule | Reward |
| --- | ---: |
| Under 15 minutes | 0 trail tokens |
| Each full 15-minute block | 5 trail tokens |
| Each full 45-minute block | +25% of the base time-token reward |

Examples:

| Elapsed time | Time reward |
| --- | ---: |
| 14:59 | 0 |
| 30:00 | 10 |
| 45:00 | 18 |

## Wild XP rewards

Active Wild XP remains:

```text
floor(total_session_distance_miles) * 10 XP
```

The monthly featured trail is a discoverability/highlight mechanic. It does not change token rewards for MVP.

## Deferred economy work

Do not add schema columns for unlock cost unless the economy becomes content-managed later. For MVP, distance-derived costs are intentional and should stay code-defined.

Deferred production-hardening work:

- immutable token transaction ledger
- server-authoritative token spending
- audit/replay support for old reward rules
- monthly free trail history table if rotation history matters
