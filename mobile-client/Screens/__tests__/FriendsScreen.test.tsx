import { render } from '@testing-library/react-native';
import React from 'react';

import FriendsScreen from '../FriendsScreen';

describe('Friends Screen deferred MVP wrapper', () => {
  test('shows the coming soon screen without mounting friend/social controls', () => {
    const { getByTestId, getByText, queryByTestId } = render(<FriendsScreen />);

    expect(getByTestId('coming-soon-screen')).toBeTruthy();
    expect(getByText('Friends are coming soon')).toBeTruthy();
    expect(queryByTestId('friend-search-input')).toBeNull();
  });
});
