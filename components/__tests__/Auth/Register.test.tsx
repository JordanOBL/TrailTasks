import { render, screen, waitFor, fireEvent, getByTestId, queryByTestId } from '@testing-library/react-native';
import NetInfo  from '@react-native-community/netinfo';
import RegisterForm from '../../../components/Auth/RegisterForm';
import { createMockUserBase } from '../../../__mocks__/UserModel';
import { InternetConnectionProvider } from '../../../contexts/InternetConnectionProvider';

describe('RegisterForm Component', () => {
	test('Renders register form', async () => {
		const mockUser = createMockUserBase()
		const {getByTestId,queryByTestId} = render(
			<InternetConnectionProvider>
				<RegisterForm isConnected={true}/>
			</InternetConnectionProvider>
		)
		// Wait for register-screen
		await waitFor(() => {
			expect(queryByTestId('register-form')).toBeTruthy();
			expect(getByTestId('first-name-input')).toBeTruthy();
			expect(getByTestId('last-name-input')).toBeTruthy();
			expect(getByTestId('email-input')).toBeTruthy();
			expect(getByTestId('password-input')).toBeTruthy();
			expect(getByTestId('confirm-password-input')).toBeTruthy();
			expect(getByTestId('username-input')).toBeTruthy();
			expect(getByTestId('create-account-button')).toBeTruthy();
		});
	})
	test('Shows refresh button if not connected to internet', async ()=>{
		const {isConnected} = NetInfo.fetch.mockImplementationOnce(() => Promise.resolve({isConnected: false}));

		const {getByTestId,queryByTestId} = render(
			<InternetConnectionProvider>
				<RegisterForm isConnected={isConnected}/>
			</InternetConnectionProvider>
		)
		// Wait for register-screen
		await waitFor(() => {
			expect(queryByTestId('register-form')).toBeFalsy();
			expect(screen.getByText("You're currently offline. Please connect to the internet to complete your registration.")).toBeTruthy();
		});
	})
})

