import {useState} from 'react';
import { fireEvent, render,  waitFor, act, getByTestId, queryByTestId , screen} from '@testing-library/react-native';
import {testDb as watermelonDatabase} from '../../watermelon/testDB';
import {createMockUserBase, createUser} from '../../__mocks__/UserModel';
import {TestWrapper} from '../../__mocks__/TestWrapper';
import {sync} from '../../watermelon/sync';
import {DatabaseProvider} from '@nozbe/watermelondb/react';
import {AuthProvider} from '../../services/AuthContext';
import {checkForLoggedInUser} from '../../services/auth';
import {InternetConnectionProvider} from '../../contexts/InternetConnectionProvider';
import EnhancedFriendsScreen from '../FriendsScreen';
import NetInfo from '@react-native-community/netinfo';
import pg from 'pg';
import {useNavigation} from '@react-navigation/native';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_CONNECTION_STRING });

describe('Friends Screen', () => {
				let getByTestId: any;
				let queryByTestId: any;
				let testUser = createMockUserBase();

   const navigation = {
			 navigate: jest.fn(),
		} 



				beforeEach(async () => {
								await watermelonDatabase.write(async () => {
												await watermelonDatabase.unsafeResetDatabase();
								})
								pool.query('TRUNCATE TABLE users CASCADE');

								await sync(watermelonDatabase,true);
								testUser = await createUser(watermelonDatabase,testUser);
								const rendered = render(
												<TestWrapper testUser={testUser}>
																<EnhancedFriendsScreen navigation={navigation} user={testUser} />
												</TestWrapper>	
								)

								getByTestId = rendered.getByTestId
								queryByTestId = rendered.queryByTestId


				})
	afterAll(async () => {
		await watermelonDatabase.write(async () => {
			await watermelonDatabase.unsafeResetDatabase();
		})
		await pool.end();
	})

				test('it renders friends screen correctly', async () => {
								await waitFor(() => {
												expect(getByTestId('friends-screen')).toBeTruthy();

								})

				})

				test('shows refresh connection button if no internet connection, and "no Friends Message" if no friends', async () => {
								// RNNetInfo
								NetInfo.fetch.mockImplementationOnce(() => Promise.resolve({ isConnected: false }));


								const {getByTestId} = render(<TestWrapper testUser={testUser}>
												<EnhancedFriendsScreen user={testUser} />
								</TestWrapper>);

								await waitFor(() => {
												expect(getByTestId('refresh-connection-button')).toBeTruthy();
												expect(getByTestId('no-friends-message')).toBeTruthy();
								})
				})
				test('searches and finds global user, adds user to friends and cached friends, and shows friends card', async () => {
								//create testUser2 to be friend of testUser
								let testUser2 = createMockUserBase({username: 'testuser2', email: 'testUser2@me.com', totalMiles: '100.00'});
								testUser2 = await createUser(watermelonDatabase, testUser2);

								//create friend relationship between testUser and testUser2 from testUser	
															//send friends relationship to global server
								await sync(watermelonDatabase, true, testUser.id);

								//render friends screen
		            await waitFor(() => {
		              expect(getByTestId('friend-search-input')).toBeTruthy();
		            })
		fireEvent.changeText(getByTestId('friend-search-input'), 'testuser2')
		fireEvent.press(getByTestId('friend-search-button'))
							


								await waitFor(() => {
												expect(getByTestId(`${testUser2.id}-found-friend-card`)).toBeDefined();
			expect(getByTestId(`add-friend-${testUser2.id}-button`)).toBeDefined();

								})
		fireEvent.press(getByTestId(`add-friend-${testUser2.id}-button`))
		await waitFor(() => {
			expect(getByTestId(`${testUser2.id}-friend-card`)).toBeDefined();
		}, {timeout: 10000})

				})

				test('shows cached friends without internet connection', async () => {
								// RNNetInfo
								NetInfo.fetch.mockImplementationOnce(() => Promise.resolve({ isConnected: false }));

								//create testUser2 to be friend of testUser
								let testUser2 = createMockUserBase({username: 'testuser2', email: 'testUser2@me.com'});
								testUser2 = await createUser(watermelonDatabase, testUser2);
								await watermelonDatabase.write(async () => {
												const friend = await watermelonDatabase.get('cached_friends').create(cached_friend => {
																cached_friend.userId = testUser.id
																cached_friend.friendId = testUser2.id
																cached_friend.username = testUser2.username
																cached_friend.totalMiles = testUser2.totalMiles
																cached_friend.currentTrail = testUser2.currentTrail
																cached_friend.roomId = testUser2.roomId
																cached_friend._raw._status = 'synced'
												})
												return friend
								})


								const {getByTestId} = render(<TestWrapper testUser={testUser}>
												<EnhancedFriendsScreen user={testUser} />
								</TestWrapper>);


								await waitFor(() => {
												expect(getByTestId(`${testUser2.id}-friend-card`)).toBeDefined()

		})
	})
	test('navigates to group session main screen with friends roomId in the imput to join room', async () =>{

  
															//create testUser2 to be friend of testUser
								let testUser2 = createMockUserBase({username: 'testuser2', email: 'testUser2@me.com', totalMiles: '100.00', roomId: '12345'});
								testUser2 = await createUser(watermelonDatabase, testUser2);

								//create friend relationship between testUser and testUser2 from testUser	
															//send friends relationship to global server
								await sync(watermelonDatabase, true, testUser.id);

								//render friends screen
		            await waitFor(() => {
		              expect(getByTestId('friend-search-input')).toBeTruthy();
		            })
		fireEvent.changeText(getByTestId('friend-search-input'), 'testuser2')
		fireEvent.press(getByTestId('friend-search-button'))
							


								await waitFor(() => {
												expect(getByTestId(`${testUser2.id}-found-friend-card`)).toBeDefined();
			expect(getByTestId(`add-friend-${testUser2.id}-button`)).toBeDefined();

								}, {timeout: 5000})
		fireEvent.press(getByTestId(`add-friend-${testUser2.id}-button`))
		await waitFor(() => {
			expect(getByTestId(`${testUser2.id}-friend-card`)).toBeDefined();
			expect(getByTestId(`join-room-${testUser2.roomId}-button`)).toBeDefined();
		}, {timeout: 5000})

			

								fireEvent.press(getByTestId(`join-room-${testUser2.roomId}-button`))

								await waitFor(() => {
												expect(navigation.navigate).toHaveBeenCalledWith('Timer', { screen: 'Group',params: { joinRoomId: testUser2.roomId } });
								})
				})
})

