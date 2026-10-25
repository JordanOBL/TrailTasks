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
                 -> CELEBRATION_QUEUED (also emits the streak-specific event)
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
RewardService therefore retains pending celebration identities. Home subscribes
to `CELEBRATION_QUEUED` AND reads that pending queue when it mounts. It only
renders a modal when focused, and acknowledges the specific celebration when
dismissed. Duplicate receipts are deduplicated even after
acknowledgement. The queue is account-scoped, survives Home unmount/focus changes
and Pro-membership refreshes, and clears when the account service is disposed.

This queue is in memory, not a durable notification inbox. It does not survive
app process termination or logout, and historical transactions pulled by sync do
not trigger celebrations. The underlying award remains in the durable ledger.

Confetti uses existing React Native Animated APIs: no new dependency, native
module, or Pod changes. It respects Reduce Motion and has no decorative screen
reader content. Button dismissal and native modal dismissal are both supported.

## Park-pass completion, Wild unlocks, and Wild level-ups

The same RewardService now owns one typed celebration queue for daily streaks,
park-pass completion, and Wild level-ups. These are announcements of committed
local gameplay facts, not additional reward-granting operations.

```
SESSION_TRAIL_COMPLETED
  -> PersistenceService awaits markTrailCompleted
     -> persist trail completion
     -> first-pass eligibility check and redeemParkPass
        -> atomic batch: park pass + park token transaction + new Wild if needed
        -> return committed park receipt
     -> PARK_REWARD_COMMITTED
        -> RewardService queues combined park-pass/Wild-unlock celebration

SESSION_REWARDS_PERSISTED
  -> RewardService queues newly committed daily-streak and Wild-level receipts
     -> CELEBRATION_QUEUED
        -> focused Home presents one celebration at a time
```

Completing the last required trail can grant its park reward while a session is
running. The modal waits for focused Home instead of interrupting the timer.
A park celebration includes the confirmed token amount and newly unlocked Wild;
an already-owned Wild is not described as a new unlock. Unlocking grants ownership
only: the new Wild starts inactive, and the selected companion is not changed or
deactivated. The user explicitly selects a different companion through the Wild
selection UI. Session XP therefore remains with the selected Wild after a park
unlock. This also applies when no companion is currently active: unlocking does
not silently choose one.
Automatic trail completion remains first-pass-only: it does not introduce an
extra automatic prestige-upgrade grant on repeat hikes.

Redemption verifies nonempty park eligibility and checks the park/level reward
identity before preparing a grant. A retry must not mint another transaction,
duplicate a Wild, or count the same trail completion twice. If the trail fact
saved but park redemption failed, retrying can still finish the park grant.
Within the service lifetime, a successful next-trail assignment is retained
separately from park persistence so a retry does not consume a second Pro queue
entry or reset progress again. This is not a new durable cross-restart trail-event
replay/outbox system.

Session finalization returns a Wild-level receipt only when committed XP crosses
a level boundary. A multi-level gain is one celebration showing the previous and
new level, not one modal per intermediate level. Ordinary XP progress does not
celebrate. A zero-token session still records its session-reward identity with a
zero amount so replay cannot apply Wild XP again; this does not change the token
balance or XP formula. Level-up display metadata must not prevent saving an
otherwise valid reward when a Wild catalog name is unavailable.

The queue deduplicates reward identities, including after dismissal. Streak,
park, and level-up rewards are displayed sequentially rather than as overlapping
modals. Its account scope, navigation lifetime, Reduce Motion behavior, and
in-memory restart/logout limitation are the same as described above. Syncing
historical park ownership or Wild levels does not enqueue a celebration.

## Backpack consumables: explicit selection, one use

Owned inventory and the equipped backpack are different state:

- Buying or owning an item does not equip it.
- Explicitly adding an item to a backpack applies it to that session only.
- Successful session creation atomically saves the session, its `sessions_addons`
  consumption receipts, and a decrement of exactly one owned copy per selected
  add-on. The last owned copy is marked deleted; additional copies remain in
  inventory. Ending/quit does not consume another copy or refund the used one.
