import {Cached_Friend} from '../../watermelon/models';
import React from 'react';
import {render, getByTestId} from '@testing-library/react-native';
import FriendCard from './FriendCard';
import {TestWrapper} from '../TestWrapper';
import GroupSessionScreen from '../GroupSessionScreen'; 

const testFriend:Cached_Friend ={
  id: 1,
  friendId: 'testFriendId',
  userId: 'testUserId',
  username: 'testFriendUsername',
  totalMiles: '100.00',
  currentTrail: 'testTrail',
  roomId: 'testRoom'
}

describe('FriendCard', () => {
  test('FriendCard renders correctly', () => {
    const {getByTestId} = render(<FriendCard friend={testFriend} isConnected={true}/>)
    expect(getByTestId('testFriendId-friend-card')).toBeTruthy();
    expect(getByTestId('testFriendId-friend-username')).toHaveTextContent('testFriendUsername');
    expect(getByTestId('testFriendId-friend-level')).toHaveTextContent('Level: 47');
    expect(getByTestId('testFriendId-friend-rank')).toHaveTextContent('Advanced Alpine Ace');
    expect(getByTestId('testFriendId-friend-total-miles')).toHaveTextContent('100.00 miles');
    expect(getByTestId('testFriendId-friend-trail')).toHaveTextContent('Currently hiking: testTrail');
    expect(getByTestId('join-room-testRoom-button')).toBeTruthy();
  })

})
