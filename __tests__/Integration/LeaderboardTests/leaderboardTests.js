import { MockTestData } from '../../mockTestData.js';
import { setGenerator } from '@nozbe/watermelondb/utils/common/randomId';
import { testDb } from '../../../watermelon/testDB'; // Import the test database instance
import { v4 as uuidv4 } from 'uuid';
import LeaderboardsScreen from "../../../Screens/LeaderboardsScreen";
import { render, waitFor } from "@testing-library/react-native";
import { Q } from "@nozbe/watermelondb";
import DatabaseProvider from "@nozbe/watermelondb/DatabaseProvider";
setGenerator(uuidv4);

jest.mock('@nozbe/watermelondb/utils/common/randomId/randomId', () => {});
jest.mock('@react-native-community/netinfo');

// Create existing users before each test
beforeEach(async () => {
    const arr = new Array(10).fill(null);
    await testDb.write(async () => {
        const userRecords = arr.map((_, idx) =>
            testDb.collections.get('users').prepareCreate((user) => {
                user.username = MockTestData.existingUserDetails.username + idx;
                user.firstName = MockTestData.existingUserDetails.firstName + idx;
                user.lastName = MockTestData.existingUserDetails.lastName + idx;
                user.email = `${idx}${MockTestData.existingUserDetails.email}`;
                user.password = MockTestData.existingUserDetails.password;
                user.pushNotificationsEnabled = MockTestData.existingUserDetails.pushNotificationsEnabled;
                user.themePreference = MockTestData.existingUserDetails.themePreference;
                user.trailId = MockTestData.existingUserDetails.trailId;
                user.trailProgress = MockTestData.existingUserDetails.trailProgress;
                user.trailStartedAt = MockTestData.existingUserDetails.trailStartedAt;
            })
        );
        await testDb.batch(...userRecords);
    });
});



// Delete database after all describes and tests are run
afterAll(async () => {
    await testDb.write(async () => {
        await testDb.unsafeResetDatabase();
    });
});

describe("leaderboards screen and components", () => {
    test('Shows error message on fetch failure', async () => {
        const users = await testDb.collections.get('users').query(Q.where('email', '0existing@example.com'));
        const found = users[0]
        // You can now proceed with your actual test code
         console.log(usersMiles)

         //
        // const user = {
        //     id: null
        // }

        // const { getByText } = render(<DatabaseProvider database={testDb}><LeaderboardsScreen userMiles={usersMiles} user={users[0]} /></DatabaseProvider>);
        //
        // // Wait for the component to update with the error message
        // await waitFor(() => {
        //     expect(getByText("Error fetching global leaderboard.")).toBeTruthy();
        // });
    });
});