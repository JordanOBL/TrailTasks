import {createMockUserBase} from '../../__mocks__/UserModel'
import {createMockDatabase} from '../../__mocks__/Database'
import {createNewUser} from '../registerHelpers'

test('createNewUser calls addUserSubscription', async () => {
  const setUser = jest.fn()
  const setError = jest.fn()

  // 0) Prepare a mock database
  const mockDatabase = createMockDatabase()

  // 1) Prepare a custom mock user
  const mockUser = createMockUserBase({
    id: 'abc',
    username: 'testUser',
    // Optionally override any method you need
    addUserSubscription: jest.fn(async () => {
      return { id: 'sub_999', is_active: true }
    }),
  })

  // 2) Mock the DB "write" method so it returns our custom user
  mockDatabase.write.mockImplementationOnce(async () => {
    return mockUser
  })

  // 3) Run createNewUser with test parameters
  const result = await createNewUser({
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'secret',
    username: 'testUser',
    setUser,
    setError,
    watermelonDatabase: mockDatabase,
  })

  // 4) Assertions
  // Check that the user object returned by "createNewUser" has the correct ID
  expect(result.id).toBe('abc')

  // Confirm that "addUserSubscription" was indeed called
  expect(mockUser.addUserSubscription).toHaveBeenCalledTimes(1)

  // (Optional) Verify "write" got called once
  expect(mockDatabase.write).toHaveBeenCalledTimes(1)

  // If you want to confirm local storage or setUser got called, add more checks here:
  // expect(mockDatabase.localStorage.set).toHaveBeenCalledWith('user_id', 'abc')
  // expect(setUser).toHaveBeenCalledWith(mockUser)
})

