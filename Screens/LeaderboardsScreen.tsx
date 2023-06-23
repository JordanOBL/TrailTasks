import {StyleSheet, Text, SafeAreaView} from 'react-native';
import React, {useEffect, useState} from 'react';
import SyncIndicator from '../components/SyncIndicator';
import {sync} from '../watermelon/sync';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import EnhancedLeaderboard from '../components/Leaderboards/Leaderboard';
import withObservables from '@nozbe/with-observables';
import {User, User_Miles} from '../watermelon/models';
interface Props {
  user: User;
  currentUsersMiles: User_Miles[];
}
const LeaderboardsScreen = ({currentUsersMiles, user}: Props) => {
  const watermelonDatabase = useDatabase();
  const [usersMilesCollection, setUsersMilesCollection] = useState<any>(null);

  async function getUsersMiles() {
    const usersMilesCollection = await watermelonDatabase.collections
      .get('users_miles')
      .query()
      .fetch();
    setUsersMilesCollection(usersMilesCollection);
  }

  useEffect(() => {
    if (usersMilesCollection == null || currentUsersMiles === null) {
      console.log('sync in lbs');
      sync(watermelonDatabase)
        .then(() => getUsersMiles())
        .catch((e) => console.log('error in leaderboeardscreen useeffect', e));
    }
  }, [currentUsersMiles, usersMilesCollection, watermelonDatabase]);

  return (
    <SafeAreaView style={styles.container}>
      {/* <SyncIndicator database={watermelonDatabase} delay={3000} /> */}
      {currentUsersMiles !== null && usersMilesCollection !== null ? (
        <EnhancedLeaderboard
          usersMilesCollection={usersMilesCollection}
          user={user}
          userMiles={currentUsersMiles[0]}
        />
      ) : (
        <Text>Loading...</Text>
      )}
    </SafeAreaView>
  );
};

const enhance = withObservables(['user'], ({user}) => ({
  user,
  currentUsersMiles: user.usersMiles.observe(),

}));

const EnhancedLeaderboardsScreen = enhance(LeaderboardsScreen);
export default EnhancedLeaderboardsScreen;
const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});
