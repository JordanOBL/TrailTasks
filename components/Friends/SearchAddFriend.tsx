import { useState, useEffect } from 'react';
import { StyleSheet, TextInput, View, Text } from 'react-native';
import handleError from '../../helpers/ErrorHandler';
import Config from 'react-native-config';
import { Button } from 'react-native-paper';
import SearchFriendCard from './SearchFriendCard';
import {sync} from '../../watermelon/sync';

const SearchAddFriend = ({ user, cachedFriendUsernames, isConnected , database}) => {
  const [search, setSearch] = useState('');
  const [foundFriend, setFoundFriend] = useState(null);
  const [error, setError] = useState('');

  async function handleSearch() {
    if (!search) return;
  if(search.toLowerCase() === user.username.toLowerCase()){
    setError('Cannot add yourself');
    setTimeout(() => setError(''), 2000);
    return;
  }

    if (cachedFriendUsernames.length > 0 && cachedFriendUsernames.includes(search.toLowerCase())) {
      setError('User already added as friend');
      setTimeout(() => setError(''), 2000);
      return;
    }

    try {
      const result = await fetch(`http://${Config.DATABASE_URL}/api/searchFriends?username=${search}`);
      const { friend } = await result.json();

      const normalizedFriend = friend
        ? {
            friendId: friend.friend_id,
            username: friend.username,
            totalMiles: friend.total_miles,
            currentTrail: friend.current_trail,
            trailProgress: friend.trail_progress,
            roomId: friend.room_id || '',
          }
        : null;

      if (normalizedFriend) {
        setFoundFriend(normalizedFriend);
        setError('');
        setSearch('');
      } else {
        setFoundFriend(null);
        setError('User not found');
        setTimeout(() => setError(''), 2000);
      }
    } catch (err) {
      handleError(err, 'handleSearch()');
    }
  }

  useEffect(() => {
    console.log('friend state', foundFriend);
  }, [foundFriend]);

  async function handleAddFriend(friend) {
    const result = await user.addFriend(friend);
    if (result.success) {
      await sync(database, isConnected, user.id);
      setFoundFriend(null);
      setSearch('');
    }
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Add Friend</Text>
      <View style={styles.searchRow}>
        <TextInput
          value={search}
          style={styles.input}
          onChangeText={setSearch}
          placeholder="Search Friends..."
          placeholderTextColor="#999"
          testID="friend-search-input"
        />
        <Button
          testID="friend-search-button"
          mode="contained"
          style={styles.searchButton}
          labelStyle={styles.searchButtonText}
          onPress={handleSearch}
        >
          Search
        </Button>
      </View>

      {foundFriend?.friendId && (
        <SearchFriendCard
          key={foundFriend.friendId}
          friend={foundFriend}
          handleAction={handleAddFriend}
          isConnected={isConnected}
        />
      )}

      {error !== '' && <Text testID="friend-search-error" style={styles.error}>{error}</Text>}
    </View>
  );
};

export default SearchAddFriend;

const styles = StyleSheet.create({
  wrapper: {
   padding: 26, 
    marginTop: 10,
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 6,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  searchButton: {
    backgroundColor: '#07FED5',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  error: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
    textAlign: 'center',
    opacity: 0.5,
  },
});

