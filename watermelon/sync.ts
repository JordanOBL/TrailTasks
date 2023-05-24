import {synchronize} from '@nozbe/watermelondb/sync';
import { watermelonDatabase as database } from './getWatermelonDb';
import { User } from './models';
// your_local_machine_ip_address usually looks like 192.168.0.x
// on *nix system, you would find it out by running the ifconfig command
import SyncLogger from '@nozbe/watermelondb/sync/SyncLogger';
const logger = new SyncLogger(10 /* limit of sync logs to keep in memory */);

export async function sync() {
  await synchronize({
    database,
    //log: logger.newLog(),
    pullChanges: async ({lastPulledAt, schemaVersion = 1, migration = null}) => {

      //get new changees in the database
      const urlParams = `last_pulled_at=${lastPulledAt}&schema_version=${schemaVersion}`;
      console.log(lastPulledAt, schemaVersion)
      const response = await fetch(`http://localhost:5500/pull?${urlParams}`);
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const { changes, timestamp } = await response.json();
      const validTimestamp = Date.parse(timestamp);
      if (changes?.users?.createdUsers?.length > 0) {
        await Promise.all(
          changes.users.createdUsers.map(
            async (createdUser: User) => {
              await database.write(async () => {
                try {
                  const newUser = await database.get('users').create((user: any) => {
                    user.id = createdUser.id;
                    user.username = createdUser.username;
                    //@ts-expect-error
                    user.firstName = createdUser.first_name;
                    //@ts-expect-error
                    user.lastName = createdUser.last_name;
                    user.email = createdUser.email;
                    user.password = createdUser.password;
                    user.pushNotificationsEnabled = //@ts-expect-error
                      createdUser.push_notifications_enabled;
                    //@ts-expect-error
                    user.themePreference = createdUser.theme_preference;
                    //@ts-expect-error
                    user.trailId = createdUser.trail_id;
                    //@ts-expect-error
                    user.trailProgress = createdUser.trail_progress;
                    //@ts-expect-error
                    user.trailStartedAt = createdUser.trail_started_at;
                    user.createdAt = createdUser.createdAt;
                    user.updatedAt = createdUser.updatedAt;
                  });
                  console.log('created new users in watermelonDatabase');
                } catch (err) {
                  console.log(
                    'error in creating new user in pull changes sync function',
                    err
                  );
                }
              });
            }
          )
        ); //UNDER NO CIRCUMSTANCES SHOULD YOU COMMIT THESE LINES UNCOMMENTED!!!
      }
      require('@nozbe/watermelondb/sync/debugPrintChanges').default(
        changes,
        false
      );
      return {changes,  timestamp: validTimestamp};
    },
    //sending user watermelondb changes
    pushChanges: async ({changes, lastPulledAt}) => {
      console.log('in push on client side', changes)
      const response = await fetch(`http://localhost:5500/push`, {
        method: 'POST',
        //!keep changes in curlies to send changes!!
        body: JSON.stringify({changes}),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      // UNDER NO CIRCUMSTANCES SHOULD YOU COMMIT THESE LINES UNCOMMENTED!!!
      require('@nozbe/watermelondb/sync/debugPrintChanges').default(
        changes,
        true
      );
      if (!response.ok) {
        throw new Error(await response.text());
      }
    },
    sendCreatedAsUpdated: true,
  });
}
