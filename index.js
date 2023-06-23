/**
 * @format
 */
import React from 'react';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
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
  Basic_Subscription_Trail,
} from './watermelon/models';
import DatabaseProvider from '@nozbe/watermelondb/DatabaseProvider';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import schema from './watermelon/schema';
import {Database} from '@nozbe/watermelondb';

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
      User_Miles,
      User_Badge,
      Session_Category,
      User_Session,
      Subscription,
      Basic_Subscription_Trail,
    ],
  });
  return (
    <DatabaseProvider database={watermelonDatabase}>
      <App />
    </DatabaseProvider>
  );
};

AppRegistry.registerComponent(appName, () => WrappedApp);
