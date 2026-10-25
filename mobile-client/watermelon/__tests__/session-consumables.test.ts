import { Addon, User, User_Addon } from "../models";
import { testDb } from "../testDB";
import PersistenceService from "../../persistenceService/persistenceService";
import { EventBus } from "../../EventBus/EventBus";
import { SessionCfg } from "../../types/session";

async function setup(quantity = 2) {
  return testDb.write(async () => {
    await testDb.unsafeResetDatabase();
    const user = await testDb.get<User>("users").create(() => {});
    const addon = await testDb.get<Addon>("addons").create(r => { r.name = "Boots"; r.effectType = "min_pace_increase"; r.effectValue = 3; });
    const inventory = await testDb.get<User_Addon>("users_addons").create(r => {
      r.userId = user.id; r.addonId = addon.id; r.quantity = quantity;
    });
    const cfg = { userId: user.id, sessionName: "Focus", sessionDescription: "Description", sessionCategory: ["category", "Focus"], backpack: [{ addon, minimumTotalMiles: 0 }] } as SessionCfg;
    return { user, addon, inventory, cfg, service: new PersistenceService(user, testDb, EventBus.getInstance()) };
  });
}

test("the active persistence path consumes once and writes a session receipt atomically", async () => {
  const { user, addon, inventory, cfg, service } = await setup();
  const session = await service.createNewSession(cfg);
  expect(inventory.quantity).toBe(1);
  expect(await testDb.get("sessions_addons").query().fetch()).toMatchObject([{ sessionId: session.id, addonId: addon.id }]);
  expect(session).toMatchObject({ userId: user.id, sessionName: "Focus", sessionDescription: "Description", sessionCategoryId: "category" });
  await service.createNewSession({ ...cfg, backpack: [] });
  expect(inventory.quantity).toBe(1);
});

test("last item is depleted at start and cannot be used in a later session", async () => {
  const { user, cfg, service } = await setup(1);
  await service.createNewSession(cfg);
  expect(await user.usersAddons.fetchCount()).toBe(0);
  await expect(service.createNewSession(cfg)).rejects.toThrow(/owned|inventory|available/i);
  expect(await user.usersSessions.fetchCount()).toBe(1);
  expect(await testDb.get("sessions_addons").query().fetchCount()).toBe(1);
});

test("invalid inventory rejects before preparing any records so a corrected retry succeeds", async () => {
  const { user, cfg, service } = await setup();
  const missing = { id: "not-owned" } as Addon;
  await expect(service.createNewSession({ ...cfg, backpack: [...cfg.backpack, { addon: missing, minimumTotalMiles: 0 }] })).rejects.toThrow(/owned|inventory|available/i);
  expect(await user.usersSessions.fetchCount()).toBe(0);
  expect((await user.usersAddons.fetch())[0].quantity).toBe(2);
  await expect(service.createNewSession(cfg)).resolves.toBeDefined();
});

test("duplicate slots do not stack receipts or consume multiple units", async () => {
  const { cfg, inventory, service } = await setup();
  await service.createNewSession({ ...cfg, backpack: [...cfg.backpack, ...cfg.backpack] });
  expect(inventory.quantity).toBe(1);
  expect(await testDb.get("sessions_addons").query().fetchCount()).toBe(1);
});

test.each([false, true])("mixed pole levels reject before any consumption and allow a corrected retry (reverse=%s)", async reverse => {
  const { user, addon, inventory, cfg, service } = await setup(2);
  const other = await testDb.write(async () => {
    await addon.update(r => { r.name = "Hiking Poles I"; r.effectType = "pace_increase_interval"; r.effectValue = 780; });
    const second = await testDb.get<Addon>("addons").create(r => {
      r.name = "Hiking Poles II"; r.effectType = "pace_increase_interval"; r.effectValue = 600;
    });
    const owned = await testDb.get<User_Addon>("users_addons").create(r => {
      r.userId = user.id; r.addonId = second.id; r.quantity = 2;
    });
    return { addon: second, owned };
  });
  const backpack = [...cfg.backpack, { addon: other.addon, minimumTotalMiles: 0 }];
  if (reverse) backpack.reverse();
  await expect(service.createNewSession({ ...cfg, backpack })).rejects.toThrow(/same type|different level|already/i);
  expect([inventory.quantity, other.owned.quantity]).toEqual([2, 2]);
  expect(await user.usersSessions.fetchCount()).toBe(0);
  expect(await testDb.get("sessions_addons").query().fetchCount()).toBe(0);
  await expect(service.createNewSession(cfg)).resolves.toBeDefined();
  expect([inventory.quantity, other.owned.quantity]).toEqual([1, 2]);
});

