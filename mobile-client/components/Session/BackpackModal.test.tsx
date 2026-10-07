import React from 'react';
import { render } from '@testing-library/react-native';

import { BackpackModal } from './BackpackModal';

let mockIsProMember = true;

jest.mock('../AddOnStore/AddonListItem', () => {
  const { Text } = require('react-native');
  return () => <Text>Addon item</Text>;
});

jest.mock('../../services/AuthContext', () => ({
  useAuthContext: jest.fn(() => ({
    isProMember: mockIsProMember,
  })),
}));

const baseSessionCfg = {
  backpack: [
    { addon: null, minimumTotalMiles: 0 },
    { addon: null, minimumTotalMiles: 75 },
  ],
};

describe('BackpackModal mileage unlocks', () => {
  beforeEach(() => {
    mockIsProMember = true;
  });

  it('uses derived totalMiles for slot unlocks instead of stale user.totalMiles', () => {
    const screen = render(
      <BackpackModal
        isVisible={true}
        onClose={jest.fn()}
        sessionCfg={baseSessionCfg as any}
        setSessionCfg={jest.fn()}
        user={{ totalMiles: '0.00', isProMember: true } as any}
        totalMiles={75}
        usersAddons={[]}
      />,
    );

    expect(screen.getAllByText('+')).toHaveLength(2);
    expect(screen.queryByText('Unlock at 75')).toBeNull();
  });

  it('uses active RevenueCat entitlement state to hide stale Pro slot labels', () => {
    const screen = render(
      <BackpackModal
        isVisible={true}
        onClose={jest.fn()}
        sessionCfg={{
          backpack: [
            { addon: null, minimumTotalMiles: 0 },
            { addon: null, minimumTotalMiles: 75 },
            { addon: null, minimumTotalMiles: 150 },
          ],
        } as any}
        setSessionCfg={jest.fn()}
        user={{ totalMiles: '0.00', isProMember: false } as any}
        totalMiles={75}
        usersAddons={[]}
      />,
    );

    expect(screen.getByText('Unlock at 150')).toBeTruthy();
    expect(screen.queryByText('Pro\nUnlock at 150')).toBeNull();
  });
});
