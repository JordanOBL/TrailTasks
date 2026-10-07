import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useAuth } from './useAuth';
import {
  checkGlobalUserExists,
  checkLocalUserExists,
  createNewUser,
  registerValidation,
  setLocalStorageUser,
} from '../services/auth';
import { sync } from '../watermelon/sync';

jest.mock('../contexts/InternetConnectionProvider', () => ({
  useInternetConnection: () => ({ isConnected: true }),
}));

jest.mock('../helpers/RevenueCat/useRevenueCat', () => () => ({
  currentOffering: null,
  customerInfo: null,
  isProMember: false,
  loading: false,
  error: null,
  purchasePackage: jest.fn(),
  restorePurchases: jest.fn(),
}));

jest.mock('../services/auth', () => ({
  checkForLoggedInUser: jest.fn(),
  checkGlobalUserExists: jest.fn(),
  checkLocalUserExists: jest.fn(),
  createNewUser: jest.fn(),
  registerValidation: jest.fn(),
  setLocalStorageUser: jest.fn(),
}));

jest.mock('../watermelon/sync', () => ({
  sync: jest.fn(),
}));

jest.mock('../helpers/ErrorHandler', () => jest.fn());

const mockCheckGlobalUserExists = checkGlobalUserExists as jest.Mock;
const mockCheckLocalUserExists = checkLocalUserExists as jest.Mock;
const mockCreateNewUser = createNewUser as jest.Mock;
const mockRegisterValidation = registerValidation as jest.Mock;
const mockSetLocalStorageUser = setLocalStorageUser as jest.Mock;
const mockSync = sync as jest.Mock;

describe('useAuth login', () => {
  const syncedLocalUser = { id: 'user-1', email: 'jordan@example.com' };
  const mockFindUserById = jest.fn();
  const watermelonDatabase = {
    localStorage: { set: jest.fn(), remove: jest.fn() },
    collections: {
      get: jest.fn(() => ({ find: mockFindUserById })),
    },
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetLocalStorageUser.mockResolvedValue(true);
    mockSync.mockResolvedValue(undefined);
    mockFindUserById.mockResolvedValue(syncedLocalUser);
  });

  it('uses full account sync then fetches the synced user by id on first remote login', async () => {
    const remoteUser = { user: { id: 'user-1', email: 'jordan@example.com' } };

    mockCheckLocalUserExists.mockResolvedValueOnce(undefined);
    mockCheckGlobalUserExists.mockResolvedValue(remoteUser);

    const { result } = renderHook(() => useAuth({ watermelonDatabase }));

    await act(async () => {
      await result.current.login('Jordan@Example.com', 'password');
    });

    expect(mockSync).toHaveBeenCalledWith(watermelonDatabase, true, 'user-1', {
      fullUserSync: true,
      pullOnly: true,
    });
    expect(watermelonDatabase.collections.get).toHaveBeenCalledWith('users');
    expect(mockFindUserById).toHaveBeenCalledWith('user-1');
    expect(mockCheckLocalUserExists).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(result.current.user).toBe(syncedLocalUser));
  });
});

describe('useAuth registration', () => {
  const serverConfirmedUser = {
    id: 'new-user-1',
    email: 'new@example.com',
    username: 'newhiker',
    markAsDeleted: jest.fn(),
  };
  const watermelonDatabase = {
    localStorage: { set: jest.fn(), remove: jest.fn() },
    collections: {
      get: jest.fn(() => ({ find: jest.fn() })),
    },
    write: jest.fn(async (callback) => callback()),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRegisterValidation.mockResolvedValue({ duplicateAttribute: '', message: '' });
    mockCreateNewUser.mockResolvedValue(serverConfirmedUser);
    mockSync.mockResolvedValue(undefined);
    mockSetLocalStorageUser.mockResolvedValue(true);
  });

  it('stores the active user only after registration sync is server-confirmed', async () => {
    const { result } = renderHook(() => useAuth({ watermelonDatabase }));

    await act(async () => {
      await result.current.register({
        email: 'New@Example.com',
        password: 'password',
        confirmPassword: 'password',
        username: 'NewHiker',
      });
    });

    expect(mockRegisterValidation).toHaveBeenCalledWith('new@example.com', 'newhiker');
    expect(mockCreateNewUser).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'password',
      username: 'newhiker',
      watermelonDatabase,
    });
    expect(mockSync).toHaveBeenCalledWith(watermelonDatabase, true, 'new-user-1');
    expect(mockSetLocalStorageUser).toHaveBeenCalledWith(serverConfirmedUser, watermelonDatabase);
    expect(mockSync.mock.invocationCallOrder[0]).toBeLessThan(
      mockSetLocalStorageUser.mock.invocationCallOrder[0],
    );
    await waitFor(() => expect(result.current.user).toBe(serverConfirmedUser));
  });

  it('does not log in or persist local storage when registration sync fails', async () => {
    mockSync.mockRejectedValueOnce(new Error('push failed'));

    const { result } = renderHook(() => useAuth({ watermelonDatabase }));

    await act(async () => {
      await result.current.register({
        email: 'New@Example.com',
        password: 'password',
        confirmPassword: 'password',
        username: 'NewHiker',
      });
    });

    expect(mockCreateNewUser).toHaveBeenCalled();
    expect(mockSetLocalStorageUser).not.toHaveBeenCalled();
    expect(watermelonDatabase.write).toHaveBeenCalled();
    expect(serverConfirmedUser.markAsDeleted).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe(
      'Account creation could not be confirmed. Please try again while online.',
    );
  });
});
