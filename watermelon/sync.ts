import {Database} from '@nozbe/watermelondb';
// your_local_machine_ip_address usually looks like 192.168.0.x
// on *nix system, you would find it out by running the ifconfig command
import SyncLogger from '@nozbe/watermelondb/sync/SyncLogger';
import {User} from './models';
import checkInternetConnection from '../helpers/InternetConnection/checkInternetConnection';
import {synchronize} from '@nozbe/watermelondb/sync';

const logger = new SyncLogger(10 /* limit of sync logs to keep in memory */);

//singleton
let isRunning = false;
const IP = 'localhost'

export async function sync(database: Database, user: User) {
  try {
    //check internet Connection
    const {connection} = await checkInternetConnection();
    console.debug('sync() device internet:', connection.isConnected);
    //set locatStorage connection status
    
    await database.localStorage.set('isConnected', connection.isConnected);

    if (!isRunning && user && connection.isConnected) {
      //stop more than one instance
      isRunning = true;
      //console.debug('Running sync()');
    
      await synchronize({
        database,
        user,
        pullChanges: async ({ lastPulledAt, schemaVersion, migration }) =>
        {
          console.debug('user from pull changes', user.id)
          //get new changees in the watermelon database
          const urlParams = `last_pulled_at=${lastPulledAt}&schema_version=${schemaVersion}&userId=${user.id}`;
          const response = await fetch(
            `http://192.168.1.208:5500/pull?${urlParams}`
          );
          if (!response.ok) {
            console.error('in pull in sync()')
            throw new Error(await response.text());
          }
          const {changes, timestamp} = await response.json();


          //UNDER NO CIRCUMSTANCES SHOULD YOU COMMIT THES LINES UNCOMMENTED!!!
//           require('@nozbe/watermelondb/sync/debugPrintChanges').default(
//             changes,
//             false
//           );
          return {changes, timestamp};
        },

        //sending server user watermelondb changes
        pushChanges: async ({changes, lastPulledAt}) => {
          console.debug('in push on client side sync()');
          const response = await fetch(
            `http://192.168.1.208:5500/push?last_pulled_at=${lastPulledAt}`,
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
        },
        sendCreatedAsUpdated: true,
      });
      isRunning = false;
    } else if (isRunning === true) {
      console.debug('Sync() already running...');
    } else if (!connection.isConnected) {
      console.debug('not connected to internet for sync()');
    }
  } catch (err) {
    isRunning = false;
    console.error('Error in sync()', err);
  }
}
