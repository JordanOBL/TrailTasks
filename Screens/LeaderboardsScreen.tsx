import {StyleSheet, Text, SafeAreaView} from 'react-native';
import React, {useEffect, useState} from 'react';
import withObservables from '@nozbe/with-observables';
import Leaderboard from '../components/Leaderboards/Leaderboard';
import getUser from '../helpers/getUser';
import useLeaderboard from '../helpers/Leaderboard/getLeaderboard';
import SyncIndicator from '../components/SyncIndicator';
import {sync} from '../watermelon/sync';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import EnhancedLeaderboard from '../components/Leaderboards/Leaderboard';


const LeaderboardsScreen = () => {
  const watermelonDatabase = useDatabase();
  //const {user, setUser} = getUser(watermelonDatabase);
  //const leaderboard = useLeaderboard();
  const [usersMilesCollection, setUsersMilesCollection] = useState<any>(null);
  const [currentUsersMiles, setCurrentUsersMiles] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  async function getUsersMiles()
  {
    const usersMilesId = await watermelonDatabase.localStorage.get('users_miles_id')
    const usersMilesCollection = await watermelonDatabase.collections.get('users_miles').query().fetch()
    const usersMiles = await watermelonDatabase.collections.get(
      'users_miles'
    ).find(usersMilesId)
    const user = await usersMiles.user.fetch()
    console.log(user)
    console.log({ usersMilesCollection })
    console.log({ usersMiles })
    setUser(user)
    setUsersMilesCollection(usersMilesCollection)
    setCurrentUsersMiles(usersMiles);
  }

  useEffect(() => {
    if (usersMilesCollection == null || currentUsersMiles === null) {
      getUsersMiles();
    }
  }, [currentUsersMiles, usersMilesCollection]);

  return (
    <SafeAreaView style={styles.container}>
      {/* {user && leaderboard && <SyncIndicator database={watermelonDatabase} delay={3000} />}
      <Leaderboard user={user} milesLeaderboard={leaderboard!} /> */}
      {currentUsersMiles !== null && usersMilesCollection !== null ? 
      <EnhancedLeaderboard usersMilesCollection={usersMilesCollection} user={user} userMiles={currentUsersMiles} /> : <Text>Loading...</Text>}
    </SafeAreaView>
  );
};

export default LeaderboardsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});
