// __mocks__/UserModel.ts

export function createMockUserBase(overrides?: Partial<User>) {
  const baseUser = {
    id: '123',
    // Basic fields so your code can read them
    username: 'mockUserName',
    email: 'mockEmail@example.com',
    // ... any other fields used in your code
    firstName: 'mockFirstName',
    lastName: 'mockLastName',
    password: 'mockPassword',
    dailyStreak: 0,
    trailProgress: '0.0',
    trailId: '1',
    trailStartedAt: new Date(),
    totalMiles: '0.00',
    pushNotificationsEnabled: true,
    themePreference: 'light',
    trailTokens: 50,
    lastDailyStreakDate: new Date(),
    isSubscribed: false,
    prestigeLevel: 0,
    
    // ... any other fields used in your code

    // Writer methods
    addUserSubscription: jest.fn(async () => ({ id: 'sub_123', is_active: false })),
    purchaseTrail: jest.fn(async (trail, cost) => true),
    startNewSession: jest.fn(async (sessionDetails) => ({ newSession: {}, status: true })),
    // ... any other writer methods

    // Optionally, if you have read-only queries as well
    getUser: jest.fn(async () => ({})),

    // etc.
  }

  // Merge overrides to allow test-specific customization
  return {
    ...baseUser,
    ...overrides,
  }
}

