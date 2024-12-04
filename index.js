import 'react-native-gesture-handler';
import 'react-native-reanimated';
import {
  Achievement,
  Badge,
  User_Completed_Trail,
  Park,
  Park_State,
  User_Queued_Trail,
  Session_Category,
  Subscription,
  Trail,
  User,
  User_Achievement,
  User_Badge,
  User_Purchased_Trail,
  User_Session,
  Addon,
  User_Addon,
  Session_Addon,
  User_Completed_Park
} from './watermelon/models';

import App from './App';
import {AppRegistry} from 'react-native';
import {Database} from '@nozbe/watermelondb';
import {DatabaseProvider} from '@nozbe/watermelondb/react';

import React from 'react';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import {name as appName} from './app.json';
import schema from './watermelon/schema';

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
    User_Completed_Trail,
    User_Completed_Park,
    User_Queued_Trail,
    User_Badge,
    Session_Category,
    User_Session,
    Subscription,
    User_Purchased_Trail,
    Addon,
    User_Addon,
    Session_Addon
  ],
});

export const WrappedApp = () => {
  return (
      <DatabaseProvider database={watermelonDatabase}>
        <App />
      </DatabaseProvider>
  );
};

AppRegistry.registerComponent(appName, () => WrappedApp);
