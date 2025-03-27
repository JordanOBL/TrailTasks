
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { WrappedApp} from '../../index';
import {testDb as watermelonDatabase} from '../../watermelon/testDB';
import {createMockUserBase} from '../../__mocks__/UserModel';
import { DatabaseProvider } from '@nozbe/watermelondb/react';
import { AuthProvider, useAuthContext } from '../../services/AuthContext'
import {InternetConnectionProvider} from '../../contexts/InternetConnectionProvider';
import EnhancedHomeScreen from '../HomeScreen';
import HomeScreen from '../HomeScreen';
import { sync } from '../../watermelon/sync';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
const Stack = createStackNavigator();

describe('HomeScreen', () => {
	const mockUser = createMockUserBase();
	const mockTrail = { id: '1', trailName: 'Mock Trail 1' };
	let testUser

	beforeAll(async () => {
		// Reset the database and seed with mock trail

		await sync(watermelonDatabase, true)

		testUser = await watermelonDatabase.write(async () => {
			const newUser = await watermelonDatabase.get('users').create((user) => {
				user.id = mockUser.id;
				user.email = mockUser.email;
				user.password = mockUser.password;
				user.username = mockUser.username;
				user.firstName = mockUser.firstName;
				user.lastName = mockUser.lastName;
				user.trailId = mockUser.trailId; // Ensure this matches a seeded trail
				user.trailTokens = mockUser.trailTokens;
				user.lastDailyStreakDate = mockUser.lastDailyStreakDate;
				user.prestigeLevel = mockUser.prestigeLevel;
				user.pushNotificationsEnabled = mockUser.pushNotificationsEnabled;
				user.trailStartedAt = mockUser.trailStartedAt;
				user.trailProgress = mockUser.trailProgress;
				user.totalMiles = mockUser.totalMiles;
				user.dailyStreak = mockUser.dailyStreak;
				user.themePreference = mockUser.themePreference;
				// Initialize other fields as necessary
			});
			return newUser;

		});

		// Wait for the sync to complete by ensuring trails are loaded
		await waitFor(
			async () => {
				const trails = await watermelonDatabase.get('trails').query().fetch();
				const parks = await watermelonDatabase.get('parks').query().fetch();
				expect(trails.length).toBe(96); // Adjust based on your actual bootstrap data
				expect(parks.length).toBe(63);
			},
			{ timeout: 10000 } // Increase timeout as needed
		);

	});

	test('renders correctly', async () => {
		const {getByTestId} = render(
			<DatabaseProvider database={watermelonDatabase}>
				<InternetConnectionProvider>
				<AuthProvider initialUser={testUser}>
					<NavigationContainer>
						<Stack.Navigator>
							<Stack.Screen name="Home">
								{props => <EnhancedHomeScreen {...props} user={testUser} />}
							</Stack.Screen>
						</Stack.Navigator>
					</NavigationContainer>
				</AuthProvider>
				</InternetConnectionProvider>
			</DatabaseProvider>
		);


		await waitFor(() => {
			expect(getByTestId('homescreen')).toBeDefined();
		});
	});

	test('renders tutorial modal for users with 0 miles',async ()=>{
		const {getByTestId} = render(
			<DatabaseProvider database={watermelonDatabase}>
				<InternetConnectionProvider>
				<AuthProvider initialUser={testUser}>
					<NavigationContainer>
						<Stack.Navigator>
							<Stack.Screen name="Home">
								{props => <EnhancedHomeScreen {...props} user={testUser} />}
							</Stack.Screen>
						</Stack.Navigator>
					</NavigationContainer>
				</AuthProvider>
				</InternetConnectionProvider>
			</DatabaseProvider>
		);

		
		await waitFor(()=>{

			expect(getByTestId('tutorial-modal')).toBeOnTheScreen();
		})

	})

	test('doesnt not show tutorial if users mils > 0', async()=> {
		await watermelonDatabase.write(async () => {
			await testUser.update(user => {
				user.totalMiles = '0.02'
			})
		})

		const { getByTestId, queryByTestId } = render(
			<DatabaseProvider database={watermelonDatabase}>
				<InternetConnectionProvider>
				<AuthProvider initialUser={testUser}>
					<NavigationContainer>
						<Stack.Navigator>
							<Stack.Screen name="Home">
								{props => <EnhancedHomeScreen {...props} user={testUser} />}
							</Stack.Screen>
						</Stack.Navigator>
					</NavigationContainer>
				</AuthProvider>
				</InternetConnectionProvider>
			</DatabaseProvider>
		);

		
		await waitFor(() => {
			expect(getByTestId("tutorial-modal")).not.toBeOnTheScreen();
		})

	})



});

