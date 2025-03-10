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
const Stack = createStackNavigator();

const mockUser = createMockUserBase()
const timer = {
      startTime: null,
      isCompleted: false,
      time: 1500,
      isRunning: false,
      isPaused: false,
      isBreak: false,
      focusTime: 1500,
      shortBreakTime: 300,
      longBreakTime: 2700,
      sets: 3,
      completedSets: 0,
      pace: 2,
      autoContinue: false

    }
    const sessionDetails = {
      startTime: null,
      sessionName: '',
      sessionDescription: '',
      sessionCategoryId: '1',
      breakTimeReduction:0,
      minimumPace: 2,
      maximumPace: 5.5,
      paceIncreaseValue: .25,
      paceIncreaseInterval: 900, //15 minutes,
      increasePaceOnBreakValue: 0, //TODO: possible addon sleeping bag increases pace by this interval on breaks
      completedHike: false,
      strikes: 0,
      penaltyValue: 1,
      endSessionModal: false,
      totalDistanceHiked: 0.0,
      totalTokenBonus: 0,
      trailTokensEarned:0,
      sessionTokensEarned:0,
      isLoading: false,
      isError: false,
      backpack: [{addon: null, minimumTotalMiles:0.0}, {addon: null, minimumTotalMiles:75.0}, {addon: null, minimumTotalMiles:175.0}, {addon: null, minimumTotalMiles:375.0}]
    }



describe('New Session Handlers checkLocalStorageSessionSettings()',() => {
  // Reset the local database
  beforeAll(async () => {
    await watermelonDatabase.write(async () => {
      await watermelonDatabase.unsafeResetDatabase();
    })
    //bootsrap initall data from masterdb to local
    await sync(watermelonDatabase, true);
    // tawait pool.query('TRUNCATE TABLE users CASCADE');

    jest.clearAllMocks();
  })
  it('should return undefined', async () => {
    const result = await NewSessionHandlers.checkLocalStorageSessionSettings('1', watermelonDatabase);
    expect(result).toBe(undefined);
  })
  it('should return recentSettings for a category', async () => {
   
    await watermelonDatabase.write(async () => {
      await watermelonDatabase.get('users').create((user) => {
        user.id = mockUser.id;
        user.email = mockUser.email;
        user.password = mockUser.password;
        user.username = mockUser.username;
        user.firstName = mockUser.firstName;
        user.lastName = mockUser.lastName;
        user.trailId = mockUser.trailId; // Ensure this matches a seeded trail
        user.trailTokens = mockUser.trailTokens;
        user.lastDailyStreakDate = mockUser.lastDailyStreakDate;
        user.prestigeLevel = mockUser.prestigeLevel;
        user.pushNotificationsEnabled = mockUser.pushNotificationsEnabled;
        user.trailStartedAt = mockUser.trailStartedAt;
        user.trailProgress = mockUser.trailProgress;
        user.totalMiles = mockUser.totalMiles;
        user.dailyStreak = mockUser.dailyStreak;
        user.themePreference = mockUser.themePreference;
        // Initialize other fields as necessary
      });
    });

  
    await watermelonDatabase.localStorage.set(
      'category 1 settings',
      JSON.stringify({
        sessionCategoryId: sessionDetails.sessionCategoryId,
        focusTime: timer.focusTime,
        shortBreakTime: timer.shortBreakTime,
        longBreakTime: timer.longBreakTime,
      })
    );

    const results = await NewSessionHandlers.checkLocalStorageSessionSettings({sessionCategoryId:'1', database: watermelonDatabase})
    console.log('results', results)

    await waitFor(() => {

      expect(results.sessionCategoryId).toBe('1')
    })



  })

})

describe('NewSessionHandler StartSessionClick', () => {
 test('user invokes start new session', async () => {
    //get user form database
    const [testUser] = await watermelonDatabase.get('users').query().fetch();
    const result = await NewSessionHandlers.StartSessionClick(sessionDetails);
    const sessions  = await watermelonDatabase.get('users_sessions').query().fetch();
    expect(sessions.length).toBe(1)
  })

})
