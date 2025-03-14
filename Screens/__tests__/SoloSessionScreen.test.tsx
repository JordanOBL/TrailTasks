import {useState} from 'react';
import { fireEvent, render, waitFor, screen } from '@testing-library/react-native';
import { WrappedApp} from '../../index';
import {testDb as watermelonDatabase} from '../../watermelon/testDB';
import {createMockUserBase} from '../../__mocks__/UserModel';
import { DatabaseProvider } from '@nozbe/watermelondb/react';
import { AuthProvider, useAuthContext } from '../../services/AuthContext'
import {InternetConnectionProvider} from '../../contexts/InternetConnectionProvider';
import EnhancedSessionScreen from '../SessionScreen';
import EnhancedNewSessionOptions from '../../components/Session/NewSessionOptions';
import { sync } from '../../watermelon/sync';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
const Stack = createStackNavigator();
const mockUser = createMockUserBase();
let testUser

describe('Solo SessionScreen',() => {
	// Reset the local database
	beforeAll(async () => {
		await watermelonDatabase.write(async () => {
			await watermelonDatabase.unsafeResetDatabase();
		})
		//bootsrap initall data from masterdb to local
		await sync(watermelonDatabase, true);
		// tawait pool.query('TRUNCATE TABLE users CASCADE');
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
		jest.clearAllMocks();
	})

	test('Renders New Session Options', async () => {
		const { getByTestId, queryByTestId } = render(
		<DatabaseProvider database={watermelonDatabase}>
			<InternetConnectionProvider>
				<AuthProvider initialUser={testUser}>
					<NavigationContainer>
						<Stack.Navigator>
							<Stack.Screen name="Solo">
								{props => <EnhancedSessionScreen{...props} initialSessionDetails={{
									startTime: null,
									sessionName: '',
									sessionDescription: '',
									sessionCategoryId: '1',
									breakTimeReduction:0,
									minimumPace: 2,
									maximumPace: 5.5,
									paceIncreaseValue: .25,
									paceIncreaseInterval: 900, //15 minutes,
									increasePaceOnBreakValue: 0, //TODO: possible addon sleeping bag increases pace by this interval on breaks
									completedHike: false,
									strikes: 0,
									penaltyValue: 1,
									continueSessionModal: false,
									totalDistanceHiked: 0.0,
									totalTokenBonus: 0,
									trailTokensEarned:0,
									sessionTokensEarned:0,
									isLoading: false,
									isError: false,
									backpack: [{addon: null, minimumTotalMiles:0.0}, {addon: null, minimumTotalMiles:75.0}, {addon: null, minimumTotalMiles:175.0}, {addon: null, minimumTotalMiles:375.0}]
								}} user={testUser} />}
							</Stack.Screen>
						</Stack.Navigator>
					</NavigationContainer>
				</AuthProvider>
			</InternetConnectionProvider>
		</DatabaseProvider>
		);


		await waitFor(() => {
			expect(queryByTestId("new-session-options")).toBeOnTheScreen();
		})

	})
	test('Renders active session screen', async () => {
		const { getByTestId, queryByTestId } = render(
		<DatabaseProvider database={watermelonDatabase}>
			<InternetConnectionProvider>
				<AuthProvider initialUser={testUser}>
					<NavigationContainer>
						<Stack.Navigator>
							<Stack.Screen name="Solo">
								{props => <EnhancedSessionScreen{...props} initialSessionDetails={{
									startTime: null,
									sessionName: 'test name',
									sessionDescription: '',
									sessionCategoryId: '1',
									breakTimeReduction:0,
									minimumPace: 2,
									maximumPace: 5.5,
									paceIncreaseValue: .25,
									paceIncreaseInterval: 900, //15 minutes,
									increasePaceOnBreakValue: 0, //TODO: possible addon sleeping bag increases pace by this interval on breaks
									completedHike: false,
									strikes: 0,
									penaltyValue: 1,
									continueSessionModal: false,
									totalDistanceHiked: 0.0,
									totalTokenBonus: 0,
									trailTokensEarned:0,
									sessionTokensEarned:0,
									isLoading: false,
									isError: false,
									backpack: [{addon: null, minimumTotalMiles:0.0}, {addon: null, minimumTotalMiles:75.0}, {addon: null, minimumTotalMiles:175.0}, {addon: null, minimumTotalMiles:375.0}]
								}} user={testUser} />}
							</Stack.Screen>
						</Stack.Navigator>
					</NavigationContainer>
				</AuthProvider>
			</InternetConnectionProvider>
		</DatabaseProvider>
		);
		expect(getByTestId("start-session-button")).toBeEnabled();	
		fireEvent.press(getByTestId("start-session-button"))	
		await waitFor(() => {
			screen.debug();	
			expect(queryByTestId("active-session-screen")).toBeOnTheScreen();
		})

	})
})