test("zero quantity cannot create a session or receipt", async () => {
  const { user, cfg, service } = await setup(0);
  await expect(service.createNewSession(cfg)).rejects.toThrow(/owned|inventory|available/i);
  expect(await user.usersSessions.fetchCount()).toBe(0);
  expect(await testDb.get("sessions_addons").query().fetchCount()).toBe(0);
});

test("Ultralight II and Trail Mix II each decrease by one per explicit use, never by an unequipped session", async () => {
  const { user, addon, inventory, cfg, service } = await setup(2);
  const mix = await testDb.write(async () => {
    await addon.update(r => { r.name = "Ultralight II"; r.effectType = "min_pace_increase"; r.effectValue = 3; });
    const second = await testDb.get<Addon>("addons").create(r => {
      r.name = "Trail Mix II"; r.effectType = "pace_increase_value"; r.effectValue = 0.5;
    });
    const owned = await testDb.get<User_Addon>("users_addons").create(r => {
      r.userId = user.id; r.addonId = second.id; r.quantity = 2;
    });
    return { addon: second, owned };
  });
  const equipped = { ...cfg, backpack: [...cfg.backpack, { addon: mix.addon, minimumTotalMiles: 75 }] };
  const first = await service.createNewSession(equipped);
  expect([inventory.quantity, mix.owned.quantity]).toEqual([1, 1]);
  const withoutItems = await service.createNewSession({ ...cfg, backpack: [] });
  expect([inventory.quantity, mix.owned.quantity]).toEqual([1, 1]);
  const third = await service.createNewSession(equipped);
  expect(await user.usersAddons.fetchCount()).toBe(0);
  const receipts: any[] = await testDb.get("sessions_addons").query().fetch();
  expect(receipts.filter(r => r.sessionId === first.id).map(r => r.addonId).sort()).toEqual([addon.id, mix.addon.id].sort());
  expect(receipts.filter(r => r.sessionId === withoutItems.id)).toHaveLength(0);
  expect(receipts.filter(r => r.sessionId === third.id).map(r => r.addonId).sort()).toEqual([addon.id, mix.addon.id].sort());
});

test.each([1, 2])("failed atomic session creation preserves quantity %i and retry consumes exactly once", async quantity => {
  const { user, inventory, cfg, service } = await setup(quantity);
  const batch = jest.spyOn(testDb.adapter, "batch").mockRejectedValueOnce(new Error("disk full"));
  try {
    await expect(service.createNewSession(cfg)).rejects.toThrow("disk full");
    expect(inventory.quantity).toBe(quantity);
    expect(await user.usersSessions.fetchCount()).toBe(0);
    expect(await testDb.get("sessions_addons").query().fetchCount()).toBe(0);
    await service.createNewSession(cfg);
    if (quantity === 1) expect(await user.usersAddons.fetchCount()).toBe(0);
    else expect(inventory.quantity).toBe(1);
    expect(await user.usersSessions.fetchCount()).toBe(1);
    expect(await testDb.get("sessions_addons").query().fetchCount()).toBe(1);
  } finally { batch.mockRestore(); }
});

test.each(["break_time_reduction", "penalty_reduction"])("unsupported %s items cannot be consumed for no benefit", async effectType => {
  const { user, addon, inventory, cfg, service } = await setup(2);
  await testDb.write(() => addon.update(r => { r.effectType = effectType; }));
  await expect(service.createNewSession(cfg)).rejects.toThrow(/not supported|unavailable/i);
  expect(inventory.quantity).toBe(2);
  expect(await user.usersSessions.fetchCount()).toBe(0);
  expect(await testDb.get("sessions_addons").query().fetchCount()).toBe(0);
});
