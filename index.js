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
  User_Purchased_Trail,
  User_Session,
} from './watermelon/models';

import App from './App';
import {AppRegistry} from 'react-native';
import {Database} from '@nozbe/watermelondb';
import DatabaseProvider from '@nozbe/watermelondb/DatabaseProvider';
/**
 * @format
 */
import React from 'react';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import {name as appName} from './app.json';
import schema from './watermelon/schema';

const WrappedApp = () => {
  const adapter = new SQLiteAdapter({
    schema,
    dbName: 'TrailTasks',
  });

  const watermelonDatabase = new Database({
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
      Subscription,
      User_Purchased_Trail,
    ],
  });
  return (
    <DatabaseProvider database={watermelonDatabase}>
      <App />
    </DatabaseProvider>
  );
};

AppRegistry.registerComponent(appName, () => WrappedApp);
