import {Database} from '@nozbe/watermelondb';
// your_local_machine_ip_address usually looks like 192.168.0.x
// on *nix system, you would find it out by running the ifconfig command
import SyncLogger from '@nozbe/watermelondb/sync/SyncLogger';
import handleError from "../helpers/ErrorHandler";
import {synchronize} from '@nozbe/watermelondb/sync';
//import {DATABASE_URL, DATABASE_PULL_URL, DATABASE_PUSH_URL} from "@env"
import Config from "react-native-config";
const logger = new SyncLogger(10 /* limit of sync logs to keep in memory */);

//singleton
let isRunning = false;

export async function sync(database: Database,isConnected: boolean = false, userId: string = '0') {
  try {
    //check internet Connection
    // @ts-ignore
    //set locatStorage connection status

    if (!isRunning && isConnected) {
      //stop more than one instance
      isRunning = true;

      await synchronize({
        database,
        pullChanges: async ({lastPulledAt, schemaVersion, migration}) => {
          try {
            //console.debug("config.DATABASE_PULL_URL", Config.DATABASE_PULL_URL);
            //get new changees in the watermelon database
            const urlParams = userId
              ? `last_pulled_at=${lastPulledAt}&schema_version=${schemaVersion}&userId=${userId}`
              : `last_pulled_at=${lastPulledAt}&schema_version=${schemaVersion}`;
            const response = await fetch(
              `${Config.DATABASE_PULL_URL}/pull?${urlParams}`
            );
            if (!response.ok) {
              console.error('in pull in sync()');
              throw new Error(await response.text());
            }
            const {changes, timestamp} = await response.json();

            //UNDER NO CIRCUMSTANCES SHOULD YOU COMMIT THES LINES UNCOMMENTED!!!
            //           require('@nozbe/watermelondb/sync/debugPrintChanges').default(
            //             changes,
            //             false
            //           );
            return {changes, timestamp};
          } catch (err) {
            handleError(err, 'sync() in PULL CHANGES',);
            return {changes: [], timestamp: Date.now()};
          }
        },

        //sending server user watermelondb changes
        pushChanges: async ({changes, lastPulledAt}) => {
          try{
          const response = await fetch(
            `${Config.DATABASE_PUSH_URL}/push?last_pulled_at=${lastPulledAt}`,
            {
              method: 'POST',
              body: JSON.stringify({changes}),
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          // UNDER NO CIRCUMSTANCES SHOULD YOU COMMIT THESE LINES UNCOMMENTED!!!
          //           require('@nozbe/watermelondb/sync/debugPrintChanges').default(
          //             changes,
          //             true
          //           );
          if (!response.ok) {
            console.error('in push in sync function');
            throw new Error(await response.text());
          }
        }catch(err) {
            handleError(err, 'sync() in PUSH CHANGES');
          }},
        sendCreatedAsUpdated: true,
      });
      isRunning = false;
    } else if (isRunning === true) {
      console.debug('Sync() already running...');
    } else if (!isConnected) {
      console.debug('not connected to internet for sync()');
    }
  } catch (err) {
    isRunning = false;
    handleError(err, 'sync()',);
  }
}
