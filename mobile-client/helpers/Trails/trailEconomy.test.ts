import {
  calculateActiveWildXpReward,
  calculateCompletedTrailRewardTokens,
  calculateTimeRewardTokens,
  calculateTrailUnlockCost,
} from "./trailEconomy";

describe("trail economy", () => {
  describe("calculateTrailUnlockCost", () => {
    it.each([
      ["4.9", 5],
      ["5", 10],
      ["9.9", 10],
      ["10", 25],
      ["19.9", 25],
      ["20", 50],
    ])("charges %s mile trails %i tokens", (distance, expectedCost) => {
      expect(calculateTrailUnlockCost(distance)).toBe(expectedCost);
    });
  });

  describe("calculateCompletedTrailRewardTokens", () => {
    it.each([
      [1, 5],
      [1.7, 6],
      [10, 30],
    ])("rewards %s mile completed trails with %i tokens", (distance, expectedReward) => {
      expect(calculateCompletedTrailRewardTokens(distance)).toBe(expectedReward);
    });
  });

  describe("calculateActiveWildXpReward", () => {
    it.each([
      [0.9, 0],
      [1, 10],
      [3.8, 30],
    ])("rewards %s session miles with %i Wild XP", (distance, expectedXp) => {
      expect(calculateActiveWildXpReward(distance)).toBe(expectedXp);
    });
  });

  describe("calculateTimeRewardTokens", () => {
    it.each([
      [14, 0],
      [15, 5],
      [30, 10],
      [45, 18],
    ])("rewards %s minutes with %i time tokens", (minutes, expectedTokens) => {
      expect(calculateTimeRewardTokens(minutes)).toBe(expectedTokens);
    });
  });
});
