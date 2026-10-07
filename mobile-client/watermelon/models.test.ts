import { calculateWildXpProgress } from "./models";

describe("calculateWildXpProgress", () => {
  test("defaults invalid xp_to_next instead of looping forever", () => {
    expect(
      calculateWildXpProgress({
        currentXp: 0,
        xpToNext: 0,
        level: 0,
        rewardXp: 0,
      }),
    ).toEqual({ xp: 0, level: 1, xpToNext: 100 });
  });

  test("levels up with a positive threshold", () => {
    expect(
      calculateWildXpProgress({
        currentXp: 95,
        xpToNext: 100,
        level: 1,
        rewardXp: 10,
      }),
    ).toEqual({ xp: 5, level: 2, xpToNext: 150 });
  });
});
