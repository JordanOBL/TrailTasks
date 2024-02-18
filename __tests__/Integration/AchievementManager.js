/* eslint-disable prettier/prettier */
import {testDb} from '../../watermelon/mockDB'; // Import the test database instance
import {MockTestUsers} from '../mockTestUsers.js';
import {setGenerator} from '@nozbe/watermelondb/utils/common/randomId';
import {v4 as uuidv4} from 'uuid';
import {Q} from '@nozbe/watermelondb';
import {AchievementManager} from '../../helpers/Achievements/AchievementManager';
setGenerator(uuidv4);

jest.mock('@nozbe/watermelondb/utils/common/randomId/randomId', () => {});


const testAchievements = [
  {
    id: '1',
    achievement_name: 'Hiker Extraordinaire',
    achievement_description: 'Hiked 50 miles',
    achievement_image_url: 'https://example.com/achievement1.png',
    achievement_type: 'Total Miles',
    achievement_condition: '50',
  },
  {
    id: '2',
    achievement_name: 'Hiker Novice',
    achievement_description: 'Hiked 20 miles',
    achievement_image_url: 'https://example.com/achievement2.png',
    achievement_type: 'Total Miles',
    achievement_condition: '20',
  },
  {
    id: '3',
    achievement_name: 'First of Many',
    achievement_description: 'First 1.0 Miles',
    achievement_image_url: 'https://example.com/achievement2.png',
    achievement_type: 'Total Miles',
    achievement_condition: '1',
  },
  {
    id: '4',
    achievement_name: 'Anti TLC',
    achievement_description: 'Complete a trial with a waterfall',
    achievement_image_url: 'https://example.com/achievement2.png',
    achievement_type: 'Trail Completion',
    achievement_condition: '42, 44, 63, 69, 78, 79, 94',
  },
  {
    id: '5',
    achievement_name: 'Hop Skip Jump',
    achievement_description: 'Hike Yellowstone and Grand Teton National Park',
    achievement_image_url: 'https://example.com/achievement2.png',
    achievement_type: 'Trail Completion',
    achievement_condition: '25, 61',
    achievement_fact:
      'Yellowstone and Gand Teton National Parks are at one point only 10 miles Apart',
  },
];
//create existing user before each test
beforeEach(async () => {
  await testDb.write(async () => {
    await testDb.collections.get('users').create((user) => {
      user.username = MockTestUsers.existingUserDetails.username;
      user.firstName = MockTestUsers.existingUserDetails.firstName;
      user.lastName = MockTestUsers.existingUserDetails.lastName;
      user.email = MockTestUsers.existingUserDetails.email;
      user.password = MockTestUsers.existingUserDetails.password;
      user.pushNotificationsEnabled =
        MockTestUsers.existingUserDetails.pushNotificationsEnabled;
      user.themePreference = MockTestUsers.existingUserDetails.themePreference;
      user.trailId = MockTestUsers.existingUserDetails.trailId;
      user.trailProgress = MockTestUsers.existingUserDetails.trailProgress;
      user.trailStartedAt = MockTestUsers.existingUserDetails.trailStartedAt;
    });
  });
});
//create user_miles with existing user before each
beforeEach(async () => {
  await testDb.write(async () => {
    const user = await testDb.collections.get('users').query().fetch();
    await testDb.collections.get('users_miles').create((user_mile) => {
      user_mile.userId = user[0].id;
      user_mile.totalMiles = '0.0';
    });
  });
});
//add terst achievements into database before each
beforeEach(async () => {
  await testDb.write(async () => {
    const Achievements = await Promise.all(
      testAchievements.map(async (achievement) => {
        const createdAchievement = testDb.collections
          .get('achievements')
          .prepareCreate((newAchievement) => {
            newAchievement.achievement_name = achievement.achievement_name;
            newAchievement.achievement_description =
              achievement.achievement_description;
            newAchievement.achievement_image_url =
              achievement.achievement_image_url;
            newAchievement.achievement_type = achievement.achievement_type;
            newAchievement.achievement_condition =
              achievement.achievement_condition;
            newAchievement.achievement_fact =
              achievement.achievement_fact || '';
          });
        return createdAchievement;
      })
    );
    await testDb.batch(...Achievements);
  });
});
//delete database after all describes and tests are ran
afterAll(async () => {
  await testDb.write(async () => {
    await testDb.unsafeResetDatabase();
  });
});

describe('unlockAchievements()', () => {
  
  afterEach(async () => {
    await testDb.write(async () => {
      await testDb.unsafeResetDatabase();
    });
  });
  test('it returns achievement with ID of achievements completed', async () => {
  
      const user = await testDb.collections.get('users').query().fetch();

    const completedAchievements = ['1', '2'];
    const unlockedAchievements = await AchievementManager.unlockAchievement(
      user[0],
      completedAchievements
    );
    expect(
      unlockedAchievements.map((achievement) => achievement.achievementId)
    ).toEqual(['1', '2']);
  });
});

describe('check_total_miles_achievements()', () => {
  afterEach(async () => {
    await testDb.write(async () => {
      await testDb.unsafeResetDatabase();
    });
  });
  test('it unlocks achievement when userMiles > 1.0', async () => {
    //change userrs miles to pass achievment 3
    await testDb.write(async () => {
      const userMiles = await testDb.collections
        .get('users_miles')
        .query()
        .fetch();
      await userMiles[0].update((user_mile) => {
        user_mile.totalMiles = '1.0';
      });
    });
    const achievementsWithCompletions = testAchievements.map((achievement) => ({
      ...achievement,
      completed: 0,
    }));

    const user = await testDb.collections.get('users').query().fetch();

    const userMiles = await user[0].usersMiles;
    const results = await AchievementManager.check_total_miles_achievements(
      user[0],
      userMiles[0],
      achievementsWithCompletions
    );
    const testedAchievement = testAchievements.filter(
      (item) => item.id == results[0].achievementId
    );

    expect(results[0].achievementId).toBe('3');
    expect(testedAchievement[0].achievement_name).toEqual('First of Many');
    expect(parseInt(userMiles[0].totalMiles, 10)).toBeGreaterThanOrEqual(
      parseInt(testedAchievement[0].achievement_condition, 10)
    );
  });

  test('it unlocks achievement when userMiles >= 20.0', async () => {
    //change userrs miles to pass achievment 3
    await testDb.write(async () => {
      const userMiles = await testDb.collections
        .get('users_miles')
        .query()
        .fetch();
      await userMiles[0].update((user_mile) => {
        user_mile.totalMiles = '20.0';
      });
    });
    const achievementsWithCompletions = testAchievements.map((achievement) => {
      return {
        ...achievement,
        completed: 0,
      };
    });

    const user = await testDb.collections.get('users').query().fetch();

    const userMiles = await user[0].usersMiles;
    const results = await AchievementManager.check_total_miles_achievements(
      user[0],
      userMiles[0],
      achievementsWithCompletions
    );
    const usersAchievements = await user[0].usersAchievements;
   ;
    const testedAchievement = testAchievements.filter(
      (item) => item.id == results[0].achievementId
    );

    expect(results[0].achievementId).toBe('2');
    expect(testedAchievement[0].achievement_name).toEqual('Hiker Novice');
    expect(parseInt(userMiles[0].totalMiles, 10)).toBeGreaterThanOrEqual(
      parseInt(testedAchievement[0].achievement_condition, 10)
    );
    expect(usersAchievements).toHaveLength(2);
  });
});
