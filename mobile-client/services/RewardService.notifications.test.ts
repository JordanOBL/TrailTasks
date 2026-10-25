import { EventBus } from "../EventBus/EventBus";
import RewardService from "./RewardService";

const award = { userId: "u1", sessionId: "s1", transactionId: "t1", amount: 15, dailyStreak: 2 };
const summary = {
  userId: "u1",
  sessionId: "s1",
  sessionTokens: 5,
  streakBonus: 15,
  totalTokens: 20,
  dailyStreakAward: award,
};
describe("RewardService confirmed notifications", () => {
  let bus: EventBus;
  let service: RewardService;
  let dispose: Function;
  beforeEach(() => {
    bus = new EventBus();
    service = new RewardService(bus, {} as any, { id: "u1" } as any, false);
    dispose = service.register();
  });
  afterEach(() => dispose());
  it("retains pending across subscriptions and dedupes even after acknowledgement", () => {
    const committed = jest.fn();
    bus.on("DAILY_STREAK_REWARD_COMMITTED", committed);
    const screenListener = jest.fn();
    const subscription = bus.on("DAILY_STREAK_REWARD_COMMITTED", screenListener);
    bus.emit("SESSION_REWARDS_PERSISTED", summary);
    subscription.unregister();
    expect(service.getPending()).toEqual([award]);
    service.acknowledge("t1");
    bus.emit("SESSION_REWARDS_PERSISTED", summary);
    expect(service.getPending()).toEqual([]);
    expect(committed).toHaveBeenCalledTimes(1);
  });
  it("accepts a genuine distinct transaction and ignores other accounts and no-award sessions", () => {
    bus.emit("SESSION_REWARDS_PERSISTED", summary);
    bus.emit("SESSION_REWARDS_PERSISTED", {
      ...summary,
      dailyStreakAward: { ...award, transactionId: "t2" },
    });
    bus.emit("SESSION_REWARDS_PERSISTED", { ...summary, userId: "u2" });
    bus.emit("SESSION_REWARDS_PERSISTED", { ...summary, dailyStreakAward: null });
    expect(service.getPending().map(item => item.transactionId)).toEqual(["t1", "t2"]);
  });
  it("clears pending and unregisters on account disposal", () => {
    const listener = jest.fn();
    bus.on("DAILY_STREAK_REWARD_COMMITTED", listener);
    bus.emit("SESSION_REWARDS_PERSISTED", summary);
    dispose();
    bus.emit("SESSION_REWARDS_PERSISTED", summary);
    expect(service.getPending()).toEqual([]);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
