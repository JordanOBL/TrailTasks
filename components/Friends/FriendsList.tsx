import { StyleSheet, Text, View, FlatList } from 'react-native'
 import {withObservables} from '@nozbe/watermelondb/react';
import FriendCard from './FriendCard';
const FriendsList = ({ cachedFriends, isConnected, handleJoinSession }) => {
  return (
    <View>
      <Text>FriendsList</Text> 
      {cachedFriends.length === 0 && <Text style={styles.noFriendsMessage} testID='no-friends-message'>Add a friend, or check back later</Text>
      }
      <Text style={{color: 'white', fontWeight: 'bold', fontSize: 18, padding: 18}}>Friends:</Text>
      <FlatList
        data={cachedFriends}
        renderItem={({ item }) => {
          try {
            return (
              <FriendCard
                friend={item}
                action={'join'}
                isConnected={isConnected}
                handleAction={handleJoinSession}
              />
            );
          } catch (err) {
            console.error('Error rendering FriendCard:', err);
            return null;
          }}}
        keyExtractor={(item) => item.friendId} /> 
    </View>
  )
}

export default FriendsList

const styles = StyleSheet.create({
  noFriendsMessage: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  }
})
