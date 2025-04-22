import PhysicalSession from './PhysicalSession';
import {render, screen, getByTestId, waitFor} from '@testing-library/react-native';
import BackgroundGeolocation from 'react-native-background-geolocation';
import {createMockUserBase, createUser} from '../../__mocks__/UserModel';
import {testDb} from '../../watermelon/testDb'
import {sync} from '../../watermelon/sync';
import {User_Session} from '../../watermelon/models';

describe('PhysicalSession', () => {
	let testUser
	const sessionDetailsl = {
    startTime: null,
    sessionName: '',
    sessionDescription: '',
    sessionCategoryId: null,
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
    type: "POMODORO",
    isLoading: false,
    isError: false,
    backpack: [{addon: null, minimumTotalMiles:0.0}, {addon: null, minimumTotalMiles:75.0}, {addon: null, minimumTotalMiles:175.0}, {addon: null, minimumTotalMiles:375.0}]
  }

  const timer = {
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
    type: "POMODORO",
    completedSets: 0,
    pace: 2,
    autoContinue: false,
    elapsedTime: 0
	}


beforeEach(async () => {
	testUser = await createUser(testDb, createMockUserBase())
	await sync(testDb, testUser)
})

afterEach(async () => {
		await testDb.write(async () => {
			await testDb.unsafeResetDatabase()
		})
	})

test('it renders', async () => {

const testSession =	await testDb.write(async () => {
		const testSession = await testDb.collections.get('users_sessions').create((session: User_Session) => {
				session.userId = testUser.id
				session.sessionName = 'physical'
				session.totalDistanceHiked = '0.00'
				session.sessionCategoryId = '4'
				session.dateAdded = new Date()
				session.totalSessionTime = 0
				
			})
			return testSession

	})
	const {getByTestId} = render(<PhysicalSession user={testUser} userSession={testSession}/>);
	await waitFor(() => {
		expect(getByTestId('physical-session-screen')).toBeTruthy();
		expect(BackgroundGeolocation.start).toHaveBeenCalledTimes(1);	
		});
});
})

