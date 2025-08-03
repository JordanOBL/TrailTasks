import 'react-native-gesture-handler';
import 'react-native-reanimated';

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
} from './watermelon/models';

import App from './App';
import {AppRegistry} from 'react-native';
import {AuthProvider} from './services/AuthContext';
import {Database} from '@nozbe/watermelondb';
import {DatabaseProvider} from '@nozbe/watermelondb/react';
import {InternetConnectionProvider} from './contexts/InternetConnectionProvider';
import React from 'react';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import {ThemeProvider} from './contexts/ThemeProvider';
import {name as appName} from './app.json';
import migrations from './watermelon/migrations';
import schema from './watermelon/schema';
import {testDb} from './watermelon/testDB';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'TrailTasks',
  migrations,
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
    User_Purchased_Trail,
    Addon,
    User_Addon,
    Session_Addon,
    User_Friend,
    Cached_Friend,
    Wild,
    User_Wild,
    Park_Wild,
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
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </AuthProvider>
      </InternetConnectionProvider>
    </DatabaseProvider>
  );
};

AppRegistry.registerComponent(appName, () => WrappedApp);
