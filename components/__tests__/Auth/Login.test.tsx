import { fireEvent, waitFor, getByTestId, render } from '@testing-library/react-native';
import LoginForm from '../../Auth/LoginForm';

describe("LoginForm Component", () => {
	test('renders login form', async () => {
		// Wait for the login screen to appear
		const {getByTestId} = render(<LoginForm />);
		await waitFor(() => {
			expect(getByTestId('login-form')).toBeDefined();
			expect(getByTestId('email-input')).toBeDefined();
			expect(getByTestId('password-input')).toBeDefined();
			expect(getByTestId('login-button')).toBeDefined();
		});
	});
	})

