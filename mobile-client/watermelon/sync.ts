import { Database } from "@nozbe/watermelondb";
import SyncLogger from "@nozbe/watermelondb/sync/SyncLogger";
import { synchronize } from "@nozbe/watermelondb/sync";
import {
  applyRemoteChanges,
  fetchLocalChanges,
  getLastPulledAt,
  markLocalChangesAsSynced,
} from "@nozbe/watermelondb/sync/impl";
import Config from "react-native-config";
import handleError from "../helpers/ErrorHandler";

const logger = new SyncLogger(10);
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

let isRunning = false;

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
};

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

async function getCatalogLastPulledAt(database: Database) {
  const value = await database.adapter.getLocal(CATALOG_LAST_PULLED_AT_KEY);
  return parseInt(value, 10) || null;
}

async function setCatalogLastPulledAt(database: Database, timestamp: number) {
  await database.adapter.setLocal(CATALOG_LAST_PULLED_AT_KEY, String(timestamp));
}

export async function pullCatalogChanges(database: Database, isConnected: boolean = false) {
  if (!isConnected) {
    console.debug("[Catalog Sync] Not connected to the internet.");
    return;
  }

  if (isRunning) {
    console.debug("[Catalog Sync] Already running. Skipping new call.");
    return;
  }

  isRunning = true;

  try {
    const lastPulledAt = await getCatalogLastPulledAt(database);
    const url = buildPullUrl({
      baseUrl: Config.DATABASE_PULL_URL,
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
    const catalogChanges = filterCatalogChanges(changes);

    await database.write(async () => {
      await applyRemoteChanges(catalogChanges, {
        db: database,
        sendCreatedAsUpdated: true,
      });
      await setCatalogLastPulledAt(database, timestamp);
    }, "sync-pull-catalog");

    console.debug(`[Catalog Sync] Pulled catalog changes at ${timestamp}`);
  } catch (err) {
    handleError(err, "pullCatalogChanges()");
  } finally {
    isRunning = false;
  }
}

export async function sync(
  database: Database,
  isConnected: boolean = false,
  userId: string = "0",
  options: SyncOptions = {},
) {
  if (!isConnected) {
    console.debug("[Sync] Not connected to the internet.");
    return;
  }

  if (isRunning) {
    console.debug("[Sync] Already running. Skipping new call.");
    return;
  }

  isRunning = true;
  let retryCount = 0;
  const maxRetries = 2;

  const pushLocalChanges = async (lastPulledAt: number | null) => {
    const localChanges = await fetchLocalChanges(database);

    const response = await fetch(
      `${Config.DATABASE_PUSH_URL}/push?last_pulled_at=${lastPulledAt}`,
      {
        method: "POST",
        body: JSON.stringify({ changes: localChanges.changes }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    await markLocalChangesAsSynced(database, localChanges);
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
              baseUrl: Config.DATABASE_PULL_URL,
              lastPulledAt,
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
            return { changes, timestamp };
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
        log: logger,
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

  isRunning = false;
}
