// __tests__/authHelpers.test.ts
import { Database } from '@nozbe/watermelondb';
import { checkLocalUserExists } from './auth'; // adjust path as needed
import handleError from '../helpers/ErrorHandler'; // adjust path
import { Q } from '@nozbe/watermelondb';
import {createMockUserBase} from "../__mocks__/UserModel"
import {watermelonDatabase} from "../index";
// Mock handleError to see if it's called
jest.mock('../helpers/ErrorHandler');
const mockUser = createMockUserBase(); 

describe('AuthServices functions', () => {

  describe('checkLocalUserExists', () => {
    beforeEach(async () => {
      // Optionally call database.unsafeResetDatabase() 
      // if you want to be sure there's no leftover data 
      // from previous tests in the same instance.
      await watermelonDatabase.write(async () => {
        await watermelonDatabase.unsafeResetDatabase() 
      })
    })

    it('returns a user if found in the local DB', async () => {
      // Arrange: mock the DB to return a single user
      await watermelonDatabase.write(async () => {

        const created = await watermelonDatabase.get('users').create((user: any) => {
          user.email = mockUser.email
          user.password = mockUser.password
          user.username = mockUser.username
          user.firstName = mockUser.firstName
          user.lastName = mockUser.lastName
          user.trailStartedAt = mockUser.trailStartedAt
          user.trailId = mockUser.trailId
          user.trailProgress = mockUser.trailProgress
          user.dailyStreak = mockUser.dailyStreak
          user.totalMiles = mockUser.totalMiles
          user.prestigeLevel = mockUser.prestigeLevel
          user.trailTokens = mockUser.trailTokens
          user.pushNotificationsEnabled = mockUser.pushNotificationsEnabled

        })
      })

      // Act
      const result = await checkLocalUserExists('mockEmail@example.com', 'mockPassword', watermelonDatabase);

      // Assert
      expect(result.email).toBe(mockUser.email);
      expect(result.username).toBe(mockUser.username);
    });

    it('returns undefined if no user found', async () => {
      // By default, fetch returns []
      const result = await checkLocalUserExists('not@found.com', 'nope', watermelonDatabase);
      expect(result).toBeUndefined();
    });

  });

})