- After that successful commit, the equipped draft slots are cleared. The running
  engine keeps the committed session's effect configuration, not the empty next
  draft. Later sessions have no items/effects until explicitly equipped again.
- A failed database batch leaves inventory unchanged and can be retried. Repeated
  Start taps are guarded; an engine-start retry reuses the already-created session
  and its effect snapshot instead of consuming items again.

The reported reuse illusion had two separate causes: BackpackModal mutated shared
`DEFAULT_BACKPACK` slot objects through shallow copies, and the current
PersistenceService session-creation path bypassed the older consumption writer.
The next screen could therefore look equipped while its effect values had reset.
Slots are now copied immutably, every options instance gets fresh slots, inventory
quantity changes are observed, and the active path calls the atomic writer.

Focused regressions use the reported Ultralight II and Trail Mix II pair:
Ultralight II sets minimum/starting pace to 3 mph; Trail Mix II sets the pace
increase amount to 0.5 mph, using existing catalog values. With two owned copies
of each: explicitly equipped first session leaves one of each, a second session
without equipping changes neither inventory nor base effects, and a third session
with explicit re-equipping consumes the final copy. Configured set count is not
reset by editing the backpack. Tests use isolated fixtures, not staging inventory.

Selection and start validation share mileage/Pro slot eligibility. An item cannot
be placed into a locked slot or consumed when its effect would be ignored. Water
Bottle (`break_time_reduction`) and First Aid (`penalty_reduction`) effects are
not implemented in the current engine: backpack selection labels them unavailable,
and the writer rejects them before consuming anything. This safety guard does not
implement or invent those effect formulas; existing inventory is retained.

The retry snapshot for a persisted session whose engine has not started is held
in the current options component. It avoids a second consume while that component
survives, but is not a durable launch-resume record across unmount/process restart.
No past session use is retroactively charged, and the earlier auto-selected Wild
is not automatically changed back; the user can explicitly select their preferred
companion once. Neither correction requires resetting user data.

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
- [ ] With a disposable account that has one unfinished trail in a park, finish
      that trail during a session. Verify its park pass, one park-reward ledger
      row, and the associated Wild ownership save. The timer is not interrupted,
      the selected companion does not change, and the new Wild remains inactive.
      Verify session XP still goes to the selected companion; manually choosing
      the new Wild afterward switches it normally.
- [ ] Finish the session and return to Home. See one combined park-pass/Wild
      celebration with the correct park, Wild artwork/name, and token amount.
      Dismiss and navigate away/back: it does not repeat.
- [ ] Cross an active Wild's XP threshold during session finalization. See its
      committed old/new levels on Home; verify the displayed level matches the
      owned Wild. XP below the threshold does not show a level-up modal.
- [ ] Earn a park completion, streak bonus, and/or Wild level-up together. See
      queued celebrations one at a time; dismissing one exposes the next.
- [ ] Verify an already-owned Wild is not announced as newly unlocked, and a
      repeat hike does not grant the same park reward again.
- [ ] Enable Reduce Motion; every celebration remains readable without confetti
      animation, and both button and native dismissal work.
- [ ] Logout/switch accounts; no old account celebration appears.
- [ ] Relaunch/sync on a disposable install: durable park/Wild/token state remains,
      but historical synced awards do not replay modals. The pending queue itself
      is intentionally not durable across process termination/logout.
- [ ] With a disposable account owning multiple copies, explicitly equip
      Ultralight II and Trail Mix II. Start a session: owned quantity decreases
      by one each, starting pace is 3 mph and each normal pace increase is 0.5 mph.
      After ending it, open a new session: backpack slots are empty. Start without
      re-equipping: remaining inventory is unchanged and base pace effects apply.
      Explicitly equip again: one more copy is consumed, not the entire inventory.
- [ ] Verify persistence/server sync separately: reopening only proves local state.

No AWS writes, server/schema migrations, reward-rate changes, or production-data
operations are part of this patch. Automated tests do not establish successful
native builds or visual/device acceptance.
