import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { BackpackModal } from './BackpackModal';

let mockIsProMember = true;

test.each([false, true])('rejects a different pole level without changing the backpack (reverse=%s)', reverse => {
  const levels = [
    { id: '1', name: 'Hiking Poles I', effectType: 'pace_increase_interval' },
    { id: '2', name: 'Hiking Poles II', effectType: 'pace_increase_interval' },
  ];
  if (reverse) levels.reverse();
  const setSessionCfg = jest.fn();
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  try {
    const screen = render(<BackpackModal isVisible onClose={jest.fn()}
      sessionCfg={{ backpack: [{ addon: levels[0], minimumTotalMiles: 0 }, { addon: null, minimumTotalMiles: 75 }] } as any}
      setSessionCfg={setSessionCfg} user={{} as any} totalMiles={75}
      usersAddons={[{ addon: levels[1] }] as any} />);
    fireEvent.press(screen.getByText(levels[1].name));
    expect(setSessionCfg).not.toHaveBeenCalled();
    expect(alert).toHaveBeenCalledWith(expect.any(String), expect.stringMatching(/remove|different level/i));
  } finally { alert.mockRestore(); }
});

jest.mock('../AddOnStore/AddonListItem', () => {
  const { Text } = require('react-native');
  return ({ userAddon, selectAddon }: any) => <Text onPress={() => selectAddon(userAddon.addon)}>{userAddon.addon.name}</Text>;
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
