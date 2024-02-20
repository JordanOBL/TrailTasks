import {testDb} from '../../watermelon/testDB';
import * as helpers from '../../helpers/registerHelpers';
import {setGenerator} from '@nozbe/watermelondb/utils/common/randomId';
import {v4 as uuidv4} from 'uuid';
import formatDateTime from '../../helpers/formatDateTime';
import {MockTestUsers} from '../mockTestUsers';

setGenerator(uuidv4);
jest.mock('@nozbe/watermelondb/utils/common/randomId/randomId', () => {});

// Mocked user data
const newUserDetails = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'test@example.com',
  password: 'password',
  confirmPassword: 'password',
  username: 'johndoe',
};

beforeAll(async () => {
  // Add existing user to the database before running tests
  await testDb.write(async () => {
    const usersCollection = testDb.collections.get('users');
    await usersCollection.create((newUser) => {
      newUser.email = MockTestUsers.existingUserDetails.email;
      newUser.password = MockTestUsers.existingUserDetails.password;
      newUser.username = MockTestUsers.existingUserDetails.username;
      newUser.firstName = MockTestUsers.existingUserDetails.firstName;
      newUser.lastName = MockTestUsers.existingUserDetails.lastName;
    });
  });
});

afterAll(async () => {
  await testDb.write(async () => {
    await testDb.unsafeResetDatabase();
  });
});

describe('checkExistingUser', () => {
  it('should return null if no user found', async () => {
    const existingUser = await helpers.checkExistingUser({
      username: MockTestUsers.unfoundUserDetails.username,
      email: MockTestUsers.unfoundUserDetails.email,
      watermelonDatabase: testDb,
    });
    expect(existingUser).toBeUndefined();
  });

  it('should return user if user found by username', async () => {
    const existingUser = await helpers.checkExistingUser({
      username: MockTestUsers.existingUserDetails.username,
      email: MockTestUsers.existingUserDetails.email,
      watermelonDatabase: testDb,
    });
    expect(existingUser).not.toBeUndefined();
    expect(existingUser?.username).toBe(existingUser.username);
  });

  it('should return user if user found by email', async () => {
    const existingUser = await helpers.checkExistingUser({
      username: MockTestUsers.existingUserDetails.username,
      email: MockTestUsers.existingUserDetails.email,
      watermelonDatabase: testDb,
    });
    expect(existingUser).not.toBeUndefined();
    expect(existingUser?.email).toBe(existingUser.email);
  });
});

describe('createNewUser', () => {
  it('should create a new user and return user details', async () => {
    const setUserMock = jest.fn();
    const setErrorMock = jest.fn();
    const trailStartedAt = formatDateTime(new Date());
    const createdUser = await helpers.createNewUser({
      ...newUserDetails,
      watermelonDatabase: testDb,
      setUser: setUserMock,
      setError: setErrorMock,
    });

    expect(createdUser).not.toBeUndefined();
    expect(createdUser?.firstName).toBe(newUserDetails.firstName);
    expect(createdUser?.lastName).toBe(newUserDetails.lastName);
    expect(createdUser?.email).toBe(newUserDetails.email);
    expect(createdUser?.username).toBe(newUserDetails.username);
    expect(createdUser?.pushNotificationsEnabled).toBeTruthy();
    expect(createdUser?.themePreference).toBe('light');
    expect(createdUser?.trailId).toBe('1');
    expect(createdUser?.trailProgress).toBe('0.0');
    expect(createdUser?.trailStartedAt).toBe(trailStartedAt);

    // Assert that setUser and setError were called with the correct arguments
    expect(setUserMock).toHaveBeenCalledWith(createdUser);
    expect(setErrorMock).not.toHaveBeenCalled();
  });
});
describe('handleRegister', () => {
  it('should not create a new user if user already exists with the same email', async () => {
    const setUserMock = jest.fn();
    const setErrorMock = jest.fn();

    await helpers.handleRegister({
      ...MockTestUsers.existingUserDetails,
      watermelonDatabase: testDb,
      setUser: setUserMock,
      setError: setErrorMock,
    });

    // Assert that setUser was not called and setError was called with the correct error message
    expect(setUserMock).not.toHaveBeenCalled();
    expect(setErrorMock).toHaveBeenCalledWith(
      'User Already Exists With Provided Email, Please Login'
    );
  });

  it('should not create a new user if user already exists with the same username', async () => {
    const setUserMock = jest.fn();
    const setErrorMock = jest.fn();

    await helpers.handleRegister({
      ...MockTestUsers.existingUserDetails,
      email: 'newemail@example.com', // Change email to avoid duplicate
      watermelonDatabase: testDb,
      setUser: setUserMock,
      setError: setErrorMock,
    });

    // Assert that setUser was not called and setError was called with the correct error message
    expect(setUserMock).not.toHaveBeenCalled();
    expect(setErrorMock).toHaveBeenCalledWith(
      'User Already Exists With Username, Please Choose New Username'
    );
  });
});
