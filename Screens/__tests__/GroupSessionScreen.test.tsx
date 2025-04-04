import {queryByTestId, render, waitFor, fireEvent, screen} from '@testing-library/react-native';
import React, {useState} from 'react';
import GroupSessionScreen from '../GroupSessionScreen';
import {testDb as watermelonDatabase} from '../../watermelon/testDB';
import {createMockUserBase, createUser} from '../../__mocks__/UserModel';
import {DatabaseProvider} from '@nozbe/watermelondb/react';
import {AuthProvider} from '../../services/AuthContext';
import {InternetConnectionProvider} from '../../contexts/InternetConnectionProvider';
import {sync} from '../../watermelon/sync';
import {TestWrapper} from '../../__mocks__/TestWrapper';

describe('GroupSessionScreen', () => {

	const mockUserA = createMockUserBase({
		id: 'A',
		username: 'mockusernameA',
		email: 'mockemailA@example.com',
		password: 'mockPasswordA',
	});
	const mockUserB = createMockUserBase({
		id: 'B',
		username: 'mockusernameB',
		email: 'mockemailB@example.com',
		password: 'mockPasswordB',
	});

	let testUserA, testUserB
	// Reset the local database
	beforeAll(async () => {
		await watermelonDatabase.write(async () => {
			await watermelonDatabase.unsafeResetDatabase();
		})
		await sync(watermelonDatabase, true);
		testUserA = await createUser(watermelonDatabase, mockUserA);
		testUserB = await createUser(watermelonDatabase, mockUserB);
	})

	afterAll(async () => {
		await watermelonDatabase.write(async () => {
			await watermelonDatabase.unsafeResetDatabase();
		})
	})



	it('renders correctly', async () => {
		const debugRefA = React.createRef();
		const {queryByTestId, getByTestId} = render(<TestWrapper>
			<GroupSessionScreen user={testUserA} debugRef={debugRefA}  />
		</TestWrapper>);	
		expect(queryByTestId('group-session-screen')).toBeTruthy();
		await waitFor(() => {
			expect(debugRefA.current.serverUrl).toBe('ws://127.0.0.1:8080/groupsession');	
			expect(getByTestId('create-room-button')).toBeTruthy();
			expect(getByTestId('join-room-button')).toBeTruthy();
		})
	});

	it('creates a new room and shows lobby', async () => {
		const debugRefA = React.createRef();
		const {queryByTestId, getByTestId} = render(<TestWrapper>
			<GroupSessionScreen user={testUserA} debugRef={debugRefA}  />
		</TestWrapper>);	
		expect(queryByTestId('group-session-screen')).toBeTruthy();
		await waitFor(() => {
			expect(debugRefA.current.serverUrl).toBe('ws://127.0.0.1:8080/groupsession');	
			expect(getByTestId('create-room-button')).toBeTruthy();
			expect(getByTestId('join-room-button')).toBeTruthy();
		})

		//creates a room
		//adds user to the room
		fireEvent.press(getByTestId('create-room-button'));
		await waitFor(() => {
			//gets roomId from server
			expect(debugRefA.current.roomId).toBeTruthy();
			//adds user to room
			expect(debugRefA.current.hikers[testUserA.id]).toBeTruthy();
			//changes to lobby screen
			expect(debugRefA.current.view).toBe('lobby');
			//shows hikers username in room
			expect(screen.getByText(testUserA.username)).toBeTruthy();
		})
	})

	it('allows user to join room and shows appropriate messages', async () => {
		const debugRefA = React.createRef();
		const debugRefB = React.createRef();
		//render user A
		const {queryByTestId: queryByTestIdA, getByTestId: getByTestIdA} = render(<TestWrapper>
			<GroupSessionScreen user={testUserA} debugRef={debugRefA}  />
		</TestWrapper>);

	
		await waitFor(() => {
			//test user A screen is ready
			expect(debugRefA.current.serverUrl).toBe('ws://127.0.0.1:8080/groupsession');
			expect(getByTestIdA('create-room-button')).toBeTruthy();
			expect(getByTestIdA('join-room-button')).toBeTruthy();
		})

		//create room by userA
		fireEvent.press(getByTestIdA('create-room-button'));
		await waitFor(() => {
			console.log('debugRefA creates room',debugRefA.current)
			//gets roomId from server
			expect(debugRefA.current.roomId).toBeTruthy();
			//adds user to room
			expect(debugRefA.current.hikers[testUserA.id]).toBeTruthy();
			//changes to lobby screen
			expect(debugRefA.current.view).toBe('lobby');
			//shows hikers username in room
			expect(screen.getByText(testUserA.username)).toBeTruthy();
			//shows hiker status Not Ready
			expect(getByTestIdA(`hiker-${testUserA.id}-status`)).toHaveTextContent('Not Ready');
		})

		//toggle ready Hiker A
		fireEvent.press(getByTestIdA('toggle-ready-button'));
		await waitFor(() => {
			//shows hiker status Ready
			expect(getByTestIdA(`hiker-${testUserA.id}-status`)).toHaveTextContent('Ready');
			//expect start session button to be available since all (1 user) hikers are ready
			expect(getByTestIdA('start-group-session-button')).toBeDefined();
		})

		fireEvent.press(queryByTestIdA('configure-session-button'));
		await waitFor(() => {
			//starts session
			expect(getByTestIdA('settings-modal')).toBeDefined();
		})
		fireEvent.changeText(getByTestIdA('session-name-input'),'Test Session');
		fireEvent.press(getByTestIdA('save-close-settings-button'));
		await waitFor(() => {
			expect(debugRefA.current.session.name).toBe('Test Session');
		})
	

		

	//render user B
		const {queryByTestId: queryByTestIdB, getByTestId: getByTestIdB} = render(<TestWrapper>
			<GroupSessionScreen user={testUserB} debugRef={debugRefB}  />
		</TestWrapper>);

		await waitFor(() => {
					//test user B screen is ready
			expect(debugRefB.current.serverUrl).toBe('ws://127.0.0.1:8080/groupsession');
			expect(getByTestIdB('create-room-button')).toBeTruthy();
			expect(getByTestIdB('join-room-button')).toBeTruthy();
		})


		// userB joins Hiker A's Room
		// input hiker A's roomId
		fireEvent.changeText(getByTestIdB('join-room-input'), debugRefA.current.roomId);

		//click	join room
		fireEvent.press(queryByTestIdB('join-room-button'));
		await waitFor(() => {
			//gets roomId from server
			//adds user to room
			expect(debugRefB.current.hikers[testUserB.id]).toBeTruthy();
			//changes to lobby screen
			expect(debugRefB.current.view).toBe('lobby');
			//shows hikers username in room
			expect(screen.getByText(testUserB.username)).toBeTruthy();
			//shows hikerB status Not Ready
			expect(getByTestIdB(`hiker-${testUserB.id}-status`)).toHaveTextContent('Not Ready');
			//expect join button to be gone because not all hikers (user B) are ready
			expect(queryByTestIdA('start-group-session-button')).toBeNull();
			//shows hiker B that user A is in room and not ready
			//shows both users on both screens
			expect(queryByTestIdA(`hiker-${testUserA.id}-name`)).toBeTruthy();
			expect(queryByTestIdA(`hiker-${testUserB.id}-name`)).toBeTruthy();

			expect(queryByTestIdB(`hiker-${testUserA.id}-name`)).toBeTruthy();
			expect(queryByTestIdB(`hiker-${testUserB.id}-name`)).toBeTruthy();
			expect(debugRefB.current.session.name).toBe('Test Session');
		})

		//ready userB
		//Ready hiker A(Both should Be ready After this)
		fireEvent.press(getByTestIdB(`toggle-ready-button`));
		await waitFor(() => {
			//shows hiker A that user B is in room and ready
			expect(queryByTestIdA(`hiker-${testUserB.id}-status`)).toHaveTextContent('Ready');
			//shows hiker B that user B is in room and ready
			expect(queryByTestIdB(`hiker-${testUserA.id}-status`)).toHaveTextContent('Ready');

			//expect start session button to be available becasue both hikers are ready
			expect(queryByTestIdA('start-group-session-button')).toBeTruthy();
			//start button only available to host
			expect(queryByTestIdB('start-group-session-button')).toBeFalsy();
		})

	

	


	})




})
