import {
  calculateCompletedTrailRewardTokens,
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
});
