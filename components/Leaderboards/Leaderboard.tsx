import {FlatList, SafeAreaView, StyleSheet, Text, View} from 'react-native';

import EnhancedUserMile from './UserMile';
import {Pressable} from 'react-native';
import React from 'react';
import {User} from '../../watermelon/models';
import withObservables from '@nozbe/with-observables';

interface Props {
  usersMilesCollection: any;
  userMiles: any;
  user: User;
}

const Leaderboard = ({usersMilesCollection, userMiles, user}: Props) => {
  const sortUsersMiles = (usersMilesCollection: any) => {
    return usersMilesCollection.sort((a: any, b: any) => {
      const aMiles = parseFloat(a.totalMiles);
      const bMiles = parseFloat(b.totalMiles);

      if (aMiles < bMiles) {
        return 1;
      } else if (aMiles > bMiles) {
        return -1;
      } else {
        return 0;
      }
    });
  };

  const sortedUsersMiles = sortUsersMiles(usersMilesCollection);

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.sectionTitle}>Your Rank:</Text>

        {sortedUsersMiles.map((item: any, index: number) => {
          if (item.userId === user.id) {
            return (
              <EnhancedUserMile
                key={item.userId}
                userMiles={userMiles}
                index={index}
                user={user}
              />
            );
          }
        })}
      </View>

      <Text style={styles.sectionTitle}>All Users: </Text>

      <FlatList
        data={sortedUsersMiles}
        renderItem={({item, index}) => (
          <EnhancedUserMile
            key={item.userId}
            userMiles={item}
            index={index}
            user={user}
          />
        )}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const enhance = withObservables(['userMiles', 'user'], ({userMiles, user}) => ({
  userMiles,
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
