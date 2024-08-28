import {FlatList, SafeAreaView, StyleSheet, Text, View} from 'react-native';

import EnhancedUserMile from './UserMile';
import {Pressable} from 'react-native';
import React from 'react';
import {User} from '../../watermelon/models';
import withObservables from '@nozbe/with-observables';

interface Props {
  leaderboard: any
  user: User;

}

const Leaderboard = ({leaderboard, user}: Props) => {

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.sectionTitle}>Your Rank:</Text>
          <EnhancedUserMile
            key={user.id}
            user={user}
            userRank={leaderboard.userRank}
          />
      </View>

      <Text style={styles.sectionTitle}>All Users: </Text>

      <FlatList
        data={leaderboard.top100Rankings}
        renderItem={({item, index}) => (
          <EnhancedUserMile
            key={index}
            index={index}
            hiker={item}
            user={user}
          />
        )}
        keyExtractor={(item) => item.username}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const enhance = withObservables(['user'], ({ user}) => ({
  user,
}));

const EnhancedLeaderboard = enhance(Leaderboard);
export default EnhancedLeaderboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginVertical: 10,
  },
  listContainer: {
    paddingBottom: 400, // Adjust this value as needed
  },
});
