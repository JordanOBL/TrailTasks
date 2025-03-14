import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { WrappedApp} from '../../index';
import {testDb as watermelonDatabase} from '../../watermelon/testDB';
import {createMockUserBase} from '../../__mocks__/UserModel';
import { DatabaseProvider } from '@nozbe/watermelondb/react';
import { AuthProvider, useAuthContext } from '../../services/AuthContext'
import {InternetConnectionProvider} from './../contexts/InternetConnectionProvider';
import { sync } from '../../watermelon/sync';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import NewSessionHandlers from './newSessionHandlers';

describe('Rewards', ()=> {

  // Reset the local database
  beforeAll(async () => {
    await watermelonDatabase.write(async () => {
      await watermelonDatabase.unsafeResetDatabase();
    })
    //test server needs to be running (trailTasksServer -> npm run test-server)
    await sync(watermelonDatabase, true)
  })

})
