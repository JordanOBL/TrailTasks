import {
  buildForcedAccountChanges,
  buildFullUserSyncStrategy,
  buildPullUrl,
  filterCatalogChanges,
  normalizeRemoteChanges,
  roundToHundredths,
  resolveFullUserSyncConflict,
  resolveSyncConflict,
} from "./sync";

describe("sync helpers", () => {
  it("does not depend on URLSearchParams methods that are missing in React Native", () => {
    const originalUrlSearchParams = global.URLSearchParams;
    // @ts-ignore intentionally simulates the limited React Native runtime
    global.URLSearchParams = undefined;

    try {
      expect(
        buildPullUrl({
          baseUrl: "http://localhost:5500",
          lastPulledAt: 123,
          schemaVersion: 1,
          userId: "user 1",
        }),
      ).toBe("http://localhost:5500/pull?last_pulled_at=123&schema_version=1&userId=user%201");
    } finally {
      global.URLSearchParams = originalUrlSearchParams;
    }
  });

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

  it("builds force-push changes without reintroducing stale user total_miles", () => {
    const changes = buildForcedAccountChanges({
      users: [
        {
          id: "user-1",
          _status: "synced",
          _changed: "",
          total_miles: "999.00",
          trail_tokens: 12,
        },
      ],
      users_wilds: [
        {
          id: "user-wild-1",
          user_id: "user-1",
          wild_id: "wild-1",
          _status: "synced",
          _changed: "",
          level: 3,
        },
      ],
      trails: [{ id: "trail-1" }],
    });

    expect(changes.users.updated).toEqual([{ id: "user-1", trail_tokens: 12 }]);
    expect(changes.users_wilds.updated).toEqual([
      { id: "user-wild-1", user_id: "user-1", wild_id: "wild-1", level: 3 },
    ]);
    expect(changes).not.toHaveProperty("trails");
  });

  it("normalizes pulled changes so duplicate ids cannot be applied as duplicate creates", () => {
    const changes = normalizeRemoteChanges({
      users_addons: {
        created: [
          { id: "user-addon-1", quantity: 1 },
          { id: "user-addon-1", quantity: 2 },
        ],
        updated: [
          { id: "user-addon-1", quantity: 3 },
          { id: "user-addon-2", quantity: 1 },
          { id: "user-addon-2", quantity: 4 },
        ],
        deleted: ["deleted-addon", "deleted-addon"],
      },
    });

    expect(changes.users_addons).toEqual({
      created: [],
      updated: [
        { id: "user-addon-1", quantity: 3 },
        { id: "user-addon-2", quantity: 4 },
      ],
      deleted: ["deleted-addon"],
    });
  });

  it("normalizes pulled session distance strings before Watermelon sanitizes numeric fields", () => {
    const changes = normalizeRemoteChanges({
      users_sessions: {
        created: [{ id: "created-session", total_distance_hiked: "0.024", total_session_time: "30" }],
        updated: [{ id: "updated-session", total_distance_hiked: "1.236", total_session_time: "60" }],
        deleted: [],
      },
    });

    expect(changes.users_sessions.created[0].total_distance_hiked).toBe(0.02);
    expect(changes.users_sessions.created[0].total_session_time).toBe(30);
    expect(changes.users_sessions.updated[0].total_distance_hiked).toBe(1.24);
    expect(changes.users_sessions.updated[0].total_session_time).toBe(60);
  });

  it("normalizes redacted user rows so Watermelon can store them without server password payloads", () => {
    const changes = normalizeRemoteChanges({
      users: {
        created: [],
        updated: [{ id: "user-1", email: "user@example.com", username: "user" }],
        deleted: [],
      },
    });

    expect(changes.users.updated[0]).toEqual({
      id: "user-1",
      email: "user@example.com",
      username: "user",
      password: "",
    });
  });

  it("normalizes pulled user streak fields before Watermelon applies account changes", () => {
    const changes = normalizeRemoteChanges({
      users: {
        created: [],
        updated: [
          {
            id: "user-1",
            email: "user@example.com",
            username: "user",
            daily_streak: "1",
            last_daily_streak_date: "2026-10-06",
            trail_tokens: "70",
            prestige_level: "0",
          },
        ],
        deleted: [],
      },
    });

    expect(changes.users.updated[0]).toMatchObject({
      daily_streak: 1,
      last_daily_streak_date: new Date("2026-10-06").getTime(),
      trail_tokens: 70,
      prestige_level: 0,
    });
  });

  it("uses scoped replacement only for account tables during full account pulls", () => {
    const strategy = buildFullUserSyncStrategy("user-1");

    expect(strategy.default).toBe("incremental");
    expect(strategy.override.users_sessions).toBeUndefined();
    expect(strategy.override.users_wilds).toBe("replacement");
    expect(strategy.override.users_parks).toBe("replacement");
    expect(strategy.override.trails).toBeUndefined();
    expect(strategy.override.parks).toBeUndefined();
    expect(strategy.override.sessions_addons).toBeUndefined();
    expect(strategy.experimentalQueryRecordsForReplacement.users).toBeDefined();
    expect(strategy.experimentalQueryRecordsForReplacement.users_wilds).toBeDefined();
  });

  it("rounds session mileage to the hundredth", () => {
    expect(roundToHundredths(0.004)).toBe(0);
    expect(roundToHundredths(0.005)).toBe(0.01);
    expect(roundToHundredths(0.024)).toBe(0.02);
    expect(roundToHundredths("1.236")).toBe(1.24);
  });

  it("merges session facts during full account pull conflicts", () => {
    const resolved = resolveFullUserSyncConflict(
      "users_sessions",
      {
        id: "session-1",
        user_id: "user-1",
        total_distance_hiked: 0.5,
        total_session_time: 30,
        _status: "updated",
        _changed: "total_distance_hiked,total_session_time",
      },
      {
        id: "session-1",
        user_id: "user-1",
        total_distance_hiked: "0.424",
        total_session_time: 60,
      },
      {
        id: "session-1",
        user_id: "user-1",
        total_distance_hiked: 0,
        total_session_time: 30,
        _status: "updated",
        _changed: "total_distance_hiked,total_session_time",
      },
    );

    expect(resolved).toEqual({
      id: "session-1",
      user_id: "user-1",
      total_distance_hiked: 0.5,
      total_session_time: 60,
      _status: "updated",
      _changed: "total_distance_hiked,total_session_time",
    });
  });

  it("merges higher remote session distance when local has stale zero", () => {
    const resolved = resolveFullUserSyncConflict(
      "users_sessions",
      {
        id: "session-1",
        user_id: "user-1",
        total_distance_hiked: 0,
        total_session_time: 0,
        _status: "updated",
        _changed: "total_distance_hiked,total_session_time",
      },
      {
        id: "session-1",
        user_id: "user-1",
        total_distance_hiked: "0.024",
        total_session_time: 30,
      },
      {
        id: "session-1",
        user_id: "user-1",
        total_distance_hiked: 0,
        total_session_time: 0,
        _status: "updated",
        _changed: "total_distance_hiked,total_session_time",
      },
    );

    expect(resolved.total_distance_hiked).toBe(0.02);
    expect(resolved.total_session_time).toBe(30);
  });

  it("leaves non-session normal sync conflicts to Watermelon's resolved value", () => {
    const resolved = {
      id: "user-1",
      trail_tokens: 50,
      _status: "updated",
      _changed: "trail_tokens",
    };

    expect(
      resolveSyncConflict(
        "users",
        { id: "user-1", trail_tokens: 25 },
        { id: "user-1", trail_tokens: 50 },
        resolved,
      ),
    ).toBe(resolved);
  });
});
