// __mocks__/UserModel.ts
import { jest } from "@jest/globals";

import { Database } from "@nozbe/watermelondb";

import { User, User_Session } from "../watermelon/models";
import { SessionSnapshot } from "../sessionEngine/sessionEngine";
import { Rewards } from "../services/RewardService";

export function createMockUserBase(overrides?: Partial<User>): User {
  const baseUser = {
    id: "123",
    // Basic fields so your code can read them
    username: "mockusername",
    email: "mockemail@example.com",
    // ... any other fields used in your code

    password: "mockPassword",
    dailyStreak: 0,
    trailProgress: "0.0",
    trailId: "1",
    trailStartedAt: new Date(),
    totalMiles: "0.00",
    pushNotificationsEnabled: true,
    themePreference: "light",
    trailTokens: 50,
    lastDailyStreakDate: new Date().toISOString(),
    prestigeLevel: 0,
    roomId: "",

    // ... any other fields used in your code

    // Writer methods
    addUserSubscription: jest.fn(async () => ({ id: "sub_123", is_active: false })),
    purchaseTrail: jest.fn(async (trail, cost) => true),
    startNewSession: jest.fn(async sessionDetails => ({ newSession: {}, status: true })),
    // ... any other writer methods
    increaseDistanceHikedWriter: jest.fn(async ({ user, userSession, snapshot }) =>
      Promise.resolve(),
    ),
    assignNewTrail: jest.fn(async ({ completedTrailId, isProMember }) => Promise.resolve(3.5)),
    markTrailCompleted: jest.fn(async ({ trailId, isProMember, trailStartedAt }) =>
      Promise.resolve(),
    ),
    finalizeSessionWithRewardsWriter: jest.fn(async ({ user, snapshot, rewards }) =>
      Promise.resolve(),
    ),
    // Optionally, if you have read-only queries as well
    getUser: jest.fn(async () => ({})),

    // etc.
  };

  // Merge overrides to allow test-specific customization
  return {
    ...baseUser,
    ...overrides,
  } as User;
}

export async function createUser(database: Database, newUser: any) {
  const user = await database.write(async () => {
    const user = await database.get<User>("users").create(user => {
      user.username = newUser.username;
      user.email = newUser.email;
      user.password = newUser.password;
      user.pushNotificationsEnabled = true;
      user.themePreference = "light";
      user.trailId = newUser.trailId || "1";
      user.dailyStreak = newUser.dailyStreak || 0;
      user.lastDailyStreakDate = newUser.lastDailyStreakDate || new Date().toISOString();
      user.trailProgress = newUser.trailProgress || "0.00";
      user.traiStartedAt = newUser.trailStartedAt;
      user.trailTokens = newUser.trailTokens || 50;
      user.totalMiles = newUser.totalMiles || "0.00";
      user.prestigeLevel = newUser.prestigeLevel || 0;
      user.roomId = newUser.roomId || "";
    });

    return user;
  });

  return user;
}
