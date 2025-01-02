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
import {screen,getByTestId,queryByTestId} from '@testing-library/react-native';
import NetInfo from '@react-native-community/netinfo';
import {register} from '../../services/auth';

const mockUser = createMockUserBase();

describe('Register',()=>{

	test('renders correctly', async () => {
		const {getByTestId,queryByTestId} =	 render(
			<DatabaseProvider database={watermelonDatabase}>
				<InternetConnectionProvider>
					<AuthProvider>
						<RegisterScreen />
					</AuthProvider>
				</InternetConnectionProvider>
			</DatabaseProvider>)

	
		await waitFor(() => {
			expect(getByTestId('register-screen')).toBeTruthy();
			expect(getByTestId('login-form-button')).toBeTruthy();
			expect(getByTestId('first-name-input')).toBeTruthy();
			expect(getByTestId('last-name-input')).toBeTruthy();
			expect(getByTestId('email-input')).toBeTruthy();
			expect(getByTestId('password-input')).toBeTruthy();
			expect(getByTestId('confirm-password-input')).toBeTruthy();
			expect(getByTestId('username-input')).toBeTruthy();
			expect(getByTestId('create-account-button')).toBeTruthy();

			expect(queryByTestId('register-error').props.children).toBe('');
		})
	});



	test('displays registerScreen after toggling from loginScreen', async () => {
		const {getByTestId,queryByTestId} =	 render(
			<DatabaseProvider database={watermelonDatabase}>
				<InternetConnectionProvider>
					<AuthProvider>
						<App />
					</AuthProvider>
				</InternetConnectionProvider>
			</DatabaseProvider>)

		await waitFor(() => {
			// Make sure the login screen is up
			expect(getByTestId('login-screen')).toBeTruthy();
			expect(queryByTestId('register-screen')).toBeNull();
		});

		// Attempt to toggle screens
		fireEvent.press(getByTestId('register-form-button'));

		// Wait for register-screen
		await waitFor(() => {
			expect(getByTestId('register-screen')).toBeTruthy();
			expect(queryByTestId('login-screen')).toBeNull();
		});
	});
	test('Shows refresh button if not connected to internet', async ()=>{

		NetInfo.fetch.mockResolvedValueOnce({ isConnected: false });

		const {getByTestId,queryByTestId} = render(
			<DatabaseProvider database={watermelonDatabase}>
				<InternetConnectionProvider>
					<AuthProvider>
						<App />
					</AuthProvider>
				</InternetConnectionProvider>
			</DatabaseProvider>
		)
		await waitFor(() => {
			// Make sure the login screen is up
			expect(getByTestId('login-screen')).toBeTruthy();
			expect(queryByTestId('register-screen')).toBeNull();
		});

		// Attempt to toggle screens
		fireEvent.press(getByTestId('register-form-button'));

		// Wait for register-screen
		await waitFor(() => {
			expect(getByTestId('register-screen')).toBeTruthy();
			expect(queryByTestId('login-screen')).toBeNull();

			expect(screen.getByText("You're currently offline. Please connect to the internet to complete your registration.")).toBeTruthy();
		});


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
						<App />
					</AuthProvider>
				</InternetConnectionProvider>
			</DatabaseProvider>)

		await waitFor(() => {
			// Make sure the login screen is up
			expect(getByTestId('login-screen')).toBeTruthy();
		});

		// Attempt to toggle screens
		fireEvent.press(getByTestId('register-form-button'));

		// Wait for register-screen
		await waitFor(() => {
			expect(getByTestId('register-screen')).toBeTruthy();
			expect(queryByTestId('login-screen')).toBeNull();
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

})
