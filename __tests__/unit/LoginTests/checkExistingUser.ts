/* import '../../watermelonMock'
import { handleLogin } from '../../../helpers/loginHelpers'

const username = 'testUser'
const password = 'testPassword'
const email = 'testEmail@gmail.com'
const firstName = 'testFirst'
 const LastName = 'testLast'


describe('tests login functions', test('should return error "invalid email or password"', () =>
{
  const existingUser = await checkExistingUser()
}))
 */
import { setGenerator } from '@nozbe/watermelondb/utils/common/randomId';
import { v4 as uuidv4 } from 'uuid';

setGenerator(uuidv4);

jest.mock('@nozbe/watermelondb/utils/common/randomId/randomId', () => {});
import { Database } from '@nozbe/watermelondb';
import { checkExistingUser } from '../../../helpers/loginHelpers'
// Replace './yourFile' with the correct path to your file

// Mock WatermelonDB Database
const mockDatabase: Database = {
  get: jest.fn(),
  collections: {
    get: jest.fn(() => ({
      query: jest.fn(() => ({
        fetch: jest.fn(() => [{ id: 'user_id' }]) // Mocking a user record
      }))
    }))
  },
  localStorage: {
    get: jest.fn(),
    set: jest.fn()
  }
} as any;

describe('User Registration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Check if user is registered', async () => {
    // Mocking an existing user
    mockDatabase.get.mockReturnValueOnce({
      query: jest.fn(() => ({
        fetch: jest.fn(() => [{ id: 'user_id' }]) // Mocking a user record
      }))
    });

    // Call the function to check if the user is registered
    const existingUser = await checkExistingUser('test@example.com', 'password', mockDatabase);

    // Assert that the function correctly fetches the user from the database
    expect(existingUser).toEqual({ id: 'user_id' });

  
  });
});
