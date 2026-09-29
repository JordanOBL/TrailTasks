import { render } from '@testing-library/react-native';
import React from 'react';

import GroupSessionScreen from '../GroupSessionScreen';

describe('GroupSessionScreen deferred MVP wrapper', () => {
  it('shows the coming soon screen without mounting group-session controls', () => {
    const { getByTestId, getByText, queryByTestId } = render(<GroupSessionScreen />);

    expect(getByTestId('coming-soon-screen')).toBeTruthy();
    expect(getByText('Group sessions are coming soon')).toBeTruthy();
    expect(queryByTestId('create-room-button')).toBeNull();
  });
});
