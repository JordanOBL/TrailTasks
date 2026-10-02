import { User } from "../watermelon/models";
import { afterAll, beforeAll, describe, expect, jest, test } from "@jest/globals";
import { createMockUserBase } from "../__mocks__/UserModel";

import { EventBus } from "../EventBus/EventBus";
import RewardService, { Rewards } from "./RewardService";
import { SessionSnapshot } from "../sessionEngine/sessionEngine";
import { waitFor } from "@testing-library/react-native";
import { Database } from "@nozbe/watermelondb";

describe("RewardService", () => {
  let bus: EventBus;
  let rewardService: RewardService;
  let user: User;
  let snapshot: SessionSnapshot;
  let db: Database;

  beforeAll(async () => {
    bus = EventBus.getInstance();
    user = createMockUserBase({
      usersWilds: {
        extend: () => true,
      },
    });
    db = {
      get: jest.fn(() => ({
        find: jest.fn(id => user),
      })),
    } as unknown as Database;

    rewardService = new RewardService(bus, db, user, false);

    snapshot = {
      sessionId: "123",
      userId: user.id,
      sessionName: "Rewards Service Test",
      sessionCategory: ["1", "Chores"],
      phase: "COMPLETED",
      totalElapsedSec: 4500,
      elapsedInPhaseSec: 900,
      distanceNeeded: 0,
      currentTrailDistance: 0,
      currentSet: 3,
      completedSets: 3,
      totalSets: 3,
      currentPaceMph: 2.5,
      totalDistanceMiles: 1.0,
      focusTimeSec: 1500,
      shortBreakSec: 300,
      longBreakSec: 900,
      autoContinue: false,
      totalStrikes: 0,
      completedTrails: [],
      isPaused: false,
      tokenBonusFlat: 0,
      tokenBonusPercent: 1,
      startedAt: 123456789,
      consecutiveSecWithoutStrikes: 0,
      extraSets: 0,
    };
  });

  afterAll(() => {
    bus.clear();
  });

  test("calculateWildXp returns the correct wild xp (10 * totalSessionDistance)", async () => {
    const expected = 10;
    jest.spyOn(user.usersWilds, "extend").mockReturnValue(true as never);

    const result = await (rewardService as any).calculateActiveWildXpReward(snapshot);

    await waitFor(() => {
      expect(result).toEqual(expected);
    });
  });

  test("calculateTrailTokens returns 0 trail tokens if 0 trail completed", () => {
    const expected = 0;
    const result = (rewardService as any).calculateTrailTokens(snapshot);

    expect(result).toEqual(expected);
  });

  test("calculateTrailTokens returns minimum of 5 for short trails", () => {
    const expected = 5;
    const result = (rewardService as any).calculateTrailTokens({
      completedTrails: [{ id: "1", distance: 1.0 }],
    });

    expect(result).toEqual(expected);
  });

  test("calculateTrailTokens returns correct tokens for multiple completed trails", () => {
    const expected = 35;
    const result = (rewardService as any).calculateTrailTokens({
      completedTrails: [
        { id: "1", distance: 1.0 },
        { id: "2", distance: 10.0 },
      ],
    });

    expect(result).toEqual(expected);
  });

  test("calculateTrailTokens applies flat token bonus after base trail rewards", () => {
    const expected = 45;
    const result = (rewardService as any).calculateTrailTokens({
      completedTrails: [
        { id: "1", distance: 1.0 },
        { id: "2", distance: 10.0 },
      ],
      tokenBonusFlat: 10,
    });

    expect(result).toEqual(expected);
  });

  test("calculateTrailTokens defaults missing tokenBonusPercent to zero percent", () => {
    const expected = 40;
    const result = (rewardService as any).calculateTrailTokens({
      completedTrails: [{ id: "1", distance: 10.0 }],
      tokenBonusFlat: 10,
    });

    expect(result).toEqual(expected);
  });

  test("calculateTrailTokens applies tokenBonusPercent after flat token bonus", () => {
    const expected = 48;
    const result = (rewardService as any).calculateTrailTokens({
      completedTrails: [
        { id: "1", distance: 1.0 },
        { id: "2", distance: 10.0 },
      ],
      tokenBonusFlat: 10,
      tokenBonusPercent: 5,
    });

    expect(result).toEqual(expected);
  });

  test("calculateTimeTokens returns 0 before the 15 minute threshold", () => {
    const result = (rewardService as any).calculateTimeTokens({
      ...snapshot,
      totalElapsedSec: 14 * 60 + 59,
    });

    expect(result).toEqual(0);
  });

  test("calculateTimeTokens grants 5 tokens for each full 15 minute block", () => {
    const result = (rewardService as any).calculateTimeTokens({
      ...snapshot,
      totalElapsedSec: 30 * 60,
    });

    expect(result).toEqual(10);
  });

  test("calculateTimeTokens applies the 45 minute bonus to documented time rewards", () => {
    const result = (rewardService as any).calculateTimeTokens({
      ...snapshot,
      totalElapsedSec: 45 * 60,
    });

    expect(result).toEqual(18);
  });

  test("calculateRewards emits the same numeric rewards payload it returns", async () => {
    const rewardsCalculatedCb = jest.fn();
    const unregister = bus.on("REWARDS_CALCULATED", rewardsCalculatedCb);
    const expectedRewards: Rewards = {
      trailRewards: 30,
      timeRewards: 18,
      totalTokenRewards: 48,
      wildXpRewards: 10,
    };

    jest.spyOn(rewardService as any, "calculateActiveWildXpReward").mockResolvedValue(10);

    const finalSnapshot: SessionSnapshot = {
      ...snapshot,
      totalElapsedSec: 45 * 60,
      completedTrails: [{ id: "trail-1", distance: 10.0 }],
      tokenBonusFlat: 0,
      tokenBonusPercent: 0,
    };

    const result = await rewardService.calculateRewards(finalSnapshot);

    expect(result).toEqual(expectedRewards);
    await waitFor(() => {
      expect(rewardsCalculatedCb).toHaveBeenCalledWith({
        finalSnapshot,
        rewards: expectedRewards,
      });
    });

    unregister.unregister();
  });
});
