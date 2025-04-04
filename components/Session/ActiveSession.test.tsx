import {getByTestId, render, waitFor, fireEvent, screen} from '@testing-library/react-native';
import React from 'react';
import {testDb as watermelonDatabase} from '../../watermelon/testDB';
import {createMockUserBase} from '../../__mocks__/UserModel';
import { DatabaseProvider } from '@nozbe/watermelondb/react';
import { AuthProvider, useAuthContext } from '../../services/AuthContext'
import {InternetConnectionProvider} from '../../contexts/InternetConnectionProvider';
import {endSession} from '../../helpers/Timer/timerFlow'
import { sync } from '../../watermelon/sync';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ActiveSession from './ActiveSession';
import Rewards from '../../helpers/Session/Rewards';


describe('ActiveSession', () => {
	let testUser, trail, newUserSession, completedTrails

	beforeAll(async () => {
		await watermelonDatabase.write(async () => {
			await watermelonDatabase.unsafeResetDatabase();
		})

		//bootsrap initall data from masterdb to local
		await sync(watermelonDatabase, true);

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
		// Create mock user
		const mockUser = createMockUserBase();
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
				user.totalMiles = mockUser.totalMiles;
				user.dailyStreak = mockUser.dailyStreak;
				user.themePreference = mockUser.themePreference;
			})
			return newUser
		})
		const { newSession } = await testUser.startNewSession({
			startTime: Date.now(),
			sessionName: 'test session',
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
		})
		trail = await testUser.trail;
		completedTrails = await testUser.completedTrails;
		newUserSession = newSession
	})

	afterAll(async () => {
		await watermelonDatabase.write(async () => {
			await watermelonDatabase.unsafeResetDatabase();
		})
	});




	const TestWrapper = () => {
		const [sessionDetails, setSessionDetails] = React.useState({
			startTime: Date.now(),
			sessionName: 'test session',
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
		})
		const [timer, setTimer] = React.useState({
			startTime: Date.now(),
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
			autoContinue: false,
			elapsedTime: 0
		})
		const [showResultsScreen, setShowResultsScreen] = React.useState(false)
		const [currentTrail, setCurrentTrail] = React.useState(trail)
		const queuedTrails = []
		const [completedTrails, setCompletedTrails] = React.useState(completedTrails)
		const [userSession, setUserSession] = React.useState(newUserSession)
		const currentSessionCategory = '1'
		const achievementsWithCompletion = []
		async function handleEndSession(){
			try {
				await endSession({ user, setTimer, setSessionDetails, sessionDetails });
				await sync(watermelonDatabase, isConnected, user.id);
				setShowResultsScreen(false);
			} catch (err) {
				handleError(err, 'onEndSession');
			}
		};
		async function handleShowResultsScreen() {
			const sessionTokensReward = await Rewards.calculateSessionTokens({setSessionDetails, sessionDetails, timer})
			await Rewards.rewardFinalTokens( {sessionDetails, sessionTokensReward, user} )
			setShowResultsScreen(true);
		}

		return (
			<DatabaseProvider database={watermelonDatabase}>
				<InternetConnectionProvider>
					<AuthProvider initialUser={testUser}>
						<NavigationContainer>
							<ActiveSession 
								setSessionDetails={setSessionDetails} 
								sessionDetails={sessionDetails} 
								timer={timer} 
								setTimer={setTimer} 
								userSession={userSession}
								user={testUser} 
								currentTrail={currentTrail} 
								queuedTrails={queuedTrails} 
								completedTrails={completedTrails} 
								achievementsWithCompletion={achievementsWithCompletion} 
								currentSessionCategory={currentSessionCategory}
								endSession={handleEndSession} 
								showResultsScreen={handleShowResultsScreen}   
							/>
						</NavigationContainer>
					</AuthProvider>
				</InternetConnectionProvider>
			</DatabaseProvider>
		)
	}

	it('renders correctly', async () => {
		const {getByTestId} = render(<TestWrapper />)
		expect(getByTestId('active-session-screen')).toBeOnTheScreen()
		expect(getByTestId('pace')).toHaveTextContent('2 mph')
		screen.debug()
		expect(getByTestId('reward')).toHaveTextContent(0)
		expect(getByTestId('current-trail-name')).toHaveTextContent('The Beehive Loop Trail')
	})

	it('displays end session confirmation modal', async () => {
		const {getByTestId} = render(<TestWrapper />)
		await waitFor(() => {
			expect(getByTestId('stop-button')).toBeOnTheScreen()
		})
		fireEvent.press(getByTestId('stop-button'))
		await waitFor(() => {
			expect(getByTestId('quit-session-modal')).toBeOnTheScreen()
		})
	})
	it('closes end session confirmation modal', async () => {

		const {getByTestId, queryByTestId} = render(<TestWrapper />)
		await waitFor(() => {
			expect(getByTestId('stop-button')).toBeOnTheScreen()
		})
		fireEvent.press(getByTestId('stop-button'))
		await waitFor(() => {
			expect(queryByTestId('quit-session-modal')).toBeOnTheScreen()
			expect(getByTestId('confirm-cancel-button')).toBeOnTheScreen()
		})
		fireEvent.press(getByTestId('confirm-cancel-button'))
		await waitFor(() => {
			expect(queryByTestId('quit-session-modal')).not.toBeOnTheScreen()
		})
	})

})
