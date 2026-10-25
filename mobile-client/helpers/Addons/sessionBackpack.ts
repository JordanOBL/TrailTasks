type SessionAddon = { effectType?: unknown; name?: string };
type BackpackSlot = { minimumTotalMiles: number; addon: SessionAddon | null };

/** Each current catalog family has one effect type, shared across its levels. */
export function validateAddonFamilies(addons: readonly SessionAddon[]): void {
  const effects = new Set<unknown>();
  for (const addon of addons) {
    if (effects.has(addon.effectType)) {
      throw new Error("An item of the same type is already equipped. Remove it before choosing a different level.");
    }
    effects.add(addon.effectType);
  }
}

const supportedEffects = new Set([
  "min_pace_increase", "max_pace_increase", "pace_increase_interval",
  "pace_increase_value", "trail_token_bonus",
]);

export function isSupportedSessionAddon(addon: SessionAddon): boolean {
  return typeof addon.effectType === "string" && supportedEffects.has(addon.effectType);
}

export function isBackpackSlotEligible(
  slot: Pick<BackpackSlot, "minimumTotalMiles">,
  index: number,
  totalMiles: number,
  isProMember: boolean,
): boolean {
  return index < 4 && totalMiles >= slot.minimumTotalMiles && (index < 2 || isProMember);
}

/** Validate before applying effects or consuming any owned inventory. */
export function validateSessionBackpack(
  backpack: readonly BackpackSlot[], totalMiles: number, isProMember: boolean,
): void {
  validateAddonFamilies(backpack.flatMap(slot => slot.addon ? [slot.addon] : []));
  backpack.forEach((slot, index) => {
    if (!slot.addon) return;
    if (!isBackpackSlotEligible(slot, index, totalMiles, isProMember)) {
      throw new Error("A selected backpack slot is locked by miles or Pro. Remove its item before starting.");
    }
    if (!isSupportedSessionAddon(slot.addon)) {
      throw new Error(`${slot.addon.name || "This item"} is not supported for sessions yet. Remove it before starting.`);
    }
  });
}