describe('New session options settings', () => {
	let sessionCategories
	// Reset the local database
	beforeAll(async () => {
		await watermelonDatabase.write(async () => {
			await watermelonDatabase.unsafeResetDatabase();
		})
		//bootsrap initall data from masterdb to local
		await sync(watermelonDatabase, true);
		// tawait pool.query('TRUNCATE TABLE users CASCADE');
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
		jest.clearAllMocks();
		sessionCategories = await watermelonDatabase
			.get('session_categories')
			.query()
			.fetch()


	})


	const TestWrapper = () => {
		const [sessionDetails, setSessionDetails] = useState<SessionDetails>({
			startTime: null,
			sessionName: '',
			sessionDescription: '',
			sessionCategoryId: '1',
			breakTimeReduction:0,
			minimumPace: 2,
			maximumPace: 5.5,
			paceIncreaseValue: .25,
			paceIncreaseInterval: 900, //15 minutes,
			increasePaceOnBreakValue: 0, //TODO: possible addon sleeping bag increases pace by this interval on breaks
			completedHike: false,
			strikes: 0,
			penaltyValue: 1,
			continueSessionModal: false,
			totalDistanceHiked: 0.0,
			totalTokenBonus: 0,
			trailTokensEarned:0,
			sessionTokensEarned:0,
			isLoading: false,
			isError: false,
			backpack: [{addon: null, minimumTotalMiles:0.0}, {addon: null, minimumTotalMiles:75.0}, {addon: null, minimumTotalMiles:175.0}, {addon: null, minimumTotalMiles:375.0}]
		});

		const [timer, setTimer] = useState<Timer>({
			startTime: null,
			isCompleted: false,
			time: 1500,
			isRunning: false,
			isPaused: false,
			isBreak: false,
			focusTime: 1500,
			shortBreakTime: 300,
			longBreakTime: 2700,
			sets: 3,
			completedSets: 0,
			pace: 2,
			autoContinue: false

		})


		const [userSession, setUserSession] = useState<any>();

		return (
			<DatabaseProvider database={watermelonDatabase}>
				<InternetConnectionProvider>
					<AuthProvider initialUser={testUser}>
						<EnhancedNewSessionOptions
							sessionDetails={sessionDetails}
							setSessionDetails={setSessionDetails}
							timer={timer}
							setTimer={setTimer}
							setUserSession={setUserSession}
							sessionCategories={sessionCategories}
							user={testUser}
						/>
					</AuthProvider>
				</InternetConnectionProvider>
			</DatabaseProvider>
		)

	}

	test('settings button, openns settings modal', async () => {
		const { getByTestId } = render(<TestWrapper />);
		await waitFor(() => {
			fireEvent.press(getByTestId('settings-modal-button'));
		})
		expect(getByTestId('settings-modal')).toBeOnTheScreen();
	})

	test('save and close settings modal', async () => {
		const { queryByTestId, getByTestId } = render(<TestWrapper />);
		await waitFor(() => {
			fireEvent.press(getByTestId('settings-modal-button'));
			fireEvent.changeText(getByTestId('session-name-input'), 'test name');
			fireEvent.press(getByTestId('save-and-close-button'));
		})
		expect(queryByTestId('settings-modal')).not.toBeOnTheScreen();
		expect(getByTestId('session-name-display')).toHaveTextContent('test name');
	})
	test('Begin Session button only enabled after session name', async () => {
		const { getByTestId, rerender } = render(<TestWrapper />);
		expect(getByTestId('start-session-button')).toBeDisabled();
		await waitFor(() => {
			fireEvent.press(getByTestId('settings-modal-button'));
			fireEvent.changeText(getByTestId('session-name-input'), 'test name');
			fireEvent.press(getByTestId('save-and-close-button'));
		})
		expect(getByTestId('start-session-button')).not.toBeDisabled();	

	})
	test('Begin Session Button creates new User Session', async () => {
		const { getByTestId, queryByTestId,rerender } = render(<TestWrapper />);
		await waitFor(() => {
			fireEvent.press(getByTestId('settings-modal-button'));
			fireEvent.changeText(getByTestId('session-name-input'), 'test name');
			fireEvent.press(getByTestId('save-and-close-button'));
		})


		await waitFor(() => {
			fireEvent.press(getByTestId('start-session-button'));
		})
			const [userSession] = await watermelonDatabase.get('users_sessions').query().fetch();
		await waitFor(() => {
			expect(userSession.sessionName).toBe('test name');
		})


	})	
})
