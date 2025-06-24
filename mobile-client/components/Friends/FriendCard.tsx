import { StyleSheet, Text, View, Pressable } from 'react-native';
import React from 'react';
import getUserRank from '../../helpers/Ranks/getUserRank';
import { withObservables } from '@nozbe/watermelondb/react';
import { useTheme } from '../../contexts/ThemeProvider';

const FriendCard = ({ friend, isConnected, handleAction }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  if (!friend || (!friend.friendId && !friend.friend_id)) {
    console.warn('[FriendCard] Invalid friend data:', friend);
    return null;
  }

  const rank = getUserRank(friend.totalMiles);

  return (
    <View testID={`${friend.friendId}-friend-card`} style={styles.card}>
      <View style={styles.details}>
        <Text
          testID={`${friend.friendId}-friend-username`}
          style={styles.username}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
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
          (!isConnected || !friend.roomId) && styles.disabledButton,
        ]}
        disabled={!isConnected || !friend.roomId}
        onPress={() => handleAction(friend.roomId)}
        testID={`join-room-${friend.roomId || friend.room_id}-button`}
      >
        <Text style={styles.buttonText}>
          {!isConnected ? 'No connection' : 'Join'}
        </Text>
      </Pressable>
    </View>
  );
};

const enhance = withObservables(['cachedFriends'], ({ friend }) => ({
  friend,
}));
const EnhancedFriendCard = enhance(FriendCard);
export default EnhancedFriendCard;

const getStyles = (theme) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.card,
      padding: 14,
      marginHorizontal: 16,
      marginVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 3,
      elevation: 2,
    },
    details: {
      flex: 1,
      marginRight: 12,
    },
    username: {
      fontSize: 17,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    subtext: {
      fontSize: 13,
      color: theme.secondaryText,
      marginBottom: 2,
    },
    button: {
      backgroundColor: theme.button,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 6,
    },
    disabledButton: {
      backgroundColor: 'gray',
    },
    buttonPressed: {
      opacity: 0.8,
    },
    buttonText: {
      color: theme.buttonText,
      fontWeight: '600',
      fontSize: 15,
    },
  });

