import { synchronize } from "@nozbe/watermelondb/sync";
import { applyRemoteChanges } from "@nozbe/watermelondb/sync/impl";
import { pullCatalogChanges, sync } from "./sync";

jest.mock("@nozbe/watermelondb/sync", () => ({
  synchronize: jest.fn(),
}));

jest.mock("@nozbe/watermelondb/sync/impl", () => ({
  applyRemoteChanges: jest.fn(() => Promise.resolve()),
  fetchLocalChanges: jest.fn(() =>
    Promise.resolve({ changes: {}, affectedRecords: [] }),
  ),
  getLastPulledAt: jest.fn(() => Promise.resolve(123)),
  markLocalChangesAsSynced: jest.fn(() => Promise.resolve()),
}));

jest.mock("../helpers/ErrorHandler", () => jest.fn());

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

describe("sync orchestration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("queues account sync behind an in-flight catalog pull instead of skipping the push opportunity", async () => {
    const order: string[] = [];
    let resolveCatalogFetch: (value: any) => void = () => {};

    global.fetch = jest.fn(() => {
      order.push("catalog-fetch");
      return new Promise(resolve => {
        resolveCatalogFetch = resolve;
      });
    }) as any;

    (applyRemoteChanges as jest.Mock).mockImplementation(async () => {
      order.push("catalog-apply");
    });
    (synchronize as jest.Mock).mockImplementation(async () => {
      order.push("account-sync");
    });

    const database = {
      schema: { version: 1 },
      adapter: {
        getLocal: jest.fn(() => Promise.resolve(null)),
        setLocal: jest.fn(() => Promise.resolve()),
      },
      write: jest.fn(async callback => {
        await callback();
      }),
    } as any;

    const catalogPromise = pullCatalogChanges(database, true);
    await flushPromises();

    const accountPromise = sync(database, true, "user-1");
    await flushPromises();

    expect(synchronize).not.toHaveBeenCalled();

    resolveCatalogFetch({
      ok: true,
      json: () =>
        Promise.resolve({
          changes: { trails: { created: [], updated: [], deleted: [] } },
          timestamp: 1000,
        }),
    });

    await Promise.all([catalogPromise, accountPromise]);

    expect(order).toEqual(["catalog-fetch", "catalog-apply", "account-sync"]);
    expect(synchronize).toHaveBeenCalledTimes(1);
  });

  it("coalesces duplicate automatic account sync requests while one is in flight", async () => {
    let resolveFirstSync: () => void = () => {};
    (synchronize as jest.Mock).mockImplementationOnce(
      () =>
        new Promise<void>(resolve => {
          resolveFirstSync = resolve;
        }),
    );

    const database = { schema: { version: 1 } } as any;

    const firstSync = sync(database, true, "user-1", { coalesceKey: "account:user-1" });
    const secondSync = sync(database, true, "user-1", { coalesceKey: "account:user-1" });
    await flushPromises();

    expect(synchronize).toHaveBeenCalledTimes(1);

    resolveFirstSync();
    await Promise.all([firstSync, secondSync]);

    await sync(database, true, "user-1", { coalesceKey: "account:user-1" });

    expect(synchronize).toHaveBeenCalledTimes(2);
  });
});
