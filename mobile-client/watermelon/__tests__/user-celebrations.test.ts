import { Park, Trail, User, User_Session, User_Wild, Wild } from "../models";
import { EventBus } from "../../EventBus/EventBus";
import RewardService from "../../services/RewardService";
import PersistenceService from "../../persistenceService/persistenceService";
import { testDb } from "../testDB";

async function setup() {
  return testDb.write(async () => {
    await testDb.unsafeResetDatabase();
    const user = await testDb.get<User>("users").create(r => { r.prestigeLevel = 0; });
    const park = await testDb.get<Park>("parks").create(r => { r.parkName = "Acadia"; });
    const wild = await testDb.get<Wild>("wilds").create(r => { r.parkId = park.id; r.wildName = "Scout"; });
    const trail = await testDb.get<Trail>("trails").create(r => { r.parkId = park.id; });
    const session = await testDb.get<User_Session>("users_sessions").create(r => { r.userId = user.id; r.dateAdded = new Date().toISOString(); });
    return { user, park, wild, trail, session };
  });
}
const complete = (user: User, trail: Trail) => user.markTrailCompleted({ trailId: trail.id, isProMember: false, trailStartedAt: "2026-10-25T01:00:00Z" });
const finalize = (user: User, session: User_Session, xp: number) => user.finalizeSessionWithRewardsWriter({
  user, snapshot: { sessionId: session.id, userId: user.id, totalElapsedSec: 0, totalDistanceMiles: 1 },
  rewards: { trailRewards: 0, timeRewards: 0, totalTokenRewards: 0, wildXpRewards: xp },
});
async function companion(user: User, wild: Wild, xp = 90) {
  return testDb.write(() => testDb.get<User_Wild>("users_wilds").create(r => {
    r.userId = user.id; r.wildId = wild.id; r.isActive = true; r.level = 1; r.xp = xp; r.xpToNext = 100;
  }));
}

test("final trail returns committed park and new Wild once; retries never create bogus rewards", async () => {
  const { user, park, wild, trail } = await setup();
  const result = await complete(user, trail);
  expect(result).toMatchObject({ userId: user.id, parkId: park.id, parkName: "Acadia", amount: 200, newWild: { wildId: wild.id, wildName: "Scout" } });
  expect(await complete(user, trail)).toBeNull();
  expect(await user.redeemParkPass(park.id)).toBeNull();
  expect(await user.calculateTrailTokenBalance()).toBe(200);
  expect(await user.usersWilds.fetchCount()).toBe(1);
  expect((await user.usersCompletedTrails.fetch())[0].completionCount).toBe(1);
});
test("non-final trail and empty park do not redeem", async () => {
  const { user, park, trail } = await setup();
  await testDb.write(() => testDb.get<Trail>("trails").create(r => { r.parkId = park.id; }));
  expect(await complete(user, trail)).toBeNull();
  expect(await user.redeemParkPass(park.id)).toBeNull();
  const empty = await testDb.write(() => testDb.get<Park>("parks").create(() => {}));
  expect(await user.redeemParkPass(empty.id)).toBeNull();
  expect(await user.calculateTrailTokenBalance()).toBe(0);
});
test("unlock preserves auto-selection but deactivates the former active Wild atomically", async () => {
  const { user, park, trail } = await setup();
  const oldWild = await testDb.write(() => testDb.get<Wild>("wilds").create(r => { r.wildName = "Old"; }));
  const old = await companion(user, oldWild);
  await complete(user, trail);
  expect(old.isActive).toBe(false);
  expect((await user.usersWilds.fetch()).filter(w => w.isActive)).toHaveLength(1);
  expect(await user.redeemParkPass(park.id)).toBeNull();
});
test("existing Wild is not duplicated or claimed as newly unlocked on pass grant or upgrade", async () => {
  const { user, wild, trail, park } = await setup();
  await companion(user, wild);
  expect(await complete(user, trail)).toMatchObject({ newWild: null });
  await testDb.write(() => user.update(r => { r.prestigeLevel = 1; }));
  expect(await user.redeemParkPass(park.id)).toMatchObject({ parkLevel: 2, newWild: null, amount: 300 });
  expect(await user.redeemParkPass(park.id)).toBeNull();
  expect(await user.usersWilds.fetchCount()).toBe(1);
  expect(await user.calculateTrailTokenBalance()).toBe(500);
});
test("failed park commit gives no receipt or award and retry recovers saved trail without incrementing", async () => {
  const { user, park, trail } = await setup();
  const original = testDb.batch.bind(testDb);
  const batch = jest.spyOn(testDb, "batch").mockImplementationOnce((...args) => original(...args)).mockRejectedValueOnce(new Error("disk full"));
  try { await expect(complete(user, trail)).rejects.toThrow("disk full"); } finally { batch.mockRestore(); }
  expect(await user.usersParks.fetchCount()).toBe(0);
  expect(await user.calculateTrailTokenBalance()).toBe(0);
  expect(await complete(user, trail)).toMatchObject({ parkId: park.id });
  expect((await user.usersCompletedTrails.fetch())[0].completionCount).toBe(1);
});
test("zero-token session XP is durable and multi-level transition is reported only on first commit", async () => {
  const { user, wild, session } = await setup();
  const uw = await companion(user, wild);
  const result = await finalize(user, session, 200);
  expect(result.wildLevelUps).toEqual([{ userId: user.id, sessionId: session.id, userWildId: uw.id, wildId: wild.id, wildName: "Scout", fromLevel: 1, toLevel: 3 }]);
  expect(uw.level).toBe(3);
  expect((await finalize(user, session, 200)).wildLevelUps).toEqual([]);
  expect(uw.level).toBe(3);
  expect(uw.xp).toBe(40);
  expect(await user.calculateTrailTokenBalance()).toBe(0);
});
test("XP-only progress does not celebrate", async () => {
  const { user, wild, session } = await setup();
  const uw = await companion(user, wild, 0);
  expect((await finalize(user, session, 10)).wildLevelUps).toEqual([]);
  expect(uw.xp).toBe(10);
});

