import {synchronize} from '@nozbe/watermelondb/sync';

import {User, Park} from './models';
// your_local_machine_ip_address usually looks like 192.168.0.x
// on *nix system, you would find it out by running the ifconfig command
import SyncLogger from '@nozbe/watermelondb/sync/SyncLogger';
import { Database } from '@nozbe/watermelondb';
const logger = new SyncLogger(10 /* limit of sync logs to keep in memory */);


export async function sync(database: Database)
{
  // const isNotFirstSync = await database.localStorage.get('isFirstSync')
  await synchronize({
    database,
    //log: logger.newLog(),
    pullChanges: async ({lastPulledAt, schemaVersion, migration}) => {
      //get new changees in the database
      const urlParams = `last_pulled_at=${lastPulledAt}&schema_version=${schemaVersion}`;
      const response = await fetch(`http://localhost:5500/pull?${urlParams}`);
      if (!response.ok) {
        console.error('in pull in sync function');
        throw new Error(await response.text());
      }
      const {changes, timestamp} = await response.json();
      console.log({changes, timestamp});
      
      // await database.write(async () => {
      //   try {
      //     if (changes?.users?.created?.length > 0) {
      //       changes.users.created.map(async (createdUser: User) =>
      //       {
      //         console.log(createdUser)
      //         const newUser = await database
      //           .get('users')
      //           .create((user: any) => {
      //             user.id = createdUser.id;
      //             user.username = createdUser.username;
      //             //@ts-expect-error
      //             user.firstName = createdUser.first_name;
      //             //@ts-expect-error
      //             user.lastName = createdUser.last_name;
      //             user.email = createdUser.email;
      //             user.password = createdUser.password;
      //             user.pushNotificationsEnabled = //@ts-expect-error
      //               createdUser.push_notifications_enabled;
      //             //@ts-expect-error
      //             user.themePreference = createdUser.theme_preference;
      //             //@ts-expect-error
      //             user.trailId = createdUser.trail_id;
      //             //@ts-expect-error
      //             user.trailProgress = createdUser.trail_progress;
      //             //@ts-expect-error
      //             user.trailStartedAt = createdUser.trail_started_at;
      //             user.createdAt = createdUser.createdAt;
      //             user.updatedAt = createdUser.updatedAt;
      //           });
      //         console.log('created new users in watermelonDatabase');
      //       });
      //     }
      //     if (changes?.parks?.created?.length > 0) {
      //       changes.parks.created.map(async (createdPark: User) => {
      //         const newPark = await database
      //           .get('parks')
      //           .create((park: any) => {
      //             park.parkName = createdPark.park_name;
      //             park.parkType = createdPark.park_type;
      //             park.parkImageUrl = createdPark.park_image_url;
      //             park.createdAt = createdPark.createdAt;
      //             park.updatedAt = createdPark.updatedAt;
      //           });
      //         console.log('created new park in watermelonDatabase:');
      //       });
      //     }
          
      //   } catch (err) {
      //     console.log(
      //       'error in creating new user in pull changes sync function',
      //       err
      //     );
      //   }
      // });

//UNDER NO CIRCUMSTANCES SHOULD YOU COMMIT THESE LINES UNCOMMENTED!!!
      require('@nozbe/watermelondb/sync/debugPrintChanges').default(
        changes,
        false
      );
      return {changes, timestamp}; 
    },

    //sending user watermelondb changes
    pushChanges: async ({changes, lastPulledAt}) => {
      console.log('in push on client side', changes);
      const response = await fetch(
        `http://localhost:5500/push?last_pulled_at=${lastPulledAt}`,
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
}
