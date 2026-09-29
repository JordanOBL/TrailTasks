import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import RestorePurchasesButton from './RestorePurchasesButton';

const mockRestorePurchases = jest.fn();
let mockAuthContext: any;

jest.mock('../../services/AuthContext', () => ({
  useAuthContext: () => mockAuthContext,
}));

jest.mock('../../contexts/ThemeProvider', () => ({
  useTheme: jest.fn(() => ({
    theme: {
      background: '#000000',
      button: '#00aaaa',
      shadow: '#000000',
    },
  })),
}));

describe('RestorePurchasesButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    mockRestorePurchases.mockResolvedValue({ entitlements: { active: { pro: {} } } });
    mockAuthContext = {
      restorePurchases: mockRestorePurchases,
      revenueCatLoading: false,
      revenueCatError: '',
      revenueCatConfigured: true,
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('restores purchases through AuthContext so entitlement state updates centrally', async () => {
    const screen = render(<RestorePurchasesButton />);

    fireEvent.press(screen.getByTestId('restore-purchases-button'));

    await waitFor(() => {
      expect(mockRestorePurchases).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith('✅ Restored', 'Your purchases have been restored!');
    });
  });

  it('disables restore while RevenueCat is unavailable so the SDK is not called blindly', () => {
    mockAuthContext = {
      restorePurchases: mockRestorePurchases,
      revenueCatLoading: false,
      revenueCatError: 'RevenueCat unavailable in this build.',
      revenueCatConfigured: false,
    };

    const screen = render(<RestorePurchasesButton />);
    const button = screen.getByTestId('restore-purchases-button');

    expect(button.props.accessibilityState?.disabled).toBe(true);
    expect(screen.getByText('Restore unavailable')).toBeTruthy();

    fireEvent.press(button);

    expect(mockRestorePurchases).not.toHaveBeenCalled();
  });
});
