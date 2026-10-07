export const TRAIL_UNLOCK_COST_TIERS = [
  { maxExclusiveMiles: 5, costTokens: 5 },
  { maxExclusiveMiles: 10, costTokens: 10 },
  { maxExclusiveMiles: 20, costTokens: 25 },
] as const;

export const LONG_TRAIL_UNLOCK_COST_TOKENS = 50;
export const COMPLETED_TRAIL_TOKEN_MULTIPLIER = 3;
export const MIN_COMPLETED_TRAIL_REWARD_TOKENS = 5;

export function parseTrailDistanceMiles(distance: string | number): number {
  const parsed = typeof distance === "number" ? distance : Number.parseFloat(distance);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function calculateTrailUnlockCost(distance: string | number): number {
  const miles = parseTrailDistanceMiles(distance);
  const tier = TRAIL_UNLOCK_COST_TIERS.find(({ maxExclusiveMiles }) => miles < maxExclusiveMiles);
  return tier?.costTokens ?? LONG_TRAIL_UNLOCK_COST_TOKENS;
}

export function calculateCompletedTrailRewardTokens(distance: string | number): number {
  const miles = parseTrailDistanceMiles(distance);
  return Math.max(
    MIN_COMPLETED_TRAIL_REWARD_TOKENS,
    Math.ceil(miles * COMPLETED_TRAIL_TOKEN_MULTIPLIER),
  );
}


export const WILD_XP_PER_MILE = 10;
export const TIME_TOKEN_INTERVAL_MINUTES = 15;
export const TIME_TOKEN_INTERVAL_REWARD = 5;
export const TIME_TOKEN_BONUS_INTERVAL_MINUTES = 45;
export const TIME_TOKEN_BONUS_MULTIPLIER = 0.25;

export function calculateActiveWildXpReward(distance: string | number): number {
  return Math.floor(parseTrailDistanceMiles(distance)) * WILD_XP_PER_MILE;
}

export function calculateTimeRewardTokens(totalMinutes: string | number): number {
  const minutes = typeof totalMinutes === "number" ? totalMinutes : Number.parseFloat(totalMinutes);
  const safeMinutes = Number.isFinite(minutes) && minutes > 0 ? Math.floor(minutes) : 0;

  if (safeMinutes < TIME_TOKEN_INTERVAL_MINUTES) {
    return 0;
  }

  const baseTokens =
    Math.floor(safeMinutes / TIME_TOKEN_INTERVAL_MINUTES) * TIME_TOKEN_INTERVAL_REWARD;
  const bonusMultiplier =
    Math.floor(safeMinutes / TIME_TOKEN_BONUS_INTERVAL_MINUTES) * TIME_TOKEN_BONUS_MULTIPLIER;

  return baseTokens + Math.floor(baseTokens * bonusMultiplier);
}
