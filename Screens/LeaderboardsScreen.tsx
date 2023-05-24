import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import withObservables from '@nozbe/with-observables';
import Leaderboard from '../components/Leaderboards/Leaderboard';
import getUser from '../helpers/getUser';
import useLeaderboard from '../helpers/getLeaderboard';
import SyncIndicator from '../components/SyncIndicator';
import { sync } from '../watermelon/sync';

const LeaderboardsScreen = () => {
  const user = getUser();
  const leaderboard = useLeaderboard();

  return (
    <View style={styles.container}>
      {(user && leaderboard) && <SyncIndicator delay={5000} />}
      <Leaderboard user={user} milesLeaderboard={leaderboard!} />
    </View>
  );
};

export default LeaderboardsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20
  }
});
