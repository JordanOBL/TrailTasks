import {synchronize} from '@nozbe/watermelondb/sync';

import {User, Park} from './models';
// your_local_machine_ip_address usually looks like 192.168.0.x
// on *nix system, you would find it out by running the ifconfig command
import SyncLogger from '@nozbe/watermelondb/sync/SyncLogger';
import {Database} from '@nozbe/watermelondb';
const logger = new SyncLogger(10 /* limit of sync logs to keep in memory */);
import checkInternetConnection from '../helpers/InternetConnection/checkInternetConnection';

//singleton
let isRunning = false;
const IP = 'localhost'

export async function sync(database: Database) {
  try {
    //check internet Connection
    const {connection} = await checkInternetConnection();
    console.log('check connetion to sync', connection);

    //set locatStorage connection status
    await database.localStorage.set('isConnected', connection.isConnected);

    if (!isRunning && connection.isConnected) {
      //stop more than one instance
      isRunning = true;
      console.log('syncing');
      // const isNotFirstSync = await database.localStorage.get('isFirstSync')
      await synchronize({
        database,
        //log: logger.newLog(),
        pullChanges: async ({lastPulledAt, schemaVersion, migration}) => {
          //get new changees in the watermelon database
          const urlParams = `last_pulled_at=${lastPulledAt}&schema_version=${schemaVersion}`;
          const response = await fetch(
            `http://${IP}:5500/pull?${urlParams}`
          );
          if (!response.ok) {
            console.error('in pull in sync function');
            throw new Error(await response.text());
          }
          const {changes, timestamp} = await response.json();
          console.log({changes, timestamp});

          //UNDER NO CIRCUMSTANCES SHOULD YOU COMMIT THESE LINES UNCOMMENTED!!!
          require('@nozbe/watermelondb/sync/debugPrintChanges').default(
            changes,
            false
          );
          return {changes, timestamp};
        },

        //sending server user watermelondb changes
        pushChanges: async ({changes, lastPulledAt}) => {
          console.log('in push on client side', changes);
          const response = await fetch(
            `http://${IP}:5500/push?last_pulled_at=${lastPulledAt}`,
            {
              method: 'POST',
              body: JSON.stringify({changes}),
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          // UNDER NO CIRCUMSTANCES SHOULD YOU COMMIT THESE LINES UNCOMMENTED!!!
          require('@nozbe/watermelondb/sync/debugPrintChanges').default(
            changes,
            true
          );
          if (!response.ok) {
            console.error('in push in sync function');
            throw new Error(await response.text());
          }
        },
        sendCreatedAsUpdated: true,
      });
      isRunning = false;
    } else if (isRunning === true) {
      console.log('Sync ALready Running');
    } else if (!connection.isConnected) {
      console.log('not connected to internet for sync');
    }
  } catch (err) {
    isRunning = false;
    console.log('Caught Error in watermelon sync', err);
  }
}
