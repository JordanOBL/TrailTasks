import { Database, Q } from "@nozbe/watermelondb";
import { synchronize } from "@nozbe/watermelondb/sync";
import type { SyncDatabaseChangeSet } from "@nozbe/watermelondb/sync";
import {
  applyRemoteChanges,
  fetchLocalChanges,
  getLastPulledAt,
  markLocalChangesAsSynced,
} from "@nozbe/watermelondb/sync/impl";
import Config from "react-native-config";
import handleError from "../helpers/ErrorHandler";

const CATALOG_LAST_PULLED_AT_KEY = "trailtasks_catalog_last_pulled_at";

const CATALOG_TABLES = new Set([
  "addons",
  "achievements",
  "parks",
  "trails",
  "park_states",
  "session_categories",
  "wilds",
  "parks_wilds",
]);

const ACCOUNT_FORCE_PUSH_TABLES = [
  "users",
  "users_addons",
  "users_completed_trails",
  "users_queued_trails",
  "users_parks",
  "users_achievements",
  "users_purchased_trails",
  "users_sessions",
  "users_friends",
  "users_wilds",
  "sessions_addons",
] as const;

let syncQueue: Promise<void> = Promise.resolve();

function enqueueSync(label: string, operation: () => Promise<void>) {
  const queuedOperation = syncQueue
    .catch(() => undefined)
    .then(async () => {
      await operation();
    });

  syncQueue = queuedOperation.catch(err => {
    handleError(err, `${label} queued operation`);
  });

  return queuedOperation;
}

type PullUrlParams = {
  baseUrl: string;
  lastPulledAt: number | null;
  schemaVersion: number;
  userId?: string;
  catalogOnly?: boolean;
  fullUserSync?: boolean;
};

type SyncOptions = {
  fullUserSync?: boolean;
  pullOnly?: boolean;
  pushOnly?: boolean;
  forceAccountPush?: boolean;
};

type RawRecord = Record<string, any>;

const ACCOUNT_REPLACEMENT_TABLES = ACCOUNT_FORCE_PUSH_TABLES.filter(
  tableName => tableName !== "sessions_addons" && tableName !== "users_sessions",
);
const ACCOUNT_REPLACEMENT_TABLE_SET = new Set<string>(ACCOUNT_REPLACEMENT_TABLES);

export function roundToHundredths(value: unknown) {
  return Number((Number(value) || 0).toFixed(2));
}

export function resolveFullUserSyncConflict(
  table: string,
  local: RawRecord,
  remote: RawRecord,
  resolved: RawRecord,
) {
  if (table === "users_sessions") {
    return {
      ...resolved,
      ...remote,
      id: local.id,
      total_distance_hiked: roundToHundredths(
        Math.max(Number(local.total_distance_hiked) || 0, Number(remote.total_distance_hiked) || 0),
      ),
      total_session_time: Math.max(
        Number(local.total_session_time) || 0,
        Number(remote.total_session_time) || 0,
      ),
      _status: "updated",
      _changed: "total_distance_hiked,total_session_time",
    };
  }

  if (!ACCOUNT_REPLACEMENT_TABLE_SET.has(table)) {
    return resolved;
  }

  return {
    ...resolved,
    ...remote,
    id: local.id,
    _status: "synced",
    _changed: "",
  };
}

export function resolveSyncConflict(
  table: string,
  local: RawRecord,
  remote: RawRecord,
  resolved: RawRecord,
  fullUserSync = false,
) {
  if (table === "users_sessions") {
    return resolveFullUserSyncConflict(table, local, remote, resolved);
  }

  if (fullUserSync) {
    return resolveFullUserSyncConflict(table, local, remote, resolved);
  }

  return resolved;
}

export function buildFullUserSyncStrategy(userId: string) {
  return {
    default: "incremental",
    override: Object.fromEntries(
      ACCOUNT_REPLACEMENT_TABLES.map(tableName => [tableName, "replacement"]),
    ),
    experimentalQueryRecordsForReplacement: Object.fromEntries(
      ACCOUNT_REPLACEMENT_TABLES.map(tableName => [
        tableName,
        () => (tableName === "users" ? [Q.where("id", userId)] : [Q.where("user_id", userId)]),
      ]),
    ),
  };
}

