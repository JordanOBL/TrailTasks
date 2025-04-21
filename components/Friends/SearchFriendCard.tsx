
import { StyleSheet, Text, View, Pressable } from 'react-native'
import React from 'react'
import getUserRank from '../../helpers/Ranks/getUserRank'
 import {withObservables} from '@nozbe/watermelondb/react';
import { Cached_Friend } from '../../watermelon/models'

const SearchFriendCard = ({ friend, isConnected, handleAction }) => {


  const rank = getUserRank(friend.totalMiles)

  return (
    <View testID={`${friend.friendId}-friend-card`} style={styles.card}>
      <View style={styles.details}>
        <Text testID={`${friend.friendId}-friend-username`} style={styles.username} numberOfLines={1} ellipsizeMode="tail">
          {friend.username}
        </Text>
        <Text testID={`${friend.friendId}-friend-rank`} style={styles.subtext}>
          Level {rank?.level} - {rank?.group} {rank?.title}
        </Text>
        <Text testID={`${friend.friendId}-friend-current-trail`} style={styles.subtext}>
          {friend.trailProgress} mi - {friend.currentTrail}
        </Text>
        <Text testID={`${friend.friendId}-friend-total-miles`} style={styles.subtext}>
          Lifetime - {friend.totalMiles} mi
        </Text>
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          !isConnected  && styles.disabledButton,
        ]}
        onPress={() =>{
          handleAction(friend)
        }}
        testID={ `add-friend-${friend.friendId}-button`}
      >
        <Text style={styles.buttonText}>
          {'Add'}
        </Text>
      </Pressable>
    </View>
  )
}


export default SearchFriendCard

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  details: {
    flex: 1,
    marginRight: 12,
  },
  username: {
    fontSize: 17,
    fontWeight: '600',
    color: '#07FED5',
    marginBottom: 2,
  },
  subtext: {
    fontSize: 13,
    color: '#ccc',
  },
  button: {
    backgroundColor: '#07FED5',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  disabledButton: {
    backgroundColor: '#555',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 15,
  },
})

