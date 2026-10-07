# Trail Token transaction ledger

Trail Tokens are currency-like account facts. The MVP release should not make `users.trail_tokens` the source of truth because balances cannot explain when tokens were earned, spent, refunded, or repaired.

## Source of truth

`token_transactions` is the source of truth for Trail Token balance.

A user's balance is:

```text
sum(token_transactions.amount) where user_id = current user
```

`amount` is signed:

- positive values are earned tokens
- negative values are spent tokens
- zero-value rows are not useful and should be avoided

`users.trail_tokens` should not exist in the final MVP schema. If an old development database still has that column, treat it as migration residue only.

## Why tokens differ from miles

Mileage can be derived from `users_sessions.total_distance_hiked` because each row records a physical fact that happened.

Tokens should not be recalculated from today's formulas because old economy rules and prices can change. If a trail used to reward 10 tokens and later rewards 8, the old earned amount must stay 10. The transaction row records the amount that actually happened at that time.

## Table shape

```text
token_transactions
- id
- user_id
- amount
- type
- source_type
- source_id
- idempotency_key
- balance_after
- rule_version
- metadata
- created_at
- updated_at
```

### Field notes

- `type`: domain reason for the movement.
- `source_type`: source object family, for example `users_session`, `addon`, `trail`, `user`, `park`, or `admin_adjustment`.
- `source_id`: id of the domain object that caused the movement when available.
- `idempotency_key`: stable key that prevents duplicate earn/spend rows for the same business event.
- `balance_after`: audit snapshot after the transaction. It is not the canonical balance.
- `rule_version`: economy rule version used to compute the amount.
- `metadata`: JSON payload with price/reward details useful for support and future audits.

## Transaction types

MVP-supported types:

| Type | Sign | Source | Example |
| --- | ---: | --- | --- |
| `registration_bonus` | + | `user` | new account starting tokens |
| `session_reward` | + | `users_session` | completed trail + time reward total |
| `daily_streak_reward` | + | `users_session` | streak reward awarded during session finalization |
| `addon_purchase` | - | `addon` | buying or stacking an add-on |
| `trail_unlock` | - | `trail` | token-unlocking a trail |
| `park_reward` | + | `park` | redeeming a completed-park reward |
| `prestige_reward` | + | `user` | prestige reward |
| `manual_adjustment` | +/- | `admin_adjustment` | future support repair |
| `refund` | + | original purchase source | future refund path |

## Idempotency keys

Every earn/spend path should use a deterministic idempotency key:

| Event | Suggested key |
| --- | --- |
| Registration bonus | `registration_bonus:{user_id}` |
| Completed session reward | `session_reward:{users_session_id}` |
| Daily streak reward | `daily_streak_reward:{users_session_id}:{yyyy-mm-dd}` |
| Add-on purchase | `addon_purchase:{user_id}:{addon_id}:{client_event_id_or_timestamp}` |
| Trail unlock | `trail_unlock:{user_id}:{trail_id}` |
| Park reward | `park_reward:{user_id}:{park_id}:{park_level}` |
| Prestige reward | `prestige_reward:{user_id}:{next_prestige_level}` |

For one-time purchases such as trail unlocks, user + trail is enough. Repeatable purchases such as add-on quantities need a unique client event id or transaction id.

## Offline and sync rules

`token_transactions` is an append-only account fact table.

- Full-account pull must not replace local-only token transactions.
- Sync should merge token transaction rows incrementally by id/idempotency key.
- If two devices spend offline, both spend rows may sync. The derived balance can go negative; the product can later add server-authoritative spend rejection before production-scale use.
- The MVP local-first rule is auditability first: never hide token movement by mutating only a summary balance.

## Atomic write rules

Earn/spend side effects must be written in the same WatermelonDB batch as the domain record they belong to.

Examples:

1. Add-on purchase:
   - verify derived token balance
   - create negative `token_transactions` row
   - create/update `users_addons`

2. Trail unlock:
   - verify derived token balance and access rules
   - create negative `token_transactions` row
   - create `users_purchased_trails`

3. Completed session finalization:
   - update the `users_sessions` fact row
   - create session reward token transaction when reward > 0
   - create daily streak token transaction when the streak is awarded

## Migration policy

For pre-release development data, do not preserve `users.trail_tokens` as authoritative history. Create future token balances from transaction rows going forward. If a dev account needs a starting balance, create an explicit `manual_adjustment` or `registration_bonus` row instead of copying an unexplained summary field.

## Admin adjustment example

Example PostgreSQL query to add 100 Trail Tokens to a user's current balance as a support/admin repair:

```sql
INSERT INTO token_transactions (
  id,
  user_id,
  amount,
  type,
  source_type,
  source_id,
  idempotency_key,
  balance_after,
  rule_version,
  metadata,
  created_at,
  updated_at
)
VALUES (
  'admin-adjustment-2026-10-07-user-123',
  'user-123',
  100,
  'manual_adjustment',
  'admin_adjustment',
  NULL,
  'manual_adjustment:user-123:support-ticket-123',
  (
    SELECT COALESCE(SUM(amount), 0) + 100
    FROM token_transactions
    WHERE user_id = 'user-123'
  ),
  'manual-v1',
  '{"reason":"Support repair","ticket":"support-ticket-123"}'::jsonb,
  NOW(),
  NOW()
);
```

`COALESCE(SUM(amount), 0) + 100` calculates the `balance_after` snapshot: current derived balance plus this adjustment. Use real unique ids and a stable `idempotency_key` for the specific support case so the same adjustment cannot be inserted twice for that user. Include `created_at` and `updated_at` explicitly when running manual SQL against databases that do not apply timestamp defaults.

## Future features enabled

The ledger enables:

- token balance derivation
- token earned/spent history
- refunds
- admin adjustments
- support/debugging for missing tokens
- duplicate reward prevention
- offline conflict audits
- analytics such as weekly earned tokens or add-on spend
- eventual server-authoritative spending
