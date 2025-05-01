
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
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_CONNECTION_STRING });
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
				user.trailId = mockUser.trailId; // Ensure this matches a seeded trail
				user.trailTokens = mockUser.trailTokens;
				user.lastDailyStreakDate = mockUser.lastDailyStreakDate;
				user.prestigeLevel = mockUser.prestigeLevel;
				user.pushNotificationsEnabled = mockUser.pushNotificationsEnabled;
				user.trailStartedAt = mockUser.trailStartedAt;
				user.trailProgress = mockUser.trailProgress;
				user.totalMiles = '0.00';
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
	afterAll(async () => {
		await watermelonDatabase.write(async () => {
			await watermelonDatabase.unsafeResetDatabase();
		})
		pool.query('TRUNCATE TABLE users CASCADE');
		pool.end();
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

			expect(getByTestId('tutorial-modal')).toBeDefined();
		})

	})

	test('doesnt not show tutorial if users mils > 0', async()=> {
		await watermelonDatabase.write(async () => {
			await testUser.update(user => {
				user.totalMiles = '0.02'
			})
		})

		await waitFor(() => {
			expect(testUser.totalMiles).toBe('0.02')
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
			expect(queryByTestId("tutorial-modal")).not.toBeOnTheScreen();
		})

	})

	test('it shows the correct daily streak', async () => {
		const prevDailyStreak = testUser.dailyStreak;
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		await watermelonDatabase.write(async () => {
			watermelonDatabase.batch(
			testUser.prepareUpdate(user => {
				user.lastDailyStreakDate = yesterday.toISOString();
			}),
			watermelonDatabase.get('users_sessions').prepareCreate((session) => {
				session._id = '1'
				session.userId = testUser.id
				session.sessionCategoryId = '1'
				session.sessionName = 'Session 1'
				session.sessionDescription = 'Session 1 description'
				session.totalSessionTime = 300
				session.totalDistanceHiked = '10.00'
				session.dateAdded = today.toISOString()
			})
			)
		})

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
			expect(getByTestId('daily-streak')).toBeDefined();
			expect(prevDailyStreak).toBe(0);
			expect(getByTestId('daily-streak')).toHaveTextContent('1');
		})
	})



});

