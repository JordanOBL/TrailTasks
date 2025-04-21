import { StyleSheet,ScrollView, Text, View, FlatList } from 'react-native'
import SearchAddFriend from '../components/Friends/SearchAddFriend';
import FriendsList from '../components/Friends/FriendsList';
import { useNavigation } from '@react-navigation/native';
import React from 'react'
import { useInternetConnection } from "../hooks/useInternetConnection";
import RefreshConnection from "../components/RefreshConnection";
import EnhancedFriendCard from "../components/Friends/FriendCard"; 
 import {withObservables} from '@nozbe/watermelondb/react';
import {useDatabase} from '@nozbe/watermelondb/react';
import Config from 'react-native-config';
import {Cached_Friend} from '../watermelon/models';
import {Button} from 'react-native-paper';
const FriendsScreen = ({ user, cachedFriends, navigation, friends}) => {
  //const [cachedFriends, setCachedFriends] = React.useState([]);
  const watermelonDatabase = useDatabase();
  const {isConnected} = useInternetConnection();
  const [refreshFriends, setRefreshFriends] = React.useState(true);

  const cachedFriendsMap = cachedFriends.reduce((acc, friend, idx) => {
    acc.set(friend.friendId, idx);
    return acc;
  }, new Map())
  async function handleJoinSession(roomId) {
    navigation.navigate('Timer', { screen: 'Group',params: { joinRoomId: roomId } });

  }
  const cachedFriendUsernames = cachedFriends.map((friend) => friend.username.toLowerCase())
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
          const prevCachedFriend = cachedFriends[cachedFriendsMap.get(friend_id)]
          if(prevCachedFriend.totalMiles != friend.total_miles || prevCachedFriend.currentTrail != friend.current_trail || prevCachedFriend.roomId != friend.room_id || prevCachedFriend.trailProgress != friend.trail_progress){
            return prevCachedFriend.prepareUpdate(f => {
              f.totalMiles = friend.total_miles
              f.currentTrail = friend.current_trail
              f.roomId = friend.room_id
              f.trailProgress = friend.trail_progress
             // f._raw._status = 'synced'
            })
          }
        } else {
            return watermelonDatabase.get('cached_friends').prepareCreate(f => {
              f.userId = user.id
              f.friendId = friend.friend_id
              f.username = friend.username
              f.totalMiles = friend.total_miles
              f.currentTrail = friend.current_trail
              f.trailProgress = friend.trail_progress
              f.roomId = friend.room_id
             // f._raw._status = 'synced'
            })
          }
        })
      friendBatch = friendBatch.filter(query => query != undefined)

      //Batch updated friends or create new friends
    if(friendBatch.length  ){
     await watermelonDatabase.write(async () => {
        await watermelonDatabase.batch( ...friendBatch )
      })
    }
      setRefreshFriends(false)
    }

    if(isConnected && user && refreshFriends){
      //fetch new cached friends data from friends table
      fetchOnlineFriends()
    }
    

    return () => {
      console.log('clean up')
    }
  }, [refreshFriends])

  return (
    <View testID='friends-screen' style={styles.container}>
      {!isConnected &&  <RefreshConnection>
        {`Internet Connection is Needed to view latest Friend Activity\nTry Refreshing Connection`}
      </RefreshConnection>
      }

      <SearchAddFriend database={watermelonDatabase} cachedFriendUsernames={cachedFriendUsernames} key={user.id} user={user} isConnected={isConnected} />
      {/*<FriendsList cachedFriends={cachedFriends} isConnected={isConnected} handleJoinSession={handleJoinSession} />*/}
      <View style={styles.titleUpdateContainer}>
      <Text style={styles.friendsTitle} testID='friends-title'>Friends:</Text>
       {isConnected && <Button style={styles.refreshButton} icon="refresh" mode="outlined" onPress={() => setRefreshFriends(true)} testID='refresh-friends-button' textColor="#07FED5" >Update</Button>}
      </View>
      <ScrollView testID='friends-list' contentContainerStyle={{paddingBottom: 100}} >
      {cachedFriends.length > 0 ? cachedFriends.map(friend => <EnhancedFriendCard key={friend.friendId} friend={friend}  isConnected={isConnected} handleAction={handleJoinSession} />) : <Text style={styles.noFriendsMessage} testID='no-friends-message'>Add a friend, or check back later</Text>
      }
      </ScrollView>
    </View>
  )
}

const enhance = withObservables(['user', 'cachedFriends'], ({ user, cachedFriends, friends }) => ({
  user , 
  cachedFriends: user.cachedFriends,
  friends: user.friends.observe(),
}));
const EnhancedFriendsScreen = enhance(FriendsScreen)
export default EnhancedFriendsScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  titleUpdateContainer: {
    padding: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noFriendsMessage: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
  friendsTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    padding: 18,
  },
  refreshButton: {
  opacity: 0.8
  }

})
