import {MockTestData} from '../mockTestData';
import {testDb} from '../../watermelon/testDB'; // Import the test database instance
import * as helpers from '../../helpers/loginHelpers';
import {handleRegister} from '../../helpers/registerHelpers';
import {setGenerator} from '@nozbe/watermelondb/utils/common/randomId';
import {v4 as uuidv4} from 'uuid';

setGenerator(uuidv4);

jest.mock('@nozbe/watermelondb/utils/common/randomId/randomId', () => {});

beforeAll(async () => {
  await handleRegister({
    firstName: MockTestData.existingUserDetails.firstName,
    lastName: MockTestData.existingUserDetails.lastName,
    email: MockTestData.existingUserDetails.email,
    password: MockTestData.existingUserDetails.password,
    confirmPassword: MockTestData.existingUserDetails.confirmPassword,
    username: MockTestData.existingUserDetails.username,
    setUser: jest.fn(),
    setError: jest.fn(),
    watermelonDatabase: testDb,
  });
});

afterAll(async () => {
  await testDb.write(async () => {
    await testDb.unsafeResetDatabase();
  });
});

describe('checkExistingUser', () => {
  test('should return the existing user if found', async () => {
    const user = await helpers.checkExistingUser(
      'existing@example.com',
      'password',
      testDb
    );
    expect(user.email).toEqual(MockTestData.existingUserDetails.email);
  });

  test('should return null if no user found', async () => {
    const user = await helpers.checkExistingUser(
      MockTestData.unfoundUserDetails.username,
      MockTestData.unfoundUserDetails.password,
      testDb
    );
    expect(user).toBeUndefined();
  });
});

describe('setSubscriptionStatus', () => {
  afterEach(async () => {
    await testDb.write(async () => {
      await testDb.localStorage.remove('subscription_id');
    });
  });
  test('should set subscription status if subscription exists', async () => {
    const both = await testDb.write(async () => {
      const sub = await testDb.collections
        .get('users_subscriptions')
        .query()
        .fetch();

      const user = await testDb.collections.get('users').query().fetch();

      return {user, sub};
    });

    const subscriptionId = await helpers.setSubscriptionStatus(both.user, testDb);

    expect(subscriptionId).toEqual(both.sub.id);
  });

  test('should not set subscription status if no subscription exists', async () => {
    await helpers.setSubscriptionStatus(MockTestData.unfoundUserDetails, testDb);
    const subscriptionId = await testDb.localStorage.get('subscription_id');
    expect(subscriptionId).toBeUndefined();
  });
});

describe('setLocalStorageUserAndMiles', () => {
  test('should set local storage user and miles', async () => {
    const user = await testDb.write(async () => {
      const users = await testDb.collections.get('users').query().fetch();
      return users[0];
    });

    await helpers.setLocalStorageUserAndMiles(user, testDb);
    const userId = await testDb.localStorage.get('user_id');
    expect(userId).toEqual(user.id);
  });
});

describe('checkForLoggedInUser', () => {
  afterEach(async () => {
    await testDb.write(async () => {
      await testDb.unsafeResetDatabase();
    });
  });
  test('should set user if user is logged in', async () => {
    const user = await testDb.write(async () => {
      const users = await testDb.collections.get('users').query().fetch();
      return users[0];
    });
    await testDb.localStorage.set('user_id', user.id);
    const setUserMock = jest.fn();
    await helpers.checkForLoggedInUser(setUserMock, testDb);
    expect(setUserMock).toHaveBeenCalledWith(user);
  });

  test('should not set user if user is not logged in', async () => {
    const setUserMock = jest.fn();
    await helpers.checkForLoggedInUser(setUserMock, testDb);
    expect(setUserMock).not.toHaveBeenCalled();
  });
});
