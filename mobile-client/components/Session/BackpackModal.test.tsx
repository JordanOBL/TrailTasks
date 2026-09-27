import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { BackpackModal } from './BackpackModal';

jest.mock('../AddOnStore/AddonListItem', () => {
  const { Text } = require('react-native');
  return () => <Text>Addon item</Text>;
});

const baseSessionCfg = {
  backpack: [
    { addon: null, minimumTotalMiles: 0 },
    { addon: null, minimumTotalMiles: 75 },
  ],
};

describe('BackpackModal mileage unlocks', () => {
  it('uses derived totalMiles for slot unlocks instead of cached user.totalMiles', () => {
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
});
