import StatsScreen from '../StatsScreen';
import { TestWrapper } from '../../__mocks__/TestWrapper';
import {testDb} from '../../watermelon/testDB';
import {createMockUserBase, createUser} from '../../__mocks__/UserModel';
import {sync} from '../../watermelon/sync';
import {Q} from '@nozbe/watermelondb';
import {render, fireEvent, waitFor, getByTestId} from '@testing-library/react-native';
import {Pool} from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_CONNECTION_STRING });

const mockUser = createMockUserBase();
describe('StatsScreen', () => {
	let testUser


	beforeEach(async () => {
		await testDb.write(async () => {

			await testDb.unsafeResetDatabase();		
		})	
		await sync(testDb,true);
	})
	afterEach(async () => {
		await testDb.write(async () => {
			await testDb.unsafeResetDatabase();
		})
		pool.query('TRUNCATE TABLE users CASCADE');	
	})
	afterAll(async () => {
		pool.end();
	})

	test('it renders correctly', async () => {
		const {getByTestId} = render(
			<TestWrapper testUser={testUser}>
				<StatsScreen
					user={testUser}
				/>
			</TestWrapper>
		)
		expect(getByTestId('stats-screen')).toBeTruthy();
	})
	test('it correctly show sessions stats', async () => {
		testUser = await createUser(testDb, mockUser);
		const testUserSessions = await testDb.write(async () => {
			const sessions = await testDb.collections.get('users_sessions').create((session) => {
				session._id = '1'
				session.userId = testUser.id
				session.sessionCategoryId = '1'
				session.sessionName = 'Session 1'
				session.sessionDescription = 'Session 1 description'
				session.totalSessionTime = 60
				session.totalDistanceHiked = '10.00'
				session.dateAdded = new Date().toISOString()
			})
			return sessions
		})
		const testSessions = await testUser.usersSessions
		const {getByTestId} = render(
			<TestWrapper testUser={testUser}>
				<StatsScreen
					user={testUser}
				/>
			</TestWrapper>
		)
		await waitFor(() => {
			expect(getByTestId('stats-screen')).toBeTruthy();
		})
		

	})


	test('it correctly switches to show session list and renders correctly', async () => {
		testUser = await createUser(testDb, mockUser);
		const testUserSessions = await testDb.write(async () => {
			const sessions = await testDb.collections.get('users_sessions').create((session) => {
				session._id = '1'
				session.userId = testUser.id
				session.sessionCategoryId = '1'
				session.sessionName = 'Session 1'
				session.sessionDescription = 'Session 1 description'
				session.totalSessionTime = 60
				session.totalDistanceHiked = '10.00'
				session.dateAdded = new Date().toISOString()
			})
			return sessions
		})
		const testSessions = await testUser.usersSessions
		const {getByTestId} = render(
			<TestWrapper testUser={testUser}>
				<StatsScreen
					user={testUser}
				/>
			</TestWrapper>
		)
		fireEvent.press(getByTestId('toggle-stats-screen'));
		await waitFor(() => {
			expect(getByTestId('sessions-list')).toBeTruthy();
		})
		expect(getByTestId(`session-list-item-${testSessions[0].id}`)).toBeTruthy();

	})

})
