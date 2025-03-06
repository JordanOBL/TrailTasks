// __tests__/authHelpers.test.ts
import { Database } from '@nozbe/watermelondb';
import { checkLocalUserExists, checkGlobalUserExists, saveUserToLocalDB } from './auth'; // adjust path as needed
import {GlobalExistingUserResponseSuccess, GlobalExistingUserResponseFail} from '../types/api'
import handleError from '../helpers/ErrorHandler'; // adjust path
import { Q } from '@nozbe/watermelondb';
import {createMockUserBase} from "../__mocks__/UserModel"
import {testDb} from '../watermelon/testDB'
import {Pool} from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_CONNECTION_STRING });

// Mock handleError to see if it's called
jest.mock('../helpers/ErrorHandler');
const mockUser = createMockUserBase(); 

describe('Auth Services', () => {
  // Reset the local database
	beforeEach(async () => {
		await testDb.write(async () => {
			await testDb.unsafeResetDatabase();
		})

		await pool.query('TRUNCATE TABLE users CASCADE');

		jest.clearAllMocks();
	})

	//Disconnect from master Db
	afterAll(async ()=>{
		await pool.end();
	})


  describe('checkLocalUserExists', () => {
    it('returns a user if found in the local DB', async () => {
      // Arrange: mock the DB to return a single user
      await testDb.write(async () => {

        const created = await testDb.get('users').create((user: any) => {
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
      const result = await checkLocalUserExists(mockUser.email, mockUser.password, testDb);

      // Assert
      expect(result.email).toBe(mockUser.email);
      expect(result.username).toBe(mockUser.username);
    });

    it('returns undefined if no user found', async () => {
      // By default, fetch returns []
      const result = await checkLocalUserExists('not@found.com', 'nope', testDb);
      expect(result).toBeUndefined();
    });

  });
  describe('checkGlobalUserExists', () => {

    it('returns a user if found in the global DB', async () => {
      //create user in test global PG bd
      await pool.query('INSERT INTO users (id, username, email, password, first_name, last_name, trail_started_at, trail_tokens, total_miles, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', [mockUser.id, mockUser.username, mockUser.email, mockUser.password, mockUser.firstName, mockUser.lastName, mockUser.trailStartedAt, mockUser.trailTokens, mockUser.totalMiles, new Date(), new Date()]);

      //ACT. call checkGlobalUserExists()
      //if user found 
      const result: GlobalExistingUserResponseSuccess | GlobalExistingUserResponseFail = await checkGlobalUserExists(mockUser.email, mockUser.password);
      //ASSERT. check if user is returned
      expect(result.user.id).toEqual(mockUser.id);
    })
    it('returns null if no user found', async () => {
      const result: GlobalExistingUserResponseSuccess | GlobalExistingUserResponseFail = await checkGlobalUserExists('not@found.com', 'nope');
      expect(result).toBeNull();
    })

  })
  describe('saveUserToLocalDB', () => {

    it('saves a user to the local DB', async () => {
      //ensure user does not exist in localDB
      let [ user]= await testDb.get('users').query(Q.where('email', mockUser.email)).fetch();

      expect(user).toBeUndefined();

      //create user in test global PG bd
      await pool.query('INSERT INTO users (id, username, email, password, first_name, last_name, trail_started_at, trail_tokens, total_miles, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', [mockUser.id, mockUser.username, mockUser.email, mockUser.password, mockUser.firstName, mockUser.lastName, mockUser.trailStartedAt, mockUser.trailTokens, mockUser.totalMiles, new Date(), new Date()]);

      //get global user
      const result: GlobalExistingUserResponseSuccess | GlobalExistingUserResponseFail = await checkGlobalUserExists(mockUser.email, mockUser.password);

      //Act. save user to local db
      await saveUserToLocalDB(result, testDb);

      //Assert. check if user is saved
      [ user]= await testDb.get('users').query(Q.where('email', mockUser.email)).fetch();
      expect(user.email).toBe(mockUser.email);
    })

  })

});
