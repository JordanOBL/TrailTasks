import {MockTestData} from '../../mockTestData.js';
import sessionCategories from '../../../helpers/Session/sessionCategories';
import {setGenerator} from '@nozbe/watermelondb/utils/common/randomId';
import {testDb} from '../../../watermelon/testDB'; // Import the test database instance
import {v4 as uuidv4} from 'uuid';

setGenerator(uuidv4);

jest.mock('@nozbe/watermelondb/utils/common/randomId/randomId', () => {});

//create existing user before each test
beforeEach(async () => {
  await testDb.write(async () => {
    await testDb.collections.get('users').create((user) => {
      user.username = MockTestData.existingUserDetails.username;
      user.firstName = MockTestData.existingUserDetails.firstName;
      user.lastName = MockTestData.existingUserDetails.lastName;
      user.email = MockTestData.existingUserDetails.email;
      user.password = MockTestData.existingUserDetails.password;
      user.pushNotificationsEnabled =
        MockTestData.existingUserDetails.pushNotificationsEnabled;
      user.themePreference = MockTestData.existingUserDetails.themePreference;
      user.trailId = MockTestData.existingUserDetails.trailId;
      user.trailProgress = MockTestData.existingUserDetails.trailProgress;
      user.trailStartedAt = MockTestData.existingUserDetails.trailStartedAt;
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
    const newSessionCategories = await Promise.all(
      sessionCategories.map(async (category) => {
        const createdCategory = testDb.collections
          .get('session_categories')
          .prepareCreate((newCategory) => {
            newCategory._id = category.id;
            newCategory.sessionCategoryName = category.session_category_name;
          });
        return createdCategory;
      })
    );
    await testDb.batch(...newSessionCategories);
  });
});
//delete database after all describes and tests are ran
afterAll(async () => {
  await testDb.write(async () => {
    await testDb.unsafeResetDatabase();
  });
});

describe('WatermelonDB USER model writers', () => {
  test('gets userSessoin with session categories attached', async () => {
    //get all users created before all
    const users = await testDb.get('users').query().fetch();
    //get the only user created (first in the users arrray)
    const user = users[0];

    await user.addUserSession({
      sessionName: 'test session',
      sessionDescription: 'test Description',
      sessionCategoryId: '9',
    });

    const userSessions = await user.userSessions;

    const sessionCategoriesCollection = await testDb
      .get('session_categories')
      .query()
      .fetch();

    const categoryMap = {};

    sessionCategoriesCollection.forEach((category) => {
      categoryMap[category.sessionCategoryName] = category._id;
    });

    const test = await user.getUserSessionsByCategoryCount(categoryMap.Finance);

    expect(test).toBe(1);
  });
});
