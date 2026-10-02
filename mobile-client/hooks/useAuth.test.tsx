import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useAuth } from './useAuth';
import {
  checkGlobalUserExists,
  checkLocalUserExists,
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