test("repeat hike does not automatically redeem prestige upgrades", async () => {
  const { user, trail } = await setup();
  await complete(user, trail);
  await testDb.write(() => user.update(r => { r.prestigeLevel = 1; }));
  expect(await complete(user, trail)).toBeNull();
  expect(await user.calculateTrailTokenBalance()).toBe(200);
});

test("inactive companion receives no session XP (the Pro inactive grant is not implemented)", async () => {
  const { user, wild, session } = await setup();
  const uw = await companion(user, wild);
  await testDb.write(() => uw.update(r => { r.isActive = false; }));
  expect((await finalize(user, session, 200)).wildLevelUps).toEqual([]);
  expect(uw.xp).toBe(90);
  expect(uw.level).toBe(1);
});
test("a genuinely later hike increments completion once, while its retry does not", async () => {
  jest.useFakeTimers().setSystemTime(new Date("2026-10-25T12:00:00Z"));
  try {
    const { user, trail } = await setup();
    await complete(user, trail);
    jest.setSystemTime(new Date("2026-10-26T12:00:00Z"));
    const args = { trailId: trail.id, isProMember: false, trailStartedAt: "2026-10-26T10:00:00Z" };
    await user.markTrailCompleted(args);
    await user.markTrailCompleted(args);
    expect((await user.usersCompletedTrails.fetch())[0].completionCount).toBe(2);
  } finally { jest.useRealTimers(); }
});
test("missing catalog Wild does not block committed session progress", async () => {
  const { user, wild, session } = await setup();
  const uw = await companion(user, wild);
  await testDb.write(() => wild.destroyPermanently());
  expect((await finalize(user, session, 20)).wildLevelUps).toMatchObject([{ wildName: "Your Wild", fromLevel: 1, toLevel: 2 }]);
  expect(uw.level).toBe(2);
});

test("failed SQLite session batch emits no level award and retry applies XP exactly once", async () => {
  const { user, wild, session } = await setup();
  const uw = await companion(user, wild);
  const bus = new EventBus();
  const service = new RewardService(bus, testDb, user, false);
  const dispose = service.register();
  const persistence = new PersistenceService(user, testDb, bus);
  bus.on("SESSION_REWARDS_PERSIST_FAILED", jest.fn());
  bus.on("CELEBRATION_QUEUED", jest.fn());
  const payload = { finalSnapshot: { sessionId: session.id, userId: user.id, totalElapsedSec: 0, totalDistanceMiles: 1 } as any,
    rewards: { trailRewards: 0, timeRewards: 0, totalTokenRewards: 0, wildXpRewards: 20 } };
  const error = jest.spyOn(console, "error").mockImplementation(() => {});
  const batch = jest.spyOn(testDb.adapter, "batch").mockRejectedValueOnce(new Error("disk full"));
  try {
    await expect(persistence.persistCompletedSessionWithRewards(payload)).rejects.toThrow("disk full");
    expect(service.getCelebrations()).toEqual([]);
    expect(uw.level).toBe(1);
    await persistence.persistCompletedSessionWithRewards(payload);
    expect(service.getCelebrations()).toMatchObject([{ kind: "wild_level", fromLevel: 1, toLevel: 2 }]);
    expect(uw.xp).toBe(10);
  } finally { batch.mockRestore(); error.mockRestore(); dispose(); }
});

test("failed park batch restores active companion and retry atomically unlocks just one Wild", async () => {
  const { user, park, trail } = await setup();
  const oldWild = await testDb.write(() => testDb.get<Wild>("wilds").create(r => { r.wildName = "Old"; }));
  const old = await companion(user, oldWild);
  // Save the completion first, simulating the partial-save boundary before park redemption.
  await testDb.write(() => testDb.get("users_completed_trails").create((r: any) => {
    r.userId = user.id; r.trailId = trail.id; r.completionCount = 1;
    r.lastCompletedAt = new Date().toISOString();
  }));
  const batch = jest.spyOn(testDb.adapter, "batch").mockRejectedValueOnce(new Error("disk full"));
  try { await expect(user.redeemParkPass(park.id)).rejects.toThrow("disk full"); } finally { batch.mockRestore(); }
  expect(old.isActive).toBe(true);
  expect(await user.usersWilds.fetchCount()).toBe(1);
  expect(await user.calculateTrailTokenBalance()).toBe(0);
  expect(await user.redeemParkPass(park.id)).toMatchObject({ parkId: park.id });
  expect(old.isActive).toBe(false);
  expect((await user.usersWilds.fetch()).filter(w => w.isActive)).toHaveLength(1);
  expect(await user.calculateTrailTokenBalance()).toBe(200);
});
test("service starts empty beside historical committed awards and ignores sessions with no new transition", async () => {
  const { user, wild, trail, session } = await setup();
  await complete(user, trail);
  await finalize(user, session, 200);
  const bus = new EventBus();
  const service = new RewardService(bus, testDb, user, false);
  const dispose = service.register();
  try {
    expect(service.getCelebrations()).toEqual([]);
    const persistence = new PersistenceService(user, testDb, bus);
    await persistence.persistCompletedSessionWithRewards({ finalSnapshot: { sessionId: session.id, userId: user.id, totalElapsedSec: 0, totalDistanceMiles: 1 } as any,
      rewards: { trailRewards: 0, timeRewards: 0, totalTokenRewards: 0, wildXpRewards: 200 } });
    expect(service.getCelebrations()).toEqual([]);
  } finally { dispose(); }
});
