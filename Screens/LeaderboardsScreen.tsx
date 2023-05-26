import {StyleSheet, Text, SafeAreaView} from 'react-native';
import React from 'react';
import withObservables from '@nozbe/with-observables';
import Leaderboard from '../components/Leaderboards/Leaderboard';
import getUser from '../helpers/getUser';
import useLeaderboard from '../helpers/Leaderboard/getLeaderboard';
import SyncIndicator from '../components/SyncIndicator';
import {sync} from '../watermelon/sync';
import {useDatabase} from '@nozbe/watermelondb/hooks';

const LeaderboardsScreen = () => {
  const watermelonDatabase = useDatabase();
  const {user, setUser} = getUser(watermelonDatabase);
  const leaderboard = useLeaderboard();

  return (
    <SafeAreaView style={styles.container}>
      {user && leaderboard && <SyncIndicator database={watermelonDatabase} delay={3000} />}
      <Leaderboard user={user} milesLeaderboard={leaderboard!} />
    </SafeAreaView>
  );
};

export default LeaderboardsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});
