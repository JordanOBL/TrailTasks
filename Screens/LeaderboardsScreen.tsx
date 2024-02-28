import React, {useEffect, useState} from 'react';
import {SafeAreaView, StyleSheet, Text} from 'react-native';
import {User, User_Miles} from '../watermelon/models';

import EnhancedLeaderboard from '../components/Leaderboards/Leaderboard';
import SyncIndicator from '../components/SyncIndicator';
import {sync} from '../watermelon/sync';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import withObservables from '@nozbe/with-observables';

interface Props {
  user: User;
  currentUsersMiles: User_Miles[];
}

const LeaderboardsScreen = ({currentUsersMiles, user}: Props) => {
  const watermelonDatabase = useDatabase();
  const [usersMilesCollection, setUsersMilesCollection] = useState<
    User_Miles[] | null
  >(null);

  useEffect(() => {
    if (!currentUsersMiles || !currentUsersMiles.length) {
      console.log('Syncing in LeaderboardsScreen');
      sync(watermelonDatabase)
        .then(() => {
          getUsersMiles();
        })
        .catch((error) => {
          console.log('Error in LeaderboardsScreen useEffect:', error);
        });
    } else {
      getUsersMiles();
    }
  }, [currentUsersMiles, watermelonDatabase]);

  async function getUsersMiles() {
    try {
      const usersMiles = await watermelonDatabase.collections
        .get<User_Miles>('users_miles')
        .query()
        .fetch();
      setUsersMilesCollection(usersMiles);
    } catch (error) {
      console.log('Error fetching users miles:', error);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <SyncIndicator database={watermelonDatabase} delay={3000} />
      {usersMilesCollection ? (
        <EnhancedLeaderboard
          usersMilesCollection={usersMilesCollection}
          user={user}
          userMiles={currentUsersMiles[0]} // Assuming currentUsersMiles is an array
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
    flex: 1,
    padding: 20,
  },
});
