import {Database} from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';

import mySchema from '../watermelon/schema';
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
  User_Miles,
  User_Badge,
  Session_Category,
  User_Session,
  Subscription,
} from './models';

const adapter = new LokiJSAdapter({
  dbName: 'TestDb',
  schema: mySchema,
  useWebWorker: false,
  useIncrementalIndexedDB: true,
  extraLokiOptions: {
    autosave: false,
  },
});

export const testDb =  new Database({
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
    User_Miles,
    User_Badge,
    Session_Category,
    User_Session,
    Subscription,
  ],
});
