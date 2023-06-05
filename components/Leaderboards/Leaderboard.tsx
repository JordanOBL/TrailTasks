import {StyleSheet, Text, View, SafeAreaView, FlatList} from 'react-native';
import React from 'react';
import EnhancedUserMile from './UserMile';
import withObservables from '@nozbe/with-observables';
import {User} from '../../watermelon/models';
import {Pressable} from 'react-native';
interface Props {
  usersMilesCollection: any;
  userMiles: any;
  user: User;
}

const Leaderboard = ({usersMilesCollection, userMiles, user}: Props) => {
  const updateUserMiles = async (miles: any) => {
    try {
      const updated = await userMiles.updateTotalMiles(miles);
      console.log({updated});
    } catch (err) {
      console.log('error in update user', err);
    }
  };
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
    <SafeAreaView
      style={{
        backgroundColor: 'black',
        width: '100%',
      }}>
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
      <Pressable onPress={() => updateUserMiles({miles: 0.01})}>
        <Text style={{color: 'white'}}>Increase UserMiles</Text>
      </Pressable>
      <Text style={styles.sectionTitle}>All Users: </Text>
      <SafeAreaView style={{marginBottom: 400}}>
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
        />
      </SafeAreaView>
    </SafeAreaView>
  );
};

//export default Leaderboard;

const enhance = withObservables(['userMiles'], ({userMiles}) => ({
  userMiles,
  //Shortcut syntax for `post.comments.observe()`
}));

const EnhancedLeaderboard = enhance(Leaderboard);
export default EnhancedLeaderboard;

const styles = StyleSheet.create({
  sectionTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginVertical: 10,
  },
});