export function buildForcedAccountChanges(recordsByTable: Record<string, RawRecord[]>) {
  return ACCOUNT_FORCE_PUSH_TABLES.reduce((changes, tableName) => {
    const records = recordsByTable[tableName] || [];
    if (records.length > 0) {
      changes[tableName] = {
        created: [],
        updated: records.map(({ _status, _changed, ...raw }) => raw),
        deleted: [],
      };
    }

    return changes;
  }, {} as Record<string, { created: RawRecord[]; updated: RawRecord[]; deleted: string[] }>);
}

async function fetchForcedAccountChanges(database: Database, userId: string) {
  const recordsByTable: Record<string, RawRecord[]> = {};

  for (const tableName of ACCOUNT_FORCE_PUSH_TABLES) {
    const records = await database
      .get(tableName as any)
      .query()
      .fetch();
    recordsByTable[tableName] = records
      .map(record => ({ ...(record as any)._raw }))
      .filter(record => {
        if (tableName === "users") {
          return record.id === userId;
        }

        if (tableName === "sessions_addons") {
          return true;
        }

        return record.user_id === userId;
      });
  }

  return buildForcedAccountChanges(recordsByTable);
}

export function buildPullUrl({
  baseUrl,
  lastPulledAt,
  schemaVersion,
  userId,
  catalogOnly = false,
  fullUserSync = false,
}: PullUrlParams) {
  const params: [string, string][] = [
    ["last_pulled_at", lastPulledAt == null ? "null" : String(lastPulledAt)],
    ["schema_version", String(schemaVersion)],
  ];

  if (userId) params.push(["userId", userId]);
  if (catalogOnly) params.push(["catalog_only", "true"]);
  if (fullUserSync) params.push(["full_user_sync", "true"]);

  const queryString = params
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");

  return `${baseUrl}/pull?${queryString}`;
}

export function filterCatalogChanges(changes: Record<string, unknown> = {}) {
  return Object.fromEntries(
    Object.entries(changes).filter(([tableName]) => CATALOG_TABLES.has(tableName)),
  );
}

function dedupeRowsById(rows: RawRecord[] = []) {
  return [...new Map(rows.map(row => [row.id, row])).values()];
}

function normalizeRemoteRow(tableName: string, row: RawRecord) {
  if (tableName === "users") {
    return {
      ...row,
      password: row.password || "",
    };
  }

  if (tableName !== "users_sessions") {
    return row;
  }

  return {
    ...row,
    total_distance_hiked: roundToHundredths(row.total_distance_hiked),
    total_session_time: Number(row.total_session_time) || 0,
  };
}

export function normalizeRemoteChanges(changes: Record<string, any> = {}) {
  return Object.fromEntries(
    Object.entries(changes).map(([tableName, tableChanges]) => {
      const updatedRows = dedupeRowsById(tableChanges.updated || []).map(row =>
        normalizeRemoteRow(tableName, row),
      );
      const updatedIds = new Set(updatedRows.map((row: RawRecord) => row.id));
      return [
        tableName,
        {
          created: dedupeRowsById(tableChanges.created || [])
            .filter(row => !updatedIds.has(row.id))
            .map(row => normalizeRemoteRow(tableName, row)),
          updated: updatedRows,
          deleted: [...new Set<string>(tableChanges.deleted || [])],
        },
      ];
    }),
  );
}

async function getCatalogLastPulledAt(database: Database) {
  const value = await database.adapter.getLocal(CATALOG_LAST_PULLED_AT_KEY);
  return parseInt(value ?? "", 10) || null;
}

async function setCatalogLastPulledAt(database: Database, timestamp: number) {
  await database.adapter.setLocal(CATALOG_LAST_PULLED_AT_KEY, String(timestamp));
}

export async function pullCatalogChanges(database: Database, isConnected: boolean = false) {
  if (!isConnected) {
    console.debug("[Catalog Sync] Not connected to the internet.");
    return;
  }

  if (!Config.DATABASE_PULL_URL) {
    throw new Error("Error syncing with DB, DATABASE_PULL_URL missing in config");
  }

  return enqueueSync("pullCatalogChanges()", async () => {
    try {
      const lastPulledAt = await getCatalogLastPulledAt(database);
      const url = buildPullUrl({
        baseUrl: Config.DATABASE_PULL_URL!,
        lastPulledAt,
        schemaVersion: database.schema.version,
        catalogOnly: true,
      });

      console.debug("[Catalog Sync] Pull URL:", Config.DATABASE_PULL_URL);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(await response.text());
      }

      const { changes, timestamp } = await response.json();
      const catalogChanges = normalizeRemoteChanges(filterCatalogChanges(changes));

      await database.write(async () => {
        await applyRemoteChanges(catalogChanges as SyncDatabaseChangeSet, {
          db: database,
          sendCreatedAsUpdated: true,
        });
        await setCatalogLastPulledAt(database, timestamp);
      }, "sync-pull-catalog");

      console.debug(`[Catalog Sync] Pulled catalog changes at ${timestamp}`);
    } catch (err) {
      handleError(err, "pullCatalogChanges()");
    }
  });
}

