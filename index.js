import 'react-native-gesture-handler';
import 'react-native-reanimated';
import {
  Achievement,
  User_Completed_Trail,
  Park,
  Park_State,
  User_Queued_Trail,
  Session_Category,
  Subscription,
  Trail,
  User,
  User_Achievement,
  User_Purchased_Trail,
  User_Session,
  Addon,
  User_Addon,
  Session_Addon,
  User_Park
} from './watermelon/models';

import App from './App';
import {AppRegistry} from 'react-native';
import {Database} from '@nozbe/watermelondb';
import {DatabaseProvider} from '@nozbe/watermelondb/react';
import {AuthProvider} from './services/AuthContext';
import {InternetConnectionProvider} from './contexts/InternetConnectionProvider';
import React from 'react';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import {name as appName} from './app.json';
import schema from './watermelon/schema';
import {testDb} from './watermelon/testDB';

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
    Achievement,
    User_Achievement,
    User_Completed_Trail,
    User_Park,
    User_Queued_Trail,
    Session_Category,
    User_Session,
    Subscription,
    User_Purchased_Trail,
    Addon,
    User_Addon,
    Session_Addon
  ],
});

const database = process.env.NODE_ENV === 'test'
  ? testDb
  : watermelonDatabase;

export const WrappedApp = () => {
  return (
    <DatabaseProvider database={database}>
      <InternetConnectionProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </InternetConnectionProvider>
    </DatabaseProvider>
  );
};

AppRegistry.registerComponent(appName, () => WrappedApp);
