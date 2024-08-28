// import * as React from 'react';
import {Database} from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import schema from './schema';

// import your Models here
import {
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
} from './models';


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
