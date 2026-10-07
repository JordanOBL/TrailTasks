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
