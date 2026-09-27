import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import RestorePurchasesButton from './RestorePurchasesButton';

const mockRestorePurchases = jest.fn();

jest.mock('../../services/AuthContext', () => ({
  useAuthContext: () => ({
    restorePurchases: mockRestorePurchases,
  }),
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
});
