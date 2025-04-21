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

describe('Friends Screen', () => {
				let getByTestId: any;
				let queryByTestId: any;
				let testUser = createMockUserBase();



				beforeEach(async () => {
								await watermelonDatabase.write(async () => {
												await watermelonDatabase.unsafeResetDatabase();
								})

								await sync(watermelonDatabase,true);
								testUser = await createUser(watermelonDatabase,testUser);
								const rendered = render(
												<TestWrapper testUser={testUser}>
																<EnhancedFriendsScreen user={testUser} />
												</TestWrapper>	
								)

								getByTestId = rendered.getByTestId
								queryByTestId = rendered.queryByTestId


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
				test('gets friends from global server, saves as local cached friends, and shows friends card', async () => {
								//create testUser2 to be friend of testUser
								let testUser2 = createMockUserBase({username: 'testUser2', email: 'testUser2@me.com', totalMiles: '100.00'});
								testUser2 = await createUser(watermelonDatabase, testUser2);

								//create friend relationship between testUser and testUser2 from testUser	
								const friend = await watermelonDatabase.write(async () => {
												const friend = await watermelonDatabase.get('users_friends').create(friend => {
																friend.friendId = testUser2.id
																friend.userId = testUser.id
												})
												return friend
								})
								//send friends relationship to global server
								await sync(watermelonDatabase, true, testUser.id);

								//render friends screen
								const {getByTestId} = render(<TestWrapper testUser={testUser}>
												<EnhancedFriendsScreen user={testUser} />
								</TestWrapper>);


								await waitFor(() => {
												expect(getByTestId(`${friend.friendId}-friend-card`)).toBeDefined();

								})
				})

				test('shows cached friends without internet connection', async () => {
								// RNNetInfo
								NetInfo.fetch.mockImplementationOnce(() => Promise.resolve({ isConnected: false }));

								//create testUser2 to be friend of testUser
								let testUser2 = createMockUserBase({username: 'testUser2', email: 'testUser2@me.com'});
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
								let testUser2 = createMockUserBase({username: 'testUser2', email: 'testUser2@me.com', roomId: 'testRoomId'});
								testUser2 = await createUser(watermelonDatabase, testUser2);
								//create friend relationship between testUser and testUser2 from testUser	
								const friend = await watermelonDatabase.write(async () => {
												const friend = await watermelonDatabase.get('users_friends').create(friend => {	
																friend.userId = testUser.id
																friend.friendId = testUser2.id
												})
												return friend
								})
								//send friends relationship to global server
								await sync(watermelonDatabase, true, testUser.id);




								const {getByTestId} = render(<TestWrapper testUser={testUser}>
												<EnhancedFriendsScreen user={testUser} />
								</TestWrapper>);


								await waitFor(() => {
												expect(getByTestId(`${testUser2.id}-friend-card`)).toBeDefined()

												expect(getByTestId(`join-room-${testUser2.roomId}-button`)).toBeTruthy();
								})


								fireEvent.press(getByTestId(`join-room-${testUser2.roomId}-button`))

								await waitFor(() => {
												expect(getByTestId('group-session-screen')).toBeTruthy();
								})
				})
})

