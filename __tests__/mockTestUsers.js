import formatDateTime from '../helpers/formatDateTime';

const trailStartedAt = formatDateTime(new Date());
export const MockTestUsers = {
  // Mocked user data
  existingUserDetails: {
    firstName: 'existing',
    lastName: 'user',
    email: 'existing@example.com',
    password: 'password',
    confirmPassword: 'password',
    username: 'existing',
    pushNotificationsEnabled: true,
    themePreference: 'light',
    trailId: '1',
    trailProgress: '0.0',
    traiStartedAt: trailStartedAt,
  },
  unfoundUserDetails: {
    firstName: 'unfound',
    lastName: 'user',
    email: 'unfound@example.com',
    password: 'password',
    confirmPassword: 'password',
    username: 'unfound',
  },
};
