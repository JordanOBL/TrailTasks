import { buildPullUrl, filterCatalogChanges } from "./sync";

describe("sync helpers", () => {
  it("builds catalog pull URLs without a user id so account sync timestamps stay separate", () => {
    const url = buildPullUrl({
      baseUrl: "http://localhost:5500",
      lastPulledAt: 123,
      schemaVersion: 1,
      catalogOnly: true,
    });

    expect(url).toBe(
      "http://localhost:5500/pull?last_pulled_at=123&schema_version=1&catalog_only=true",
    );
  });

  it("builds account pull URLs with the logged-in user id", () => {
    const url = buildPullUrl({
      baseUrl: "http://localhost:5500",
      lastPulledAt: 456,
      schemaVersion: 1,
      userId: "user-1",
    });

    expect(url).toBe(
      "http://localhost:5500/pull?last_pulled_at=456&schema_version=1&userId=user-1",
    );
  });

  it("can request a full account pull when a device is behind server state", () => {
    const url = buildPullUrl({
      baseUrl: "http://localhost:5500",
      lastPulledAt: 789,
      schemaVersion: 1,
      userId: "user-1",
      fullUserSync: true,
    });

    expect(url).toBe(
      "http://localhost:5500/pull?last_pulled_at=789&schema_version=1&userId=user-1&full_user_sync=true",
    );
  });

  it("keeps only global catalog tables for logged-out catalog pulls", () => {
    const changes = filterCatalogChanges({
      trails: { created: [], updated: [{ id: "trail-1" }], deleted: [] },
      wilds: { created: [], updated: [{ id: "wild-1" }], deleted: [] },
      users: { created: [], updated: [{ id: "user-1" }], deleted: [] },
      users_wilds: { created: [], updated: [{ id: "user-wild-1" }], deleted: [] },
    } as any);

    expect(changes).toEqual({
      trails: { created: [], updated: [{ id: "trail-1" }], deleted: [] },
      wilds: { created: [], updated: [{ id: "wild-1" }], deleted: [] },
    });
  });
});
