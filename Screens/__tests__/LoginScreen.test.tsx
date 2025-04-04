import { fireEvent, render, waitFor, screen, act } from '@testing-library/react-native';
import App from '../../App';
import {testDb as watermelonDatabase} from '../../watermelon/testDB';
import {createMockUserBase} from '../../__mocks__/UserModel';
import {sync} from '../../watermelon/sync';
import {DatabaseProvider} from '@nozbe/watermelondb/react';
import {AuthProvider} from '../../services/AuthContext';
import {checkForLoggedInUser} from '../../services/auth';
import {InternetConnectionProvider} from '../../contexts/InternetConnectionProvider';
let getByTestId: any, queryByTestId: any, rendered: any



describe('LoginScreen', () => {
	const mockUser = createMockUserBase();


	// Reset the database before each test
	afterAll(async () => {
		await watermelonDatabase.write(async () => {
			await watermelonDatabase.unsafeResetDatabase();
		});
		jest.clearAllMocks();
	});

	beforeEach(async () => {

		 rendered = render(
			<DatabaseProvider database={watermelonDatabase}>
				<InternetConnectionProvider>
				<AuthProvider>
					<App />
				</AuthProvider>
				</InternetConnectionProvider>
			</DatabaseProvider>
		);

	
		getByTestId = rendered.getByTestId;
		queryByTestId = rendered.queryByTestId
	})


	beforeAll(async () => {
		await sync(watermelonDatabase, true);

		// Render the app within providers and error boundary

		// Wait for the sync to complete by ensuring trails are loaded
		await waitFor(
			async () => {
				const trails = await watermelonDatabase.get('trails').query().fetch();
				const parks = await watermelonDatabase.get('parks').query().fetch();
				expect(trails.length).toBe(96); // Adjust based on your actual bootstrap data
				expect(parks.length).toBe(63);
			},
		);
		await watermelonDatabase.write(async () => {
			await watermelonDatabase.get('users').create((user) => {
				user.id = mockUser.id;
				user.email = mockUser.email;
				user.password = mockUser.password;
				user.username = mockUser.username;
				user.trailId = mockUser.trailId; // Ensure this matches a seeded trail
				user.trailTokens = mockUser.trailTokens;
				user.lastDailyStreakDate = mockUser.lastDailyStreakDate;
				user.prestigeLevel = mockUser.prestigeLevel;
				user.pushNotificationsEnabled = mockUser.pushNotificationsEnabled;
				user.trailStartedAt = mockUser.trailStartedAt;
				user.trailProgress = mockUser.trailProgress;
				user.totalMiles = mockUser.totalMiles;
				user.dailyStreak = mockUser.dailyStreak;
				user.themePreference = mockUser.themePreference;
				// Initialize other fields as necessary
			});
		});

	});

	afterAll(async () => {
		await watermelonDatabase.write(async () => {
			await watermelonDatabase.unsafeResetDatabase();
		});
	});

	test('renders correctly', async () => {
		await waitFor(() => {
			expect(getByTestId('login-screen')).toBeDefined();
		});
	});

	test('displays error message if credentials are incorrect', async () => {
		// Wait for the login screen to appear
		await waitFor(() => {
			expect(getByTestId('login-screen')).toBeDefined();
			expect(getByTestId('login-form')).toBeDefined();
			expect(getByTestId('email-input')).toBeDefined();
			expect(getByTestId('password-input')).toBeDefined();
			expect(getByTestId('login-button')).toBeDefined();
		});

		// Simulate incorrect login
		fireEvent.changeText(getByTestId('email-input'), 'fail@email.com');
		fireEvent.changeText(getByTestId('password-input'), 'failPassword');
		fireEvent.press(getByTestId('login-button'));

		// Assert error message
		await waitFor(() => {
			expect(getByTestId('login-error')).toBeDefined();
			expect(getByTestId('login-error')).toHaveTextContent('Incorrect Email or Password');
		});
	}); // Increase timeout for this test

	test('login button is disabled only when inputs are empty', async () => {
		// Wait for the login screen to appear
		await waitFor(() => {
			expect(getByTestId('login-screen')).toBeDefined();
			expect(getByTestId('login-button')).toBeDefined();
		});

		// Initially, login button should be disabled (assuming grey background)
		expect(getByTestId('login-button').props.style).toContainEqual(
			expect.objectContaining({ backgroundColor: 'grey' })
		);

		// Input email only
		fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
		expect(getByTestId('login-button').props.style).toContainEqual(
			expect.objectContaining({ backgroundColor: 'grey' })
		); // Still disabled because password is empty

		// Input password
		fireEvent.changeText(getByTestId('password-input'), 'password123');
		expect(getByTestId('login-button').props.style).toContainEqual(
			expect.objectContaining({ backgroundColor: 'rgb(7,254,213)' })
		); // Button should now be enabled
	}); // Increase timeout for this test

	test('existing user/password logs user into app', async () => {
			jest.mock('../../watermelon/sync',() => ({
				sync: jest.fn(() => Promise.resolve())
		})) 
					// Add user to the database after sync has completed

		// Simulate user login
		fireEvent.changeText(getByTestId('email-input'), mockUser.email);
		fireEvent.changeText(getByTestId('password-input'), mockUser.password);
		fireEvent.press(getByTestId('login-button'));

		// Wait for the homescreen to appear, indicating successful login
		await waitFor(() => {
			expect(queryByTestId('login-screen')).toBeNull()
			//expect(checkForLoggedInUser).toHaveBeenCalledWith(mockUser.email, mockUser.password);
		}); // Increase timeout as needed


	}); // Increase timeout for this test
});
