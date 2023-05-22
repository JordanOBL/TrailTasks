import {synchronize} from '@nozbe/watermelondb/sync';
import {watermelonDatabase as database} from './getWatermelonDb';
// your_local_machine_ip_address usually looks like 192.168.0.x
// on *nix system, you would find it out by running the ifconfig command
import SyncLogger from '@nozbe/watermelondb/sync/SyncLogger';
const logger = new SyncLogger(10 /* limit of sync logs to keep in memory */);
//const SYNC_API_URL = 'http://localhost:5500';
export async function sync() {
  await synchronize({
    database,
    //log: logger.newLog(),
    pullChanges: async ({lastPulledAt, schemaVersion = 1, migration = null}) => {
      //*successfully pulls new users from pg database!!!
      //get new changees in the database
      const urlParams = `last_pulled_at=${lastPulledAt}&schema_version=${schemaVersion}`;
      console.log(lastPulledAt, schemaVersion)
      const response = await fetch(`http://localhost:5500/pull?${urlParams}`);
      if (!response.ok) {
        throw new Error(await response.text());
      }
      console.log('here in sync p');
      const { changes, timestamp } = await response.json();
      const validTimestamp = Date.parse(timestamp);
      console.log('pulling created users from pg', changes?.users?.createdUsers[0]);
      console.log(
        'pulling updated users from pg',
        changes?.users?.updatedUsers[0]
      );
      if (changes?.users?.createdUsers?.length > 0) {
        await Promise.all(
          changes.users.createdUsers.map(
            async (createdUser: {
              id: any;
              username: any;
              first_name: any;
              last_name: any;
              email: any;
              password: any;
              push_notifications_enabled: any;
              theme_preference: any;
              trail_id: any;
              trail_progress: any;
              trail_started_at: any;
              createdAt: any;
              updatedAt: any;
            }) => {
              await database.write(async () => {
                try {
                  const newUser = await database.get('users').create((user) => {
                    user.id = createdUser.id;
                    user.username = createdUser.username;
                    user.firstName = createdUser.first_name;
                    user.lastName = createdUser.last_name;
                    user.email = createdUser.email;
                    user.password = createdUser.password;
                    user.pushNotificationsEnabled =
                      createdUser.push_notifications_enabled;
                    user.themePreference = createdUser.theme_preference;
                    user.trailId = createdUser.trail_id;
                    user.trailProgress = createdUser.trail_progress;
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
