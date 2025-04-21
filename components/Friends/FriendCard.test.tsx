import {Cached_Friend} from '../../watermelon/models';
import React from 'react';
import {render, getByTestId, fireEvent} from '@testing-library/react-native';
import EnhancedFriendCard from './FriendCard';
import {TestWrapper} from '../TestWrapper';
import GroupSessionScreen from '../GroupSessionScreen'; 
import {createUser, createMockUserBase} from '../../__mocks__/UserModel';
import {testDb} from '../../watermelon/testDB';

const testFriend:Cached_Friend ={
  id: 1,
  friendId: 'testFriendId',
  userId: 'testUserId',
  username: 'testFriendUsername',
  totalMiles: '100.00',
  currentTrail: 'testTrail',
  trailProgress: '0.00',
  roomId: 'testRoom'
}

describe('FriendCard', () => {
  test('FriendCard renders correctly', async () => {
    const cachedFriend = await testDb.write(async () => {
     const cachedFriend =  await testDb.get('cached_friends').create((friend) => {
        friend.userId = testFriend.userId
        friend.friendId = testFriend.friendId
        friend.username = testFriend.username
        friend.totalMiles = testFriend.totalMiles
        friend.currentTrail = testFriend.currentTrail
        friend.trailProgress = testFriend.trailProgress
        friend.roomId = testFriend.roomId
      })
      return cachedFriend
    })

    const {getByTestId} = render(<EnhancedFriendCard friend={cachedFriend} isConnected={true}/>)
    expect(getByTestId('testFriendId-friend-card')).toBeTruthy();
    expect(getByTestId('testFriendId-friend-username')).toHaveTextContent('testFriendUsername');
    expect(getByTestId('testFriendId-friend-rank')).toHaveTextContent('Level 47 - Advanced Alpine Ace')
    expect(getByTestId('testFriendId-friend-current-trail')).toHaveTextContent('0.00 mi - testTrail')
    expect(getByTestId('testFriendId-friend-total-miles')).toHaveTextContent('Lifetime - 100.00 mi');
  })
  

})
