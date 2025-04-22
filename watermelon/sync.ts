import { Database } from '@nozbe/watermelondb';
import SyncLogger from '@nozbe/watermelondb/sync/SyncLogger';
import { synchronize } from '@nozbe/watermelondb/sync';
import Config from 'react-native-config';
import handleError from '../helpers/ErrorHandler';

const logger = new SyncLogger(10);
let isRunning = false;

export async function sync(database: Database, isConnected: boolean = false, userId: string = '0') {
  if (!isConnected) {
    console.debug('[Sync] Not connected to the internet.');
    return;
  }

  if (isRunning) {
    console.debug('[Sync] Already running. Skipping new call.');
    return;
  }

  isRunning = true;
  let retryCount = 0;
  const maxRetries = 2;

  while (retryCount < maxRetries) {
    try {
      console.debug(`[Sync] Attempt ${retryCount + 1}...`);
      await synchronize({
        database,
        pullChanges: async ({ lastPulledAt, schemaVersion }) => {
          try {
            const urlParams = userId
              ? `last_pulled_at=${lastPulledAt}&schema_version=${schemaVersion}&userId=${userId}`
              : `last_pulled_at=${lastPulledAt}&schema_version=${schemaVersion}`;

            const response = await fetch(`${Config.DATABASE_PULL_URL}/pull?${urlParams}`);
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

        pushChanges: async ({ changes, lastPulledAt }) => {
          try {   
            // Remove any table that your PostgreSQL does NOT support
            // example
            const response = await fetch(
              `${Config.DATABASE_PUSH_URL}/push?last_pulled_at=${lastPulledAt}`,
              {
                method: 'POST',
                body: JSON.stringify({ changes }),
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );
            if (!response.ok) {
              throw new Error(await response.text());
            }

            console.debug('[Sync] Pushed local changes to server.');
          } catch (err) {
            handleError(err, `sync() → pushChanges attempt ${retryCount + 1}`);
            throw err; // trigger retry
          }
        },

        sendCreatedAsUpdated: true,
      });

      console.debug('[Sync] Synchronization successful.');
      break; // ✅ success, break out of retry loop
    } catch (err) {
      retryCount++;
      if (retryCount >= maxRetries) {
        console.warn(`[Sync] All ${maxRetries} attempts failed.`);
        handleError(err, 'sync() final retry');
      } else {
        console.debug(`[Sync] Retrying... (${retryCount}/${maxRetries})`);
      }
    }
  }

  isRunning = false;
}

