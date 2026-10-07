import {Addon, Token_Transaction, Trail, User, User_Purchased_Trail, User_Session} from '../models';
import {testDb} from '../testDB';

async function createUserWithSessions(sessionDistances: number[]) {
  return await testDb.write(async () => {
    await testDb.unsafeResetDatabase();

    const user = await testDb.get<User>('users').create(record => {
      record.username = 'derivedmiles';
      record.email = 'derivedmiles@example.com';
      record.password = 'password';
      record.pushNotificationsEnabled = true;
      record.themePreference = 'light';
      record.trailId = '1';
      record.dailyStreak = 0;
      record.lastDailyStreakDate = new Date().toISOString();
      record.trailProgress = '0.00';
      record.trailStartedAt = new Date().toISOString();
      record.prestigeLevel = 0;
      record.roomId = '';
    });

    for (const distance of sessionDistances) {
      await testDb.get<User_Session>('users_sessions').create(session => {
        session.userId = user.id;
        session.sessionName = 'Focus hike';
        session.sessionDescription = '';
        session.sessionCategoryId = '1';
        session.dateAdded = new Date().toISOString();
        session.totalSessionTime = 900;
        session.totalDistanceHiked = distance;
      });
    }

    return user;
  });
}

describe('User derived totals', () => {
  it('calculates total miles from this user sessions without a user mileage field', async () => {
    const user = await createUserWithSessions([1.235, 2.345]);

    await expect(user.calculateTotalMiles()).resolves.toBe(3.58);
  });

  it('returns zero miles when the user has no sessions', async () => {
    const user = await createUserWithSessions([]);

    await expect(user.calculateTotalMiles()).resolves.toBe(0);
  });

  it('updates session distance by changing the session fact only', async () => {
    const user = await createUserWithSessions([0]);
    const [session] = await user.usersSessions.fetch();

    const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    try {
      await user.increaseDistanceHikedWriter({
        user,
        userSession: session,
        snapshot: {totalElapseSec: 60},
      });
    } finally {
      consoleLog.mockRestore();
    }

    expect(session.totalDistanceHiked).toBe(0.01);
    await expect(user.calculateTotalMiles()).resolves.toBe(0.01);
  });

  it('uses derived miles when checking add-on mileage requirements', async () => {
    const user = await createUserWithSessions([]);

    const addon = await testDb.write(async () => {
      return await testDb.get<Addon>('addons').create(record => {
        record.name = 'Hiking Poles II';
        record.description = 'Requires earned miles';
        record.level = 2;
        record.effectType = 'pace_increase_interval';
        record.effectValue = 600;
        record.requiredTotalMiles = 10;
        record.price = 10;
        record.imageUrl = '';
      });
    });

    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await expect(user.buyAddon(addon)).rejects.toThrow(
        `You must have at least ${addon.requiredTotalMiles} miles to purchase ${addon.name}`,
      );
    } finally {
      consoleError.mockRestore();
    }
  });

  it('does not include sessions that belong to another user', async () => {
    const user = await createUserWithSessions([1.25]);

    await testDb.write(async () => {
      const otherUser = await testDb.get<User>('users').create(record => {
        record.username = 'other';
        record.email = 'other@example.com';
        record.password = 'password';
        record.pushNotificationsEnabled = true;
        record.themePreference = 'light';
        record.trailId = '1';
        record.dailyStreak = 0;
        record.lastDailyStreakDate = new Date().toISOString();
        record.trailProgress = '0.00';
        record.trailStartedAt = new Date().toISOString();
        record.prestigeLevel = 0;
        record.roomId = '';
      });

      await testDb.get<User_Session>('users_sessions').create(session => {
        session.userId = otherUser.id;
        session.sessionName = 'Other hike';
        session.sessionDescription = '';
        session.sessionCategoryId = '1';
        session.dateAdded = new Date().toISOString();
        session.totalSessionTime = 900;
        session.totalDistanceHiked = 10;
      });
    });

    await expect(user.calculateTotalMiles()).resolves.toBe(1.25);

    const allSessions = await testDb.get('users_sessions').query().fetch();
    expect(allSessions).toHaveLength(2);
  });

  it('derives token balance from immutable token transaction rows', async () => {
    const user = await createUserWithSessions([]);

    await testDb.write(async () => {
      await testDb.get<Token_Transaction>('token_transactions').create(transaction => {
        transaction.userId = user.id;
        transaction.amount = 50;
        transaction.type = 'registration_bonus';
        transaction.sourceType = 'user';
        transaction.sourceId = user.id;
        transaction.idempotencyKey = `registration_bonus:${user.id}`;
        transaction.ruleVersion = 'mvp-v1';
        transaction.metadata = '{}';
      });
      await testDb.get<Token_Transaction>('token_transactions').create(transaction => {
        transaction.userId = user.id;
        transaction.amount = -10;
        transaction.type = 'addon_purchase';
        transaction.sourceType = 'addon';
        transaction.sourceId = 'addon-1';
        transaction.idempotencyKey = `addon_purchase:${user.id}:addon-1:test`;
        transaction.ruleVersion = 'mvp-v1';
        transaction.metadata = '{}';
      });
    });

    await expect(user.calculateTrailTokenBalance()).resolves.toBe(40);
  });

  it('writes add-on purchases as negative token transactions instead of mutating user balance', async () => {
    const user = await createUserWithSessions([10]);

    const addon = await testDb.write(async () => {
      await testDb.get<Token_Transaction>('token_transactions').create(transaction => {
        transaction.userId = user.id;
        transaction.amount = 50;
        transaction.type = 'registration_bonus';
        transaction.sourceType = 'user';
        transaction.sourceId = user.id;
        transaction.idempotencyKey = `registration_bonus:${user.id}`;
        transaction.ruleVersion = 'mvp-v1';
        transaction.metadata = '{}';
      });

      return await testDb.get<Addon>('addons').create(record => {
        record.name = 'Trail Mix I';
        record.description = 'Adds a token ledger purchase.';
        record.level = 1;
        record.effectType = 'token_bonus_flat';
        record.effectValue = 5;
        record.requiredTotalMiles = 1;
        record.price = 10;
        record.imageUrl = '';
      });
    });

    await expect(user.buyAddon(addon)).resolves.toBe(`You purchased ${addon.name}`);
    await expect(user.calculateTrailTokenBalance()).resolves.toBe(40);

    const transactions = await testDb.get<Token_Transaction>('token_transactions').query().fetch();
    expect(transactions.map(t => ({ amount: t.amount, type: t.type, sourceId: t.sourceId }))).toEqual(
      expect.arrayContaining([{ amount: -10, type: 'addon_purchase', sourceId: addon.id }]),
    );
  });

  it('writes trail unlocks as negative token transactions', async () => {
    const user = await createUserWithSessions([]);

    const trail = await testDb.write(async () => {
      await testDb.get<Token_Transaction>('token_transactions').create(transaction => {
        transaction.userId = user.id;
        transaction.amount = 50;
        transaction.type = 'registration_bonus';
        transaction.sourceType = 'user';
        transaction.sourceId = user.id;
        transaction.idempotencyKey = `registration_bonus:${user.id}`;
        transaction.ruleVersion = 'mvp-v1';
        transaction.metadata = '{}';
      });

      return await testDb.get<Trail>('trails').create(record => {
        record.trailName = 'Ledger Trail';
        record.trailDistance = '4';
        record.trailLat = '0';
        record.trailLong = '0';
        record.trailDifficulty = 'Easy';
        record.parkId = 'park-1';
        record.trailImageUrl = '';
        record.isFree = false;
        record.isProOnly = false;
        record.trailOfTheWeek = false;
      });
    });

    await expect(user.purchaseTrail(trail, 5)).resolves.toBe(true);
    await expect(user.calculateTrailTokenBalance()).resolves.toBe(45);

    const purchased = await testDb.get<User_Purchased_Trail>('users_purchased_trails').query().fetch();
    expect(purchased).toHaveLength(1);
    const transactions = await testDb.get<Token_Transaction>('token_transactions').query().fetch();
    expect(transactions.map(t => ({ amount: t.amount, type: t.type, sourceId: t.sourceId }))).toEqual(
      expect.arrayContaining([{ amount: -5, type: 'trail_unlock', sourceId: trail.id }]),
    );
  });
});
