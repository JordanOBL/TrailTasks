import 'react-native-gesture-handler';
import 'react-native-reanimated';
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
  User_Friend, 
  Cached_Friend
} from './watermelon/models';

import App from './App';
import {AppRegistry} from 'react-native';
import {Database} from '@nozbe/watermelondb';
import {DatabaseProvider} from '@nozbe/watermelondb/react';
import {AuthProvider} from './services/AuthContext';
import {InternetConnectionProvider} from './contexts/InternetConnectionProvider';
import {ThemeProvider} from './contexts/ThemeProvider';
import React from 'react';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import {name as appName} from './app.json';
import schema from './watermelon/schema';
import {testDb} from './watermelon/testDB';
import migrations from './watermelon/migrations';

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
    Cached_Friend
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
