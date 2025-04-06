import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import React from 'react';
import EnhancedParkPassScreen from '../ParkPassScreen';
import { TestWrapper  }from '../../__mocks__/TestWrapper';
import { testDb as watermelonDatabase} from '../../watermelon/testDB';
import {createMockUserBase, createUser} from '../../__mocks__/UserModel';
import {sync} from '../../watermelon/sync';

describe('ParkPassScreen', () => {
	let testUser

	beforeAll(async () =>{
	//reset local db
	   await watermelonDatabase.write(async () => {
	       await watermelonDatabase.unsafeResetDatabase();
	   })

		//bootsrap initall data from masterdb to local
		await sync(watermelonDatabase, true);

		//create testUser
    mockUser = createMockUserBase();
		testUser = await watermelonDatabase.write(async () => {
		const testUser =	await watermelonDatabase.get('users').create((user) => {
				user.id = mockUser.id;
				user.email = mockUser.email;
				user.password = mockUser.password;
				user.username = mockUser.username;
				user.trailId = mockUser.trailId; // Ensure this matches a seeded trail
				user.trailTokens = mockUser.trailTokens;
				user.lastDailyStreakDate = mockUser.lastDailyStreakDate;
				user.prestigeLevel = mockUser.prestigeLevel;
				user.pushNotificationsEnabled = mockUser.pushNotificationsEnabled;
				user.trailStartedAt = mockUser.trailStartedAt;
				user.trailProgress = mockUser.trailProgress;
				user.totalMiles = mockUser.totalMiles;
				user.dailyStreak = mockUser.dailyStreak;
				user.themePreference = mockUser.themePreference
	})

		return testUser
		})
	})
		it('renders correctly', async () => {
				const {getByTestId ,queryByTestId} = render(
				<TestWrapper testUser={testUser}>
			
							<EnhancedParkPassScreen user={testUser}  />
			</TestWrapper>
			)	
			await waitFor(() => {

				expect(queryByTestId('park-pass-screen')).toBeTruthy();
				expect(getByTestId('park-pass-count')).toHaveTextContent('0 / 63');
			})




	});
});
