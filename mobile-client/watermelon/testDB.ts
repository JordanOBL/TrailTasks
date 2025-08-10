import {
  Achievement,
  Addon,
  Cached_Friend,
  Park,
  Park_State,
  Park_Wild,
  Session_Addon,
  Session_Category,
  Trail,
  User,
  User_Achievement,
  User_Addon,
  User_Completed_Trail,
  User_Friend,
  User_Park,
  User_Purchased_Trail,
  User_Queued_Trail,
  User_Session,
  User_Wild,
  Wild,
} from './models';

import {Database} from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import migrations from './migrations';
import mySchema from './schema';

// Create the Node-based SQLite adapter
const adapter = new SQLiteAdapter({
  schema: mySchema,
  // Watermelon checks if we’re on RN or Node. 
  // Because we mocked index.native, it’ll use `better-sqlite3` in Node.
  synchronous: true, 
  migrations,
  jsi: false, // If your version of Watermelon complains about JSI, ensure it's off
})


export const testDb = new Database({
  adapter,
  modelClasses: [
  Achievement,
  User_Completed_Trail,
  Park,
  Park_State,
  User_Queued_Trail,
  Session_Category,
  Trail,
  User,
  User_Achievement,
  User_Purchased_Trail,
  User_Session,
  Addon,
  User_Addon,
  Session_Addon,
  User_Park,
  Cached_Friend,
  User_Friend,
  Wild,
  User_Wild,
  Park_Wild, // Ensure this is included in the model classes
  ],
  actionsEnabled: true,
});
