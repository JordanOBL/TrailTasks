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

  // React.useEffect(() => {
  //   let intervalid = setInterval(() => sync(),5000)
  //   return () => (clearInterval(intervalid))
  // }, []);
  return (
    <View>
      {(user && leaderboard) && <SyncIndicator />}
      <Leaderboard user={user} milesLeaderboard={leaderboard!} />
    </View>
  );
};

export default LeaderboardsScreen;

const styles = StyleSheet.create({});
