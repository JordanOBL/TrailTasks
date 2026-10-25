import { EventBus } from "../EventBus/EventBus";
import RewardService from "./RewardService";
import { waitFor } from "@testing-library/react-native";
import PersistenceService from "../persistenceService/persistenceService";
const park = { userId: "u", transactionId: "p", parkId: "park", parkName: "Acadia", parkLevel: 1, amount: 200, newWild: { wildId: "w", userWildId: "uw", wildName: "Scout" } };
const level = { userId: "u", sessionId: "s", wildId: "w", userWildId: "uw", wildName: "Scout", fromLevel: 1, toLevel: 3 };
const streak = { userId: "u", sessionId: "s", transactionId: "t", amount: 15, dailyStreak: 3 };
const summary = { userId: "u", sessionId: "s", sessionTokens: 0, streakBonus: 15, totalTokens: 15, dailyStreakAward: streak, wildLevelUps: [level] };

test("one typed queue orders park, streak, level celebrations and dedupes after dismissal", () => {
  const bus = new EventBus();
  const service = new RewardService(bus, {} as any, { id: "u" } as any, false);
  const dispose = service.register();
  bus.on("CELEBRATION_QUEUED", jest.fn());
  bus.on("DAILY_STREAK_REWARD_COMMITTED", jest.fn());
  bus.emit("PARK_REWARD_COMMITTED", park);
  bus.emit("SESSION_REWARDS_PERSISTED", summary);
  expect(service.getCelebrations().map(a => a.kind)).toEqual(["park", "daily_streak", "wild_level"]);
  service.getCelebrations().forEach(a => service.acknowledgeCelebration(a.id));
  bus.emit("PARK_REWARD_COMMITTED", park);
  bus.emit("SESSION_REWARDS_PERSISTED", summary);
  expect(service.getCelebrations()).toEqual([]);
  bus.emit("PARK_REWARD_COMMITTED", { ...park, userId: "other", transactionId: "other" });
  expect(service.getCelebrations()).toEqual([]);
  bus.emit("PARK_REWARD_COMMITTED", { ...park, transactionId: "next", newWild: null, parkLevel: 2 });
  expect(service.getCelebrations()).toHaveLength(1);
  dispose();
  expect(service.getCelebrations()).toEqual([]);
});
test("park persistence emits only after committed save; rejected listener allows retry", async () => {
  const bus = new EventBus();
  let resolve!: (value: any) => void;
  const mark = jest.fn(() => new Promise(r => { resolve = r; }));
  const user = { id: "u", markTrailCompleted: mark, assignNewTrail: jest.fn(async () => 1) };
  const persistence = new PersistenceService(user as any, {} as any, bus);
  const committed = jest.fn();
  bus.on("PARK_REWARD_COMMITTED", committed);
  bus.on("NEW_TRAIL_ASSIGNED", jest.fn());
  const payload = { completedTrailId: "trail", isProMember: false, trailStartedAt: "today" };
  const pending = persistence.persistCompletedTrail(payload);
  await Promise.resolve();
  expect(committed).not.toHaveBeenCalled();
  resolve(park);
  await pending;
  expect(committed).toHaveBeenCalledWith(park);
  mark.mockResolvedValueOnce(null);
  await persistence.persistCompletedTrail(payload);
  expect(committed).toHaveBeenCalledTimes(1);
  mark.mockRejectedValueOnce(new Error("disk"));
  const error = jest.spyOn(console, "error").mockImplementation(() => {});
  try { await expect(persistence.persistCompletedTrail(payload)).rejects.toThrow("disk"); } finally { error.mockRestore(); }
  expect(committed).toHaveBeenCalledTimes(1);
});

test("failed park grant retries without consuming/assigning another next trail", async () => {
  const bus = new EventBus();
  const mark = jest.fn().mockRejectedValueOnce(new Error("disk")).mockResolvedValueOnce(park);
  const assign = jest.fn(async () => 1);
  const persistence = new PersistenceService({ id: "u", markTrailCompleted: mark, assignNewTrail: assign } as any, {} as any, bus);
  const dispose = persistence.register();
  const committed = jest.fn();
  bus.on("PARK_REWARD_COMMITTED", committed);
  bus.on("NEW_TRAIL_ASSIGNED", jest.fn());
  const error = jest.spyOn(console, "error").mockImplementation(() => {});
  const payload = { completedTrailId: "trail", isProMember: true, trailStartedAt: "today" };
  try {
    bus.emit("SESSION_TRAIL_COMPLETED", payload);
    await waitFor(() => expect(error).toHaveBeenCalled());
    bus.emit("SESSION_TRAIL_COMPLETED", payload);
    await waitFor(() => expect(committed).toHaveBeenCalledWith(park));
    expect(assign).toHaveBeenCalledTimes(1);
    expect(committed).toHaveBeenCalledTimes(1);
  } finally { error.mockRestore(); dispose(); }
});