export async function sync(
  database: Database,
  isConnected: boolean = false,
  userId?: string,
  options: SyncOptions = {},
) {
  if (!isConnected) {
    console.debug("[Sync] Not connected to the internet.");
    return;
  }

  if ((options.fullUserSync || options.forceAccountPush) && !userId) {
    console.warn("[Sync] Account sync requested without a user id.");
    return;
  }

  return enqueueSync("sync()", async () => {
    let retryCount = 0;
    const maxRetries = 2;

    const pushLocalChanges = async (lastPulledAt: number | null) => {
      const localChanges = await fetchLocalChanges(database);
      const changes = options.forceAccountPush
        ? await fetchForcedAccountChanges(database, userId!)
        : localChanges.changes;

      const response = await fetch(
        `${Config.DATABASE_PUSH_URL}/push?last_pulled_at=${lastPulledAt}`,
        {
          method: "POST",
          body: JSON.stringify({ changes }),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      if (!options.forceAccountPush) {
        await markLocalChangesAsSynced(database, localChanges);
      }
      console.debug("[Sync] Pushed local changes to server.");
    };

    while (retryCount < maxRetries) {
      try {
        console.debug(`[Sync] Attempt ${retryCount + 1}...`);

        if (options.pushOnly) {
          console.debug("[Sync] Push-only URL:", Config.DATABASE_PUSH_URL);
          await pushLocalChanges(await getLastPulledAt(database));
          break;
        }

        await synchronize({
          database,
          pullChanges: async ({ lastPulledAt, schemaVersion }) => {
            try {
              console.debug("[Sync] Pull URL:", Config.DATABASE_PULL_URL);
              const url = buildPullUrl({
                baseUrl: Config.DATABASE_PULL_URL!,
                lastPulledAt: lastPulledAt ?? null,
                schemaVersion,
                userId,
                fullUserSync: options.fullUserSync,
              });

              const response = await fetch(url);
              if (!response.ok) {
                throw new Error(await response.text());
              }

              const { changes, timestamp } = await response.json();
              console.debug(`[Sync] Pulled changes at ${timestamp}`);
              const pullResult: any = {
                changes: normalizeRemoteChanges(changes),
                timestamp,
              };

              if (options.fullUserSync && userId) {
                pullResult.experimentalStrategy = buildFullUserSyncStrategy(userId);
              }

              return pullResult;
            } catch (err) {
              handleError(err, `sync() → pullChanges attempt ${retryCount + 1}`);
              throw err; // trigger retry
            }
          },

          pushChanges: options.pullOnly
            ? undefined
            : async ({ changes, lastPulledAt }) => {
                try {
                  // example
                  console.debug("[Sync] Push URL:", Config.DATABASE_PUSH_URL);
                  const response = await fetch(
                    `${Config.DATABASE_PUSH_URL}/push?last_pulled_at=${lastPulledAt}`,
                    {
                      method: "POST",
                      body: JSON.stringify({ changes }),
                      headers: {
                        "Content-Type": "application/json",
                      },
                    },
                  );
                  if (!response.ok) {
                    throw new Error(await response.text());
                  }

                  console.debug("[Sync] Pushed local changes to server.");
                } catch (err) {
                  handleError(err, `sync() → pushChanges attempt ${retryCount + 1}`);
                  throw err; // trigger retry
                }
              },

          sendCreatedAsUpdated: true,
          conflictResolver: (table, local, remote, resolved) =>
            resolveSyncConflict(table, local, remote, resolved, options.fullUserSync),
        });

        console.debug("[Sync] Synchronization successful.");
        break; // ✅ success, break out of retry loop
      } catch (err) {
        retryCount++;
        if (retryCount >= maxRetries) {
          console.warn(`[Sync] All ${maxRetries} attempts failed.`);
          handleError(err, "sync() final retry");
        } else {
          console.debug(`[Sync] Retrying... (${retryCount}/${maxRetries})`);
        }
      }
    }
  });
}
