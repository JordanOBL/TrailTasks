// __tests__/loginHelpers.test.ts
import { checkExistingUser, checkExistingGlobalUser, handleLogin } from '../loginHelpers'

// We can mock the database and the fetch calls
const mockDatabase: any = {
  get: jest.fn().mockReturnThis(),
  query: jest.fn().mockReturnThis(),
  fetch: jest.fn(),
  localStorage: {
    set: jest.fn(),
    get: jest.fn(),
  },
  write: jest.fn((cb) => cb()),  // Let's assume it runs the callback
  batch: jest.fn(),
  collections: {
    get: jest.fn().mockReturnThis(),
    query: jest.fn().mockReturnThis(),
  },
}

// Mock `fetch` globally in test
global.fetch = jest.fn()

describe('loginHelpers tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('checkExistingUser returns user if found in local DB', async () => {
    // Arrange
    const fakeUser = { id: '123', email: 'test@example.com', password: 'abc123' }
    mockDatabase.fetch.mockResolvedValue([fakeUser])

    // Act
    const result = await checkExistingUser('test@example.com', 'abc123', mockDatabase)

    // Assert
    expect(mockDatabase.get).toHaveBeenCalledWith('users')
    expect(mockDatabase.query).toHaveBeenCalledTimes(1)
    expect(mockDatabase.fetch).toHaveBeenCalledTimes(1)
    expect(result).toEqual(fakeUser)
  })

  test('checkExistingUser returns undefined if no user found', async () => {
    mockDatabase.fetch.mockResolvedValue([])

    const result = await checkExistingUser('not_found@example.com', 'abc123', mockDatabase)

    expect(result).toBeUndefined()
  })

  test('checkExistingGlobalUser returns user if fetch OK', async () => {
    // Mock fetch
    const fakeUser = { id: '123', email: 'global@test.com' }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => fakeUser,
    })

    const result = await checkExistingGlobalUser('global@test.com', 'abc123')

    expect(result).toEqual(fakeUser)
  })

  test('checkExistingGlobalUser returns null if 404', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 404,
      ok: false,
    })
    const result = await checkExistingGlobalUser('notfound@test.com', 'abc123')
    expect(result).toBeNull()
  })

  test('handleLogin sets error if email/password empty', async () => {
    const setError = jest.fn()
    const setUser = jest.fn()

    await handleLogin({
      email: '',
      password: '',
      setUser,
      setError,
      watermelonDatabase: mockDatabase,
    })

    expect(setError).toHaveBeenCalledWith('All fields are required')
    expect(setUser).not.toHaveBeenCalled()
  })

  // ... More tests for handleLogin logic
})

