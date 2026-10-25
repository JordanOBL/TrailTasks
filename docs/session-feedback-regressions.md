# TT-59: post-session accounting and UI regressions

## Reported symptoms

During iOS staging acceptance, session results showed 5 tokens while the account
balance increased from 45 to 65. Stats mileage updated after a session but Home
kept the previous total. Skipping a break briefly rendered an invalid countdown.
The specific staging transaction rows were not remotely inspected; the token
explanation is grounded in the code and reproduced with isolated SQLite facts.

## Existing services, explicit responsibilities

No new TransactionService or notification-service context is introduced.

```
SessionEngine: SESSION_COMPLETED
  -> RewardService calculates session rewards
     -> REWARDS_CALCULATED
        -> PersistenceService awaits User.finalizeSessionWithRewardsWriter
           -> atomic batch: session facts + session tokens + eligible streak tokens
           -> SESSION_REWARDS_PERSISTED (confirmed receipt)
              -> SessionScreen shows confirmed token breakdown
              -> RewardService queues a newly committed streak transaction
                 -> DAILY_STREAK_REWARD_COMMITTED
                    -> focused Home shows reward modal + confetti
```

A calculated reward is a proposal, not proof it was saved. The writer returns a
receipt only after its batch resolves. Failed writes produce a failure event,
not a success receipt or streak celebration. The fire-and-forget persistence
listener handles rejection and permits a later retry. Existing signed token
transactions and session distance facts remain the source of truth.

The results screen separately displays session tokens, daily-streak bonus, and
their confirmed total. Pending/failed persistence is explicit instead of claiming
an unconfirmed award. Reward formulas, daily threshold, and bonus amount are
unchanged. Repeated finalization checks existing session/daily ledger facts so
it does not insert duplicate token rows or replay a streak celebration.

## Why queue an event?

An event bus is not a history: an unmounted listener cannot hear an earlier event.
RewardService therefore retains pending streak transaction identities. Home
subscribes to the typed committed-award event AND reads that pending queue when
it mounts. It only renders a modal when focused, and acknowledges the specific
transaction when dismissed. Duplicate receipts are deduplicated even after
acknowledgement. The queue is account-scoped, survives Home unmount/focus changes
and Pro-membership refreshes, and clears when the account service is disposed.

This queue is in memory, not a durable notification inbox. It does not survive
app process termination or logout, and historical transactions pulled by sync do
not trigger celebrations. The underlying award remains in the durable ledger.

Confetti uses existing React Native Animated APIs: no new dependency, native
module, or Pod changes. It respects Reduce Motion and has no decorative screen
reader content. Button dismissal and native modal dismissal are both supported.

## Home mileage

Home was already calculating mileage from session facts, but its ordinary query
observation tracked membership rather than distance changes within existing rows.
It now observes the `total_distance_hiked` column. A real SQLite regression keeps
the exact same session IDs and updates a session from zero to 0.48 miles; the
observed derived total changes from 82.81 to 83.29. Home now matches Stats by
formatting mileage to two decimal places, including trailing zeros (83.20).

## Skipped-break countdown

Previously skip set break elapsed time to the duration and waited for a tick.
That tick could publish an over-limit break snapshot before transitioning.
Skip now synchronously applies the existing break-end rules and publishes the
resulting coherent snapshot. Natural and skipped breaks share those rules,
including long-break completion and the existing auto-continue boundary. It does
not add artificial elapsed time. The view also clamps negative/non-finite values
so invalid countdowns cannot reach the visible text.

## Verification

Regression tests cover actual SQLite mileage observation, committed ledger/receipt
flow, post-commit event timing and failures/retry, notification queue deduplication,
account isolation and focus/remount handling, reward breakdown, reduced-motion
modal behavior, skipped short/long breaks, and timer display bounds. EventBus
cleanup/rejection handling and provider membership lifetime have focused tests.

Run from the repository root:

```bash
npm --prefix mobile-client run quality:release
```

## Staging simulator/device acceptance (not automated here)

Use a disposable staging account/install. Do not reset real user data or change
the device date to force rewards.

- [ ] Complete a qualifying session; compare the ledger-backed balance change to
      the displayed session/streak receipt. No streak row should be added twice.
- [ ] Return to Home; see one streak modal with the actual award and streak day,
      dismiss it, then navigate away/back and verify it does not repeat.
- [ ] Complete another session on the same qualifying day: normal session rewards,
      no second daily bonus or duplicate modal.
- [ ] Home mileage updates without relaunching and matches Stats to two decimal places.
- [ ] Skip a short break; focus countdown immediately shows a valid next phase.
      Also verify long-break skip with auto-continue off/on.
- [ ] Enable Reduce Motion; reward remains readable without confetti animation.
- [ ] Logout/switch accounts; no old account celebration appears.
- [ ] Verify persistence/server sync separately: reopening only proves local state.

No AWS writes, server/schema migrations, reward-rate changes, or production-data
operations are part of this patch. Automated tests do not establish successful
native builds or visual/device acceptance.
