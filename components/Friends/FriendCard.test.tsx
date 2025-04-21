import {Cached_Friend} from '../../watermelon/models';
import React from 'react';
import {render, getByTestId, fireEvent} from '@testing-library/react-native';
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
  trailProgress: 0,
  roomId: 'testRoom'
}

describe('FriendCard', () => {
  test('FriendCard renders correctly', () => {
    const {getByTestId} = render(<FriendCard friend={testFriend} isConnected={true}/>)
    expect(getByTestId('testFriendId-friend-card')).toBeTruthy();
    expect(getByTestId('testFriendId-friend-username')).toHaveTextContent('testFriendUsername');
    expect(getByTestId('testFriendId-friend-rank')).toHaveTextContent('Level 47 - Advanced Alpine Ace');
    expect(getByTestId('testFriendId-friend-total-miles')).toHaveTextContent('100.00 mi - testTrail');
  })

  test('it shows join group button if action prop is join', () => {
    const {getByTestId} = render(<FriendCard friend={testFriend} isConnected={true} action='join' />)
    expect(getByTestId('join-room-testRoom-button')).toBeTruthy();
  })

  test('it shows add friend button if action prop is add', () => {
    const {getByTestId} = render(<FriendCard friend={testFriend} isConnected={true} action='add' />)
    expect(getByTestId('add-friend-testFriendId-button')).toBeTruthy();
  })

  

})
