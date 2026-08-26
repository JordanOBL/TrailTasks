# Trail Tasks MVP Scope

This document defines the first shippable Trail Tasks MVP. Its job is to keep the project focused on a reliable offline solo Pomodoro hiking loop and to make it clear when a feature belongs in a later PR.

## MVP goal

A user can open the mobile app, choose a trail and session options, complete or quit a solo focus session, and see their progress, distance, and rewards reflected consistently afterward.

The MVP is not trying to prove social gameplay, online sync, monetization, or the full long-term reward economy. Those ideas can stay in the product vision, but they should not block shipping the first useful solo experience.

## Must-have for MVP

### Solo session setup

- User can start a solo session from the mobile app without needing the API server, WebSocket server, friends, or an account flow.
- User can choose a trail that has enough local data to display a name, distance, and progress.
- User can choose the basic session options needed for a Pomodoro-style focus session.
- Starting a session creates the runtime state needed by the session engine and active session UI.

### Active solo session

- Active session screen shows the current timer state clearly.
- User can start, pause/resume if supported by the current UI, complete, or quit a session without crashing.
- Trail progress increases from the session engine rules rather than from duplicated one-off UI state.
- Distance and progress values shown during the session are understandable to the user.
- Session end behavior is deterministic: completing and quitting should lead to different persisted outcomes when the product expects them to.

### Persistence and rewards

- Completed session data is persisted locally in WatermelonDB.
- Trail distance/progress is persisted from a single source of truth.
- Reward calculations are deterministic and idempotent: completing the same session should not accidentally grant duplicate rewards.
- Token/reward totals update after a completed session.
- Quitting or abandoning a session should not grant completion-only rewards.

### Post-session visibility

- Home screen reflects the latest persisted trail progress, distance, and token/reward state.
- Logbook shows completed sessions with useful basic details: date, session/trail name, category if available, focus time, distance, and reward information if available.
- Stats screen shows basic aggregate progress from completed sessions, such as total focus time and total distance.
- Empty states are friendly and do not look broken.

### Offline-first behavior

- The MVP works without starting the API server.
- The MVP works without starting the Go WebSocket group-session server.
- User progress required for the solo loop is available locally after app restart.
- Network-only features must be hidden, disabled, or clearly marked as coming soon.

### Basic quality gate

- There is a documented local command path for the mobile client quality check.
- Any remaining TypeScript or test failures are triaged so they are clearly either launch-blocking or deferred.
- Visible MVP screens should not crash during the manual QA script below.

## Nice-to-have, but not required for MVP

These can be included if they are already working and low-risk, but they should not delay the first solo MVP:

- Polished animations for trail progress, XP rings, or reward moments.
- More detailed stats breakdowns by week, park, category, or trail difficulty.
- Achievement badges beyond the basic completion/reward data already needed for the solo loop.
- More trails, parks, images, or richer trail metadata.
- Pause/resume polish beyond the behavior currently supported by the session engine.
- Better design polish for empty states and loading states.
- Additional unit tests around helper functions, as long as they do not require broad architecture work.
- Developer setup documentation beyond the commands needed to run the MVP locally.

## Explicitly not MVP

The following features are deferred. Bugs in these areas are only launch blockers if they crash visible MVP flows or prevent the app from building/running the solo loop.

### Group sessions and social features

- Group hiking sessions.
- Friends list.
- Friend invites.
- Shared group progress.
- Group session chat or message bus behavior.
- Group session type cleanup that depends on the redesigned session model.
- Go WebSocket server protocol changes.
- Go WebSocket server fixes that are only needed for group sessions.

Reason: the session model has changed enough that group sessions need their own message bus and probably server-side protocol work. That should be designed as a separate follow-up instead of patched into the solo MVP branch.

### Competitive/community features

- Global leaderboards.
- Friend leaderboards.
- Weekly competitions.
- Special events and challenges.
- Public profiles.

### Long-term progression and monetization

- Prestige system.
- Store/add-ons such as hiking poles, energy bars, trail shoes, bike, or water bottle.
- Premium subscription behavior.
- Unlock economy beyond what is needed to show basic MVP reward progress.
- Advanced park-level reward reset behavior.

