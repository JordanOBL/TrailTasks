import {User, User_Session} from '../models';
import {testDb} from '../testDB';

const fixedToday = new Date('2026-04-15T12:00:00.000Z');
const yesterday = new Date('2026-04-14T12:00:00.000Z');
const twoDaysAgo = new Date('2026-04-13T12:00:00.000Z');

function sessionSnapshot(session: User_Session, totalElapsedSec = 300) {
  return {
    sessionId: session.id,
    userId: session.userId,
    sessionName: session.sessionName,
    sessionCategory: [session.sessionCategoryId, 'Focus'],
    phase: 'COMPLETED',
    totalElapsedSec,
    elapsedInPhaseSec: totalElapsedSec,
    distanceNeeded: 1,
    currentSet: 1,
    completedSets: 1,
    totalSets: 1,
    currentPaceMph: 3,
    totalDistanceMiles: 0.1,
    focusTimeSec: 300,
    shortBreakSec: 300,
    longBreakSec: 900,
    autoContinue: false,
    completedTrails: [],
    totalStrikes: 0,
    isPaused: false,
    tokenBonusFlat: 0,
    tokenBonusPercent: 0,
    startedAt: fixedToday.toISOString(),
    consecutiveSecWithoutStrikes: totalElapsedSec,
    extraSets: 0,
  };
}

async function createUserAndSession({
  dailyStreak = 0,
  lastDailyStreakDate = fixedToday,
  trailTokens = 50,
  existingTodaySessionSeconds = [],
}: {
  dailyStreak?: number;
  lastDailyStreakDate?: Date;
  trailTokens?: number;
  existingTodaySessionSeconds?: number[];
} = {}) {
  return await testDb.write(async () => {
    await testDb.unsafeResetDatabase();

    const user = await testDb.get<User>('users').create(record => {
      record.username = 'streak-user';
      record.email = 'streak@example.com';
      record.password = 'password';
      record.pushNotificationsEnabled = true;
      record.themePreference = 'light';
      record.trailId = '1';
      record.dailyStreak = dailyStreak;
      record.lastDailyStreakDate = lastDailyStreakDate.toISOString();
      record.trailProgress = '0.00';
      record.trailStartedAt = fixedToday.toISOString();
      record.trailTokens = trailTokens;
      record.totalMiles = '0.00';
      record.prestigeLevel = 0;
      record.roomId = '';
    });

    for (let index = 0; index < existingTodaySessionSeconds.length; index += 1) {
      const seconds = existingTodaySessionSeconds[index];
      await testDb.get<User_Session>('users_sessions').create(session => {
        session.userId = user.id;
        session.sessionName = `Existing ${index}`;
        session.sessionDescription = '';
        session.sessionCategoryId = '1';
        session.dateAdded = fixedToday.toISOString();
        session.totalSessionTime = seconds;
        session.totalDistanceHiked = 0;
      });
    }

    const session = await testDb.get<User_Session>('users_sessions').create(record => {
      record.userId = user.id;
      record.sessionName = 'Today qualifying session';
      record.sessionDescription = '';
      record.sessionCategoryId = '1';
      record.dateAdded = fixedToday.toISOString();
      record.totalSessionTime = 0;
      record.totalDistanceHiked = 0;
    });

    return {user, session};
  });
}

async function finalize(user: User, session: User_Session, totalElapsedSec = 300) {
  await user.finalizeSessionWithRewardsWriter({
    user,
    snapshot: sessionSnapshot(session, totalElapsedSec),
    rewards: {
      trailRewards: 0,
      timeRewards: 5,
      totalTokenRewards: 5,
      wildXpRewards: 0,
    },
  });
}

describe('User daily streak accounting', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(fixedToday);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts a new user daily streak on the first qualifying completed session', async () => {
    const {user, session} = await createUserAndSession({
      dailyStreak: 0,
      lastDailyStreakDate: fixedToday,
      trailTokens: 50,
    });

    await finalize(user, session, 300);

    expect(user.dailyStreak).toBe(1);
    expect(user.trailTokens).toBe(70);
    expect(user.lastDailyStreakDate.toISOString()).toBe(fixedToday.toISOString());
  });

  it('does not double-increment when a user already received today streak credit', async () => {
    const {user, session} = await createUserAndSession({
      dailyStreak: 1,
      lastDailyStreakDate: fixedToday,
      trailTokens: 70,
    });

    await finalize(user, session, 300);

    expect(user.dailyStreak).toBe(1);
    expect(user.trailTokens).toBe(75);
  });

  it('increments a continued streak after a qualifying session on the next day', async () => {
    const {user, session} = await createUserAndSession({
      dailyStreak: 2,
      lastDailyStreakDate: yesterday,
      trailTokens: 80,
    });

    await finalize(user, session, 300);

    expect(user.dailyStreak).toBe(3);
    expect(user.trailTokens).toBe(100);
  });

  it('resets a missed streak to one after a new qualifying completed session', async () => {
    const {user, session} = await createUserAndSession({
      dailyStreak: 4,
      lastDailyStreakDate: twoDaysAgo,
      trailTokens: 100,
    });

    await finalize(user, session, 300);

    expect(user.dailyStreak).toBe(1);
    expect(user.trailTokens).toBe(120);
  });

  it('uses today session facts before awarding daily streak credit', async () => {
    const {user, session} = await createUserAndSession({
      dailyStreak: 0,
      lastDailyStreakDate: fixedToday,
      trailTokens: 50,
      existingTodaySessionSeconds: [200],
    });

    await finalize(user, session, 99);

    expect(user.dailyStreak).toBe(0);
    expect(user.trailTokens).toBe(55);
  });
});
