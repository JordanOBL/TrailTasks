import {useState} from 'react';
import { fireEvent, render, waitFor, act, getByTestId, queryByTestId } from '@testing-library/react-native';
import {testDb as watermelonDatabase} from '../../watermelon/testDB';
import {createMockUserBase} from '../../__mocks__/UserModel';
import {sync} from '../../watermelon/sync';
import {DatabaseProvider} from '@nozbe/watermelondb/react';
import {AuthProvider} from '../../services/AuthContext';
import {checkForLoggedInUser} from '../../services/auth';
import {InternetConnectionProvider} from '../../contexts/InternetConnectionProvider';
import AuthScreen from '../AuthScreen';

describe('AuthScreen', () => {

	test('it renders login screen by default', async () => {
		const {getByTestId, queryByTestId} = render(
			<DatabaseProvider database={watermelonDatabase}>
				<InternetConnectionProvider>
					<AuthProvider>
						<AuthScreen form="login" handleFormChange={() => {}} />
					</AuthProvider>
				</InternetConnectionProvider>
			</DatabaseProvider>
		)

		await waitFor(() => {
			expect(getByTestId('login-screen')).toBeTruthy();
			expect(queryByTestId('register-screen')).not.toBeTruthy();

		})

	})
	test('it renders register screen when form prop = register', async () => {
		const {getByTestId, queryByTestId} = render(
			<DatabaseProvider database={watermelonDatabase}>
				<InternetConnectionProvider>
					<AuthProvider>
						<AuthScreen form="register" handleFormChange={() => {}} />
					</AuthProvider>
				</InternetConnectionProvider>
			</DatabaseProvider>
		)

		await waitFor(() => {
			expect(getByTestId('register-screen')).toBeTruthy();
			expect(queryByTestId('login-screen')).not.toBeTruthy();

		})

	})
	test('changes to login screen when register screen login button is clicked', async () => {


		const TestWrapper = () => {
			const [form, setForm] = useState('register');

		

			return (
				<DatabaseProvider database={watermelonDatabase}>
					<InternetConnectionProvider>
						<AuthProvider>
							<AuthScreen form={form} handleFormChange={() => setForm(prev => (prev === 'login' ? 'register' : 'login'))} />
						</AuthProvider>
					</InternetConnectionProvider>
				</DatabaseProvider>
			);
		};


		const {getByTestId, queryByTestId} = render(<TestWrapper />);

		// Assert that the register screen is initially displayed
		await waitFor(() => {
			expect(getByTestId('register-screen')).toBeTruthy();
			expect(queryByTestId('first-name-input')).toBeTruthy();
			expect(queryByTestId('last-name-input')).toBeTruthy();
			expect(getByTestId('email-input')).toBeTruthy();
			expect(getByTestId('password-input')).toBeTruthy();
			expect(getByTestId('confirm-password-input')).toBeTruthy();
			expect(getByTestId('login-form-button')).toBeTruthy();
			expect(queryByTestId('create-account-button')).toBeTruthy();
		});

		// Simulate pressing the "login" button
		fireEvent.press(getByTestId('login-form-button'));

		// Assert that handleFormChange was called with the correct argument
		await waitFor(() => {
			expect(queryByTestId('login-screen')).toBeTruthy();
		})


	})


	test('changes to register screen when login screen register button is clicked', async () => {
			const TestWrapper = () => {
			const [form, setForm] = useState('login');

		

			return (
				<DatabaseProvider database={watermelonDatabase}>
					<InternetConnectionProvider>
						<AuthProvider>
							<AuthScreen form={form} handleFormChange={() => setForm(prev => (prev === 'login' ? 'register' : 'login'))} />
						</AuthProvider>
					</InternetConnectionProvider>
				</DatabaseProvider>
			);
		};


		const {getByTestId, queryByTestId} = render(<TestWrapper />);

		await waitFor(() => {
			expect(getByTestId('login-screen')).toBeTruthy();
	                expect(getByTestId('email-input')).toBeTruthy();
	                expect(getByTestId('password-input')).toBeTruthy();
	                expect(queryByTestId('login-button')).toBeTruthy();
		})
                fireEvent.press(getByTestId('register-form-button'));

		await waitFor(() => {
			expect(getByTestId('register-screen')).toBeTruthy();
		})
		

	})


})

