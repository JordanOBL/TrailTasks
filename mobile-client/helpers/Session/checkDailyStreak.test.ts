import { User, User_Session } from '../../watermelon/models';
import {createMockUserBase, createUser} from '../../__mocks__/UserModel';
import test, { describe } from 'node:test';

import checkDailyStreak from './checkDailyStreak';
import isToday from '../isToday';
import isYesterday from '../isYesterday';
import {sync} from '../../watermelon/sync';
import {testDb} from '../../watermelon/testDB';

describe('checkDailyStreak', () => {
  let testUser: User;

  beforeAll(async () => {
    await testDb.write(async () => {
      await testDb.unsafeResetDatabase();
    });

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const mockUser = createMockUserBase({
      lastDailyStreakDate: yesterday.toISOString(),
      dailyStreak: 2,
    });

    testUser = await createUser(testDb, mockUser);

    const today = new Date();
    today.setHours(12, 0, 0, 0);
    await testDb.write(async () => {
      await testDb.collections.get<User_Session>('users_sessions').create((session) => {
        session._id = '1';
        session.userId = testUser.id;
        session.sessionCategoryId = '1';
        session.sessionName = 'Session 1';
        session.sessionDescription = 'Session 1 description';
        session.totalSessionTime = 350; // meets threshold
        session.totalDistanceHiked = '10.00';
        session.dateAdded = today.toISOString();
      });
    });
  });

  test('increments daily streak if session is completed today and lastDailyStreakDate is yesterday', async () => {
    const didUpdate = await checkDailyStreak(testUser);
    expect(didUpdate).toBe(true); // because streak should increase
    expect(testUser.dailyStreak).toBe(3); // 2 + 1
  });
  test('resets daily streak if last checked is greater than 24 hours ago', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 2);
    yesterday.setHours(12, 0, 0, 0);
    const mockUser = createMockUserBase({
      lastDailyStreakDate: yesterday.toISOString(),
      dailyStreak: 2,
    });
    testUser = await createUser(testDb, mockUser);
    const didUpdate = await checkDailyStreak(testUser);
    expect(didUpdate).toBe(true); // because streak should increase
    expect(testUser.dailyStreak).toBe(0); // 1
  })
});

