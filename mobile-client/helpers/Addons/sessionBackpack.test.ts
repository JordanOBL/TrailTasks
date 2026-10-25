import { isBackpackSlotEligible, isSupportedSessionAddon, validateSessionBackpack } from "./sessionBackpack";

const addon = { name: "Ultralight II", effectType: "min_pace_increase" };
const slots = [0, 75, 175, 375].map(minimumTotalMiles => ({ addon: null as typeof addon | null, minimumTotalMiles }));

test("slot eligibility uses mileage and active Pro entitlement together", () => {
  expect(slots.map((slot, index) => isBackpackSlotEligible(slot, index, 1000, false))).toEqual([true, true, false, false]);
  expect(slots.map((slot, index) => isBackpackSlotEligible(slot, index, 100, true))).toEqual([true, true, false, false]);
  expect(slots.map((slot, index) => isBackpackSlotEligible(slot, index, 1000, true))).toEqual([true, true, true, true]);
});

test("invalid selected slots are rejected before session consumption", () => {
  const equipped = slots.map((slot, index) => ({ ...slot, addon: index === 2 ? addon : null }));
  expect(() => validateSessionBackpack(equipped, 1000, false)).toThrow(/locked|Pro/i);
  expect(() => validateSessionBackpack(equipped, 100, true)).toThrow(/locked|miles/i);
  expect(() => validateSessionBackpack(equipped, 1000, true)).not.toThrow();
});

test("only wired effect types may be selected and consumed", () => {
  expect(isSupportedSessionAddon(addon)).toBe(true);
  expect(isSupportedSessionAddon({ effectType: "pace_increase_value" })).toBe(true);
  expect(isSupportedSessionAddon({ effectType: "break_time_reduction" })).toBe(false);
  expect(isSupportedSessionAddon({ effectType: "penalty_reduction" })).toBe(false);
  expect(() => validateSessionBackpack([{ addon: { ...addon, effectType: "penalty_reduction" }, minimumTotalMiles: 0 }], 0, false)).toThrow(/not supported|unavailable/i);
});
