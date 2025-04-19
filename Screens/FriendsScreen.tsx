import { StyleSheet, Text, View, FlatList } from 'react-native'
import SearchAddFriend from '../components/Friends/SearchAddFriend';
import FriendsList from '../components/Friends/FriendsList';
import { useNavigation } from '@react-navigation/native';
import React from 'react'
import { useInternetConnection } from "../hooks/useInternetConnection";
import RefreshConnection from "../components/RefreshConnection";
import FriendCard from "../components/Friends/FriendCard"; 
 import {withObservables} from '@nozbe/watermelondb/react';
import {useDatabase} from '@nozbe/watermelondb/react';
import Config from 'react-native-config';
import {Cached_Friend} from '../watermelon/models';

const FriendsScreen = ({ user, cachedFriends, navigation, friends}) => {
  //const [cachedFriends, setCachedFriends] = React.useState([]);
  const watermelonDatabase = useDatabase();
  const {isConnected} = useInternetConnection();
  const cachedFriendsMap = cachedFriends.reduce((acc, friend, idx) => {
    acc.set(friend.friendId, idx);
    return acc;
  }, new Map())
  async function handleJoinSession(roomId) {
    console.log('joining room', roomId)
    navigation.navigate('Timer', { screen: 'Group',params: { joinRoomId: roomId } });

  }
  console.log('cachedFriends', cachedFriends)
  React.useEffect(() => {

    async function fetchOnlineFriends() {
      //fetch friends joined on friends user_id from server
      const latestCachedFriends = await fetch(`http://${Config.DATABASE_URL}/api/cachedFriends?userId=${user.id}`)
      const { friends: recentFriendsFromServerMap } = await latestCachedFriends.json()
  
      if (Object.keys(recentFriendsFromServerMap).length === 0) {
        return;
      }

      //turn newCachedFriendsMap into an array
      const recentFriendsFromServerEntries = Object.entries(recentFriendsFromServerMap)
      //loop over the most recent friend data from the server
      //if  isnt new in the cache
        //update the friend in cached friends
        //else
      //create a new friend in cached friends
      //Batch updated cachedFriends or create new cahced Friends
       let friendBatch = recentFriendsFromServerEntries.map(([friend_id, friend]) => {
        if(cachedFriendsMap.has(friend_id)){
          console.log('already cached friend')
          const prevCachedFriend = cachedFriends[cachedFriendsMap.get(friend_id)]
          console.debug('prevCachedFriend', prevCachedFriend)
          if(prevCachedFriend.totalMiles != friend.total_miles || prevCachedFriend.currentTrail != friend.current_trail || prevCachedFriend.roomId != friend.room_id){
            console.log('updated cached friend found')
            return prevCachedFriend.prepareUpdate(f => {
              f.totalMiles = friend.total_miles
              f.currentTrail = friend.current_trail
              f.roomId = friend.room_id
             // f._raw._status = 'synced'
            })
          }
        } else {
          console.log('new cached friend')
            return watermelonDatabase.get('cached_friends').prepareCreate(f => {
              f.userId = user.id
              f.friendId = friend.friend_id
              f.username = friend.username
              f.totalMiles = friend.total_miles
              f.currentTrail = friend.current_trail
              f.roomId = friend.room_id
             // f._raw._status = 'synced'
            })
          }
        })
      friendBatch = friendBatch.filter(query => query != undefined)
     console.debug('friendBatch', friendBatch) 

      //Batch updated friends or create new friends
    if(friendBatch.length  ){
     await watermelonDatabase.write(async () => {
        await watermelonDatabase.batch( ...friendBatch )
      })
    }
    }

    if(isConnected && user){
      //fetch new cached friends data from friends table
      console.log('fetching friends')
      fetchOnlineFriends()
    }
    

    return () => {
      console.log('clean up')
    }
  }, [cachedFriends, friends, user])

  return (
    <View testID='friends-screen'>
      <Text>FriendsScreen</Text>
      {!isConnected &&  <RefreshConnection>
        {`Internet Connection is Needed to view latest Friend Activity\nTry Refreshing Connection`}
      </RefreshConnection>
      }

      <SearchAddFriend database={watermelonDatabase} key={user.id} user={user} isConnected={isConnected} />
      <FriendsList cachedFriends={cachedFriends} isConnected={isConnected} handleJoinSession={handleJoinSession} />
    </View>
  )
}

const enhance = withObservables(['user'], ({ user, cachedFriends, friends }) => ({
  user , 
  cachedFriends: user.cachedFriends.observe(),
  friends: user.friends.observe(),
}));
const EnhancedFriendsScreen = enhance(FriendsScreen)
export default EnhancedFriendsScreen


