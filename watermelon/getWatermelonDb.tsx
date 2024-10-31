// import your Models here
import {
  Achievement,
  Badge,
  Completed_Hike,
  Park,
  Park_State,
  Queued_Trail,
  Session_Category,
  Subscription,
  Trail,
  User,
  User_Achievement,
  User_Badge,
  User_Session
} from './models';

// import * as React from 'react';
import {Database} from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import schema from './schema';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'TrailTasks',
});

export const watermelonDatabase = new Database({
  adapter,
  modelClasses: [
    Park,
    Trail,
    User,
    Park_State,
    Badge,
    Achievement,
    User_Achievement,
    Completed_Hike,
    Queued_Trail,
    User_Badge,
    Session_Category,
    User_Session,
    Subscription
  ],
});

export default watermelonDatabase;