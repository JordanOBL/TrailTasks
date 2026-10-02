# Trail Tasks monetization recommendation

## Comparable apps checked

Trail Tasks sits closest to gamified focus/productivity apps with cozy collection loops:

- Forest: focus timer where completed focus grows trees. App Store page lists 60M users, 4.8 rating, about 49K ratings, free with in-app purchases, and Forest Plus benefits such as faster coin rewards, exclusive trees, early seasonal trees, and real-tree planting.
- Flora: focus/to-do/habit app where users grow trees. App Store page lists 2.5M+ users, 4.8 rating, about 82K ratings, free with in-app purchases, friend planting, habits, stats, and optional real-tree impact.
- Focus Plant: gamified focus timer where focus creates raindrops for plants/world restoration. App Store page lists 6M+ users, 4.7 rating, about 5.4K ratings, free with in-app purchases, and a SuperPass subscription listed at $4.99/month.
- Focus Friend: cozy focus timer with a character companion, prizes, room decoration, app blocking, and skins. App Store page shows 4.7 rating, about 4.3K ratings, free with in-app purchases, and Editors' Choice.
- Study Bunny: focus timer with a pet, coins, shop items/music, to-do list, flashcards, and study tracker. App Store page shows 4.7 rating, about 21K ratings, free with in-app purchases.
- Finch: self-care pet/habit app. App Store page shows 4.9 rating, about 744K ratings, free with in-app purchases, and Editors' Choice.
- Habitica: RPG task manager. App Store page says it can be fully enjoyed for free, with optional subscriptions at $4.99/month, $14.99/3 months, $29.99/6 months, and $47.99/year.

## Pattern

The successful apps generally do not sell the timer itself as the only paid value. They make the core habit loop free, then monetize depth, collection, personalization, social/community, stats, and supporter-style perks.

For Trail Tasks, that means the free user should be able to understand the magic: focus session -> virtual hiking progress -> reward/progress -> desire to continue. Pro should make that loop deeper and more expressive, not block the first taste.

## Recommended MVP model

Use one simple entitlement: Trail Tasks Pro.

Recommended launch pricing:

- Monthly: $4.99/month
- Annual: $29.99/year during early launch, later test $39.99/year if retention is good
- Optional later lifetime/founding purchase: $49.99-$79.99, but do not add this until the subscription funnel is stable

Recommended free tier:

- Solo sessions
- A small starter set of free trails/parks
- Basic Home progress
- Basic Logbook/Stats
- Current active wild visible in the loop
- Earned progress/rewards enough to prove the product

Recommended Pro tier for MVP:

- More/all trails or parks
- Trail queue/convenience features
- More session duration options
- Richer stats filters/categories
- Current-wild visual delight, if framed as extra cosmetic polish rather than pay-to-win
- Support development / early supporter framing

Do not use these as active Pro promises yet:

- Group sessions
- Leaderboards
- Friends
- Go WebSocket/server-backed features
- Message bus features that are not built/tested
- Prestige
- Add-on store economy

Those can appear as coming-soon roadmap copy, but they should not be the reason a user is asked to pay in the MVP.

## Subscription gating recommendation

Current behavior sends unsubscribed users to Subscribe for Leaderboards and Group Sessions. That is risky for MVP because those features are deferred and not the value we want to sell yet.

Recommended behavior:

- If a feature is deferred or untested, route to Coming Soon, not Subscribe.
- If a feature is real and Pro-only, route unsubscribed users to Subscribe.
- Subscribe copy should only promise current working Pro value.

So for TT-25:

- Leaderboards: Coming Soon, not Subscribe.
- Group Sessions: Coming Soon, not Subscribe.
- Friends: Coming Soon, not Subscribe.
- Trail Queue / extra trails / extra session options: acceptable Subscribe candidates if they are real and tested.

## Rive/wilds recommendation

Yes: include current wild animation in MVP.

Reason: compared with Forest, Flora, Focus Friend, Study Bunny, Finch, and Habitica, the emotional hook is the companion/collection/progress feedback. Trail Tasks already has the wild concept and `rive-react-native`; using the current characters makes the MVP feel like a game instead of a plain timer.

Scope guard:

- Do not add new wilds for MVP.
- Animate existing/current wilds only.
- Keep static image fallback for wilds without stable Rive assets.
- Use animation in high-value visible moments: Home active wild, Active Session companion, Results/reward moment.
- Do not redesign rewards/progression just to support animation.

## Best next tickets from this recommendation

1. TT-25: Defer group/social screens cleanly.
2. New ticket: Subscription/paywall MVP polish.
3. New ticket: Current wild Rive MVP pass.
4. TT-23: Home progress from WatermelonDB.
5. TT-24: Logbook/Stats from completed sessions.
