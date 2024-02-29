import {AchievementManager} from '../../helpers/Achievements/AchievementManager';
import {MockTestUsers} from '../mockTestUsers.js';
import {Q} from '@nozbe/watermelondb';
import {achievementsWithIds} from '../../assets/Achievements/addAchievementIds.js';
import {achievements as masterAchievements} from '../../assets/Achievements/masterAchievementList';
import {setGenerator} from '@nozbe/watermelondb/utils/common/randomId';
/* eslint-disable prettier/prettier */
import {testDb} from '../../watermelon/testDB'; // Import the test database instance
import {v4 as uuidv4} from 'uuid';
setGenerator(uuidv4);

jest.mock('@nozbe/watermelondb/utils/common/randomId/randomId', () => {});

const newAchievements = achievementsWithIds(masterAchievements);

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
      newAchievements.map(async (achievement) => {
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
  test('it returns achievement with array of objects of achievements completed', async () => {
    const user = await testDb.collections.get('users').query().fetch();

    const completedAchievements = [
      {achievementName: 'First Steps', achievementId: '93'},
    ];
    const unlockedAchievements = await AchievementManager.unlockAchievement(
      user[0],
      completedAchievements
    );
    expect(unlockedAchievements).toEqual(completedAchievements);
  });
});

describe('checkTotalMilesAchievements() for each total miles achievement', () => {
  afterAll(async () => {
    await testDb.write(async () => {
      await testDb.unsafeResetDatabase();
    });
  });
  test('it unlocks 007 achievement when userMiles >= 0.07', async () => {
    //change userrs miles to pass achievment 3
    await testDb.write(async () => {
      const userMiles = await testDb.collections
        .get('users_miles')
        .query()
        .fetch();
      await userMiles[0].update((user_mile) => {
        user_mile.totalMiles = '0.07';
      });
    });
    const achievementsWithCompletions = newAchievements.map((achievement) => ({
      ...achievement,
      completed: 0,
    }));

    const user = await testDb.collections.get('users').query().fetch();

    const userMiles = await user[0].usersMiles;
    const results = await AchievementManager.checkTotalMilesAchievements(
      user[0],
      userMiles[0],
      achievementsWithCompletions
    );
    const testedAchievement = newAchievements.filter(
      (item) => item.id == results[0].achievementId
    );

    expect(results).toStrictEqual([
      {achievementName: '007', achievementId: '94'},
    ]);
    expect(parseFloat(userMiles[0].totalMiles)).toBeGreaterThanOrEqual(
      parseFloat(testedAchievement[0].achievement_condition)
    );
  });

  test('it unlocks National PieDay achievement when user miles >= 3.14', async () => {
    //change userrs miles to pass achievment 3
    await testDb.write(async () => {
      const userMiles = await testDb.collections
        .get('users_miles')
        .query()
        .fetch();
      await userMiles[0].update((user_mile) => {
        user_mile.totalMiles = '3.14';
      });
    });
    const achievementsWithCompletions = newAchievements.map((achievement) => {
      return {
        ...achievement,
        completed: 0,
      };
    });

    const user = await testDb.collections.get('users').query().fetch();

    const userMiles = await user[0].usersMiles;
    const results = await AchievementManager.checkTotalMilesAchievements(
      user[0],
      userMiles[0],
      achievementsWithCompletions
    );

    expect(results).toStrictEqual([
      {achievementName: 'First Steps', achievementId: '93'},
      {achievementName: '007', achievementId: '94'},
      {achievementName: 'National Pie Day', achievementId: '98'},
    ]);
  });
});

describe('checkTrailCompletionAchievements()', () => {
  afterAll(async () => {
    await testDb.write(async () => {
      await testDb.unsafeResetDatabase();
    });
  });
  test('if completeing specific trail returns achievement', async () => {
    const user = await testDb.collections.get('users').query().fetch();
    const newCompletedHike = await user[0].addCompletedHike({
      trailId: '5',
      bestCompletedTime: '0',
      firstCompletedAt: '0',
      lastCompletedAt: '0',
    });

    const completedHikes = await user[0].completedHikes;

    const achievementsWithCompletions = newAchievements.map((achievement) => ({
      ...achievement,
      completed: 0,
    }));

    // const user = await testDb.collections.get('users').query().fetch();

    const results = await AchievementManager.checkTrailCompletionAchievements(
      user[0],
      completedHikes,
      achievementsWithCompletions
    );

    const usersAchievementsAfterAdd = await user[0].usersAchievements;

    //expect achievement manager to return correct achievement
    expect(results).toStrictEqual([
      {achievementName: 'American Samoa Park Explorer', achievementId: '35'},
    ]);
    //expect new achievement to be added to databses users Achievements
    expect(usersAchievementsAfterAdd[0].achievementId).toBe('35');
  });
});

describe('User Session Achievements', () => {
  afterAll(async () => {
    await testDb.write(async () => {
      await testDb.unsafeResetDatabase();
    });
  });
  test('checkUserSessionAchievments finds first time category achievment', async () => {
    const achievementsWithCompletions = newAchievements.map((achievement) => ({
      ...achievement,
      completed: 0,
    }));

    const user = await testDb.collections.get('users').query().fetch();
    const sessionDetails = {
      isSessionStarted: false,
      isPaused: false,
      sessionName: '',
      sessionDescription: '',
      sessionCategoryId: '8',
      initialPomodoroTime: 1500,
      initialShortBreakTime: 300,
      initialLongBreakTime: 2700,
      elapsedPomodoroTime: 0,
      elapsedShortBreakTime: 0,
      elapsedLongBreakTime: 0,
      sets: 3,
      currentSet: 1,
      pace: 2,
      completedHike: false,
      strikes: 0,
      endSessionModal: false,
      totalSessionTime: 0,
      totalDistanceHiked: 0.0,
      isLoading: false,
      isError: false,
    };
    //add new user session
    await user[0].addUserSession({
      sessionName: 'test Name',
      sessionDescription: 'test Description',
      sessionCategoryId: sessionDetails.sessionCategoryId,
    });

    //call check user session achievements on databse
    let results = await AchievementManager.checkUserSessionAchievements(
      user[0],
      sessionDetails,
      'Family',
      achievementsWithCompletions
    );
  
    let usersAchievementsAfterAdd = await user[0].usersAchievements;

    //expect achievement manager to return correct achievement
    expect(results).toStrictEqual([
      {achievementName: 'First Family Time', achievementId: '123'},
    ]);
    //expect new achievement to be added to databses users Achievements
    expect(usersAchievementsAfterAdd[0].achievementId).toBe('123');
  });
});
