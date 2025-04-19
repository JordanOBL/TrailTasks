import { StyleSheet, Text, View, Pressable } from 'react-native'
import React from 'react'
import getUserRank from '../../helpers/Ranks/getUserRank'
import { Cached_Friend } from '../../watermelon/models'

const FriendCard = ({ friend, isConnected, handleAction, action }) => {
  if (!friend || (!friend.friendId && !friend.friend_id)) {
    console.warn('[FriendCard] Invalid friend data:', friend)
    return null
  }

  const rank = getUserRank(friend.totalMiles)

  return (
    <View testID={`${friend.friendId}-friend-card`} style={styles.card}>
      <View style={styles.details}>
        <Text style={styles.username} numberOfLines={1} ellipsizeMode="tail">
          {friend.username}
        </Text>
        <Text style={styles.subtext}>
          Level {rank?.level} · {rank?.group} {rank?.title}
        </Text>
        <Text style={styles.subtext}>
          {friend.totalMiles} mi · {friend.currentTrail}
        </Text>
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          !isConnected || (action === 'join' && !friend.roomId)  && styles.disabledButton,
        ]}
        disabled={!isConnected || (action === 'join' && !friend.roomId)}
        onPress={() =>handleAction(friend.roomId)}
        testID={
          action === 'join'
            ? `join-room-${friend.roomId || friend.room_id}-button`
            : `add-friend-${friend.friendId}-button`
        }
      >
        <Text style={styles.buttonText}>
          {!isConnected ? 'Offline' : action === 'join' ? 'Join' : 'Add'}
        </Text>
      </Pressable>
    </View>
  )
}

export default FriendCard

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