### Backend-dependent features

- Online account sync.
- API-backed authentication.
- Server-authoritative session history.
- Multiplayer persistence.
- Production deployment work.

## Manual QA script: complete solo session

Use this script before calling the MVP shippable. Record the device/simulator, branch, and app build used for the run.

### Setup

1. Install mobile dependencies.
2. Start the mobile app in the normal local development path.
3. Do not start the API server unless a test explicitly says it is required.
4. Do not start the Go WebSocket server.
5. Start from a clean enough local app state that progress changes are easy to observe.

### Happy path

1. Open the app.
2. Confirm the Home screen loads without a crash.
3. Note current visible trail progress, total distance, tokens/rewards, and any visible stats.
4. Navigate to the flow for starting a solo session.
5. Choose a trail.
6. Choose the basic Pomodoro/session options.
7. Start the session.
8. Confirm the active session screen shows timer and trail progress information.
9. Let the session advance enough for visible distance/progress to change.
10. Complete the session.
11. Confirm the app navigates to the expected post-session/result state.
12. Confirm the completed session shows the expected distance/progress/reward summary.
13. Return to Home.
14. Confirm Home reflects the completed session's persisted progress and rewards.
15. Open Logbook.
16. Confirm the completed session appears with useful details.
17. Open Stats.
18. Confirm total focus time and/or total distance include the completed session.
19. Fully close and reopen the app.
20. Confirm Home, Logbook, and Stats still reflect the completed session.

### Quit/abandon path

1. Start another solo session.
2. Let the timer/progress advance briefly.
3. Quit or abandon the session.
4. Confirm the app returns to the expected screen without crashing.
5. Confirm completion-only rewards are not granted.
6. Confirm any partial progress behavior matches the intended product rule.
7. Confirm Logbook and Stats do not present the quit session as a completed successful hike unless that is explicitly intended.

### Offline path

1. Disable network access or run in a local state where backend services are not available.
2. Open the app.
3. Start and complete a solo session.
4. Confirm the solo loop still works.
5. Confirm no visible MVP screen depends on the API server or WebSocket server.

### Deferred-screen smoke check

1. If Friends, Group Session, or Leaderboards are visible, open each one once.
2. Confirm each visible deferred screen either:
   - shows a coming-soon/empty state, or
   - safely navigates away from unavailable functionality.
3. Confirm none of these screens block the solo session flow.

## Launch-blocking bugs

A bug should block MVP launch if any of the following are true:

- App cannot install, start, or load the initial MVP route.
- Home screen crashes during normal use.
- User cannot start a solo session.
- User cannot complete or quit a solo session.
- Timer/session state becomes impossible to understand or control during normal use.
- Completed solo session data is lost after app restart.
- Completion grants obviously wrong or duplicate rewards.
- Quit/abandon grants completion-only rewards.
- Home, Logbook, or Stats show materially contradictory persisted data after a completed session.
- A visible MVP screen requires the API server or Go WebSocket server to be running.
- A deferred group/social screen is visible and crashes when opened.
- The documented local quality gate cannot be run at all because of missing scripts or broken dependency setup.

## Non-blocking bugs for MVP

A bug should usually be deferred if it only affects:

- Group sessions.
- Friends.
- Leaderboards.
- Go WebSocket protocol behavior.
- API/server features not used by the offline solo loop.
- Prestige, subscriptions, store/add-ons, or advanced achievements.
- Cosmetic polish that does not confuse the user or hide important progress.
- Extra stats breakdowns beyond the basic MVP totals.

## Follow-up tickets suggested by this scope

- Make Home progress read from WatermelonDB as the source of truth.
- Make Logbook and Stats reflect completed sessions.
- Defer or mark Friends, Group Session, and Leaderboards as coming soon.
- Add a focused group-session design ticket for the new message bus and Go server protocol once the solo session model is stable.
- Keep broad type cleanup separate from MVP unless it blocks the solo quality gate or visible solo screens.
