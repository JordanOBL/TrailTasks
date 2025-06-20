import {Database} from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'

import migrations from './migrations';
import mySchema from './schema';
import {
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
  User_Friend
} from './models';

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
  User_Friend
  ],actionsEnabled: true,
});
