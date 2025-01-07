import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import App from '../../App';
import RegisterScreen from '../RegisterScreen';
import {testDb as watermelonDatabase} from '../../watermelon/testDB';
import {createMockUserBase} from '../../__mocks__/UserModel';
import {sync} from '../../watermelon/sync';
import {DatabaseProvider} from '@nozbe/watermelondb/react';
import {AuthProvider} from '../../services/AuthContext';
import {InternetConnectionProvider} from '../../contexts/InternetConnectionProvider';
import {screen,getByTestId,queryByTestId, queryByText} from '@testing-library/react-native';
import NetInfo from '@react-native-community/netinfo';
import {register} from '../../hooks/useAuth';
import {checkGlobalUserExists} from '../../services/auth';

import {Pool} from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_CONNECTION_STRING });

const mockUser = createMockUserBase();

describe('Register',()=>{
	//reset MasterDb

	// Reset the local database
	afterEach(async () => {
		await watermelonDatabase.write(async () => {
			await watermelonDatabase.unsafeResetDatabase();
		})

		await pool.query('TRUNCATE TABLE users CASCADE');

		jest.clearAllMocks();
	})

	//Disconnect from master Db
	afterAll(async ()=>{
		await pool.end();
	})



	test('registers new user and logs in', async ()=>{
		//bootsrap initall data from masterdb to local
		await sync(watermelonDatabase, true);

		//assert no users in DB
		await waitFor(async () => {
			const users = await watermelonDatabase.collections.get('users').query().fetch()
			expect(users).toHaveLength(0);
		})

		const {getByTestId,queryByTestId} = render(
			<DatabaseProvider database={watermelonDatabase}>
				<InternetConnectionProvider>
					<AuthProvider>
						<RegisterScreen />
					</AuthProvider>
				</InternetConnectionProvider>
			</DatabaseProvider>)

		// Wait for register-screen
		await waitFor(() => {
			expect(getByTestId('register-screen')).toBeTruthy();
		});

		await waitFor(async () => {
			fireEvent.changeText(getByTestId('first-name-input'),mockUser.firstName);

			fireEvent.changeText(getByTestId('last-name-input'),mockUser.lastName);
			fireEvent.changeText(getByTestId('email-input'),mockUser.email);
			fireEvent.changeText(getByTestId('password-input'),mockUser.password);
			fireEvent.changeText(getByTestId('confirm-password-input'),mockUser.password);
			fireEvent.changeText(getByTestId('username-input'),mockUser.username);

		})
		// Enter details of mock user to register

		// Press create account button
		fireEvent.press(getByTestId('create-account-button'));

		await waitFor(async () => {
			const addedusers = await watermelonDatabase.collections.get('users').query().fetch()
			expect(addedusers).toHaveLength(1);
		}, 10000)

	
	})
	test('shows error if email already exists', async ()=>{
		 // Mock the `sync` function dynamically for this test
		const syncSpy = jest.spyOn(require('../../watermelon/sync'), 'sync');
		syncSpy.mockImplementation(() => Promise.resolve()); // Mock behavior

		await pool.query('INSERT INTO users (id, username, email, password, first_name, last_name, trail_started_at, trail_tokens, total_miles, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', ['ABC123', mockUser.username, mockUser.email, mockUser.password, mockUser.firstName, mockUser.lastName, mockUser.trailStartedAt, mockUser.trailTokens, mockUser.totalMiles, new Date(), new Date()]);

		const {getByTestId,queryByTestId} = render(
			<DatabaseProvider database={watermelonDatabase}>
				<InternetConnectionProvider>
					<AuthProvider>
						<RegisterScreen />
					</AuthProvider>
				</InternetConnectionProvider>
			</DatabaseProvider>)

		// Wait for register-screen
		await waitFor(() => {
			expect(getByTestId('register-screen')).toBeTruthy();
		});
		fireEvent.changeText(getByTestId('first-name-input'),mockUser.firstName);

		fireEvent.changeText(getByTestId('last-name-input'),mockUser.lastName);
		fireEvent.changeText(getByTestId('email-input'),mockUser.email);
		fireEvent.changeText(getByTestId('password-input'),mockUser.password);
		fireEvent.changeText(getByTestId('confirm-password-input'),mockUser.password);
		fireEvent.changeText(getByTestId('username-input'),mockUser.username);

		// Press create account button
		fireEvent.press(getByTestId('create-account-button'));

		await waitFor(async () => {
			expect(queryByTestId('register-error')).toHaveTextContent('Email already exists')
		})
		syncSpy.mockRestore();
	})
	test('shows error if username already exists', async ()=>{
		 // Mock the `sync` function dynamically for this test
		const syncSpy = jest.spyOn(require('../../watermelon/sync'), 'sync');
		syncSpy.mockImplementation(() => Promise.resolve()); // Mock behavior
		
		//change the email because it will check that first
		//keep username the same so that error logs
		await pool.query('INSERT INTO users (id, username, email, password, first_name, last_name, trail_started_at, trail_tokens, total_miles, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', ['ABC123', mockUser.username, 'DifferentEmail', mockUser.password, mockUser.firstName, mockUser.lastName, mockUser.trailStartedAt, mockUser.trailTokens, mockUser.totalMiles, new Date(), new Date()]);

		const {getByTestId,queryByTestId} = render(
			<DatabaseProvider database={watermelonDatabase}>
				<InternetConnectionProvider>
					<AuthProvider>
						<RegisterScreen />
					</AuthProvider>
				</InternetConnectionProvider>
			</DatabaseProvider>)

		// Wait for register-screen
		await waitFor(() => {
			expect(getByTestId('register-screen')).toBeTruthy();
		});
		fireEvent.changeText(getByTestId('first-name-input'),mockUser.firstName);

		fireEvent.changeText(getByTestId('last-name-input'),mockUser.lastName);
		fireEvent.changeText(getByTestId('email-input'),mockUser.email);
		fireEvent.changeText(getByTestId('password-input'),mockUser.password);
		fireEvent.changeText(getByTestId('confirm-password-input'),mockUser.password);
		fireEvent.changeText(getByTestId('username-input'),mockUser.username);

		// Press create account button
		fireEvent.press(getByTestId('create-account-button'));

		await waitFor(async () => {
			expect(queryByTestId('register-error')).toHaveTextContent('Username already exists')
		})
		syncSpy.mockRestore();
	})


	test('shows error if passwords do not match', async ()=>{
		// Mock the `sync` function dynamically for this test
		const syncSpy = jest.spyOn(require('../../watermelon/sync'), 'sync');
		syncSpy.mockImplementation(() => Promise.resolve()); // Mock behavior
		const {queryByText,getByTestId,queryByTestId} = render(
			<DatabaseProvider database={watermelonDatabase}>
				<InternetConnectionProvider>
					<AuthProvider>
						<RegisterScreen />
					</AuthProvider>
				</InternetConnectionProvider>
			</DatabaseProvider>)

		await waitFor(async () => {
			fireEvent.changeText(getByTestId('first-name-input'),mockUser.firstName);

			fireEvent.changeText(getByTestId('last-name-input'),mockUser.lastName);
			fireEvent.changeText(getByTestId('email-input'),mockUser.email);
			fireEvent.changeText(getByTestId('password-input'),mockUser.password);
			fireEvent.changeText(getByTestId('confirm-password-input'), 'UnmatchedPASSWORD');
			fireEvent.changeText(getByTestId('username-input'),mockUser.username);

		})

		// Enter details of mock user to register
		// Press create account button
		fireEvent.press(getByTestId('create-account-button'));
		// Wait for register-screen
		await waitFor(() => {
			expect(getByTestId('register-error')).toBeTruthy();
			expect(screen.queryByText( "Passwords do not match")).toBeOnTheScreen();
		});
		syncSpy.mockRestore();
	})

})
