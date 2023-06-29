import {StyleSheet, Text, View, ScrollView} from 'react-native';
import * as React from 'react';
import SyncIndicator from '../components/SyncIndicator';
import DistanceProgressBar from '../components/DistanceProgressBar';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {Pressable} from 'react-native';
import withObservables from '@nozbe/with-observables';
import {handleLogOut} from '../helpers/logoutHelpers';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import Ranks from '../helpers/Ranks/ranksData';
import getUserRank from '../helpers/Ranks/getUserRank';
import {sync} from '../watermelon/sync';
import {Subscription, User, User_Miles} from '../watermelon/models';

import checkInternetConnection from '../helpers/InternetConnection/checkInternetConnection';

import ScreenLink from '../components/HomeScreen/screenLink';
// import useUserSubscription from '../helpers/useUserSubscription';
interface Rank {
  level: string;
  group: string;
  range: number[];
  title: string;
}
interface Props {
  user: User;
  currentTrail?: any;
  navigation: any;
  setUser: any;
  userSubscription: Subscription[];
  totalMiles: User_Miles[];
}
const HomeScreen = ({
  navigation,
  user,
  setUser,
  currentTrail,
  userSubscription,
  totalMiles,
}: Props) => {
  const watermelonDatabase = useDatabase();
  const [userRank, setUserRank] = React.useState<Rank | undefined>();
  const [isConnected, setIsConnected] = React.useState<boolean | null>(false);

  React.useEffect(() => {
    async function isConnected() {
      const {connection} = await checkInternetConnection();
      setIsConnected(connection?.isConnected);
    }

    isConnected();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      sync(watermelonDatabase);
      const rank = getUserRank(Ranks, totalMiles[0].totalMiles);
      setUserRank(rank);
      return async () => {
        console.log('Timer Screen was unfocused');
      };
    }, [watermelonDatabase, user, totalMiles])
  );
  return !user || !currentTrail ? (
    <View>
      <Text style={{color: 'white'}}>Loading Your Data...</Text>
    </View>
  ) : (
    <View style={styles.Container}>
      {/* <SyncIndicator delay={3000} /> */}
      <Text
        style={{
          color: isConnected ? 'green' : 'gray',
          paddingHorizontal: 10,
          paddingVertical: 6,
        }}>
        {isConnected ? 'Online' : 'Offline'}
      </Text>
      <View
        style={{
          backgroundColor: 'transparent',
          width: '100%',
          alignItems: 'flex-start',
          marginVertical: 10,
          paddingHorizontal: 10,
        }}>
        <Text style={styles.H1}>{user.username}</Text>
      </View>
      {userRank ? (
        <View
          style={{
            backgroundColor: 'transparent',
            width: '100%',
            alignItems: 'center',
            marginVertical: 10,
            paddingHorizontal: 10,
          }}>
          <Text style={styles.H3}>Level {userRank.level}</Text>
          <Text style={styles.H3}>
            {userRank.group} {userRank.title}
          </Text>
        </View>
      ) : (
        <></>
      )}
      <View style={styles.Container}>
        <View
          style={{
            padding: 10,
            marginBottom: 10,
            backgroundColor: 'rgb(28,29,31)',
            borderColor: 'rgb(7,254,213)',
            borderWidth: 1,
            borderRadius: 10,
          }}>
          <Text style={[styles.H3, {margin: 0, color: 'rgb(7,254,213)'}]}>
            Current Trail:
          </Text>
          <Text style={styles.H3}>{currentTrail.trailName}</Text>
          <DistanceProgressBar user={user} trail={currentTrail} />
        </View>

        <ScrollView
          style={{
            marginTop: 10,
            backgroundColor: 'rgb(18,19,21)',
            flex: 1,
          }}>
          <ScreenLink
            user={user}
            needsActiveSubscription={false}
            hasActiveSubscription={
              userSubscription[0] ? userSubscription[0].isActive : false
            }
            navigation={navigation}
            navTo={'Stats'}>
            Stats
          </ScreenLink>
          <ScreenLink
            user={user}
            needsActiveSubscription={true}
            hasActiveSubscription={
              userSubscription[0] ? userSubscription[0].isActive : false
            }
            navigation={navigation}
            navTo={'HikingQueue'}>
            Hiking Queue
          </ScreenLink>
          <ScreenLink
            needsActiveSubscription={true}
            hasActiveSubscription={
              userSubscription[0] ? userSubscription[0].isActive : false
            }
            user={user}
            navigation={navigation}
            navTo={'Friends'}>
            Friends
          </ScreenLink>
          <ScreenLink
            needsActiveSubscription={false}
            hasActiveSubscription={
              userSubscription[0] ? userSubscription[0].isActive : false
            }
            user={user}
            navigation={navigation}
            navTo={'Achievements'}>
            Achievements
          </ScreenLink>
          <ScreenLink
            user={user}
            navigation={navigation}
            navTo={'Leaderboards'}
            needsActiveSubscription={true}
            hasActiveSubscription={
              userSubscription[0] ? userSubscription[0].isActive : false
            }>
            Leaderboards
          </ScreenLink>
          <ScreenLink
            user={user}
            navigation={navigation}
            navTo={'CompletedHikes'}
            needsActiveSubscription={true}
            hasActiveSubscription={
              userSubscription[0] ? userSubscription[0].isActive : false
            }>
            Completed Trails
          </ScreenLink>
          <ScreenLink
            user={user}
            navigation={navigation}
            navTo={'Settings'}
            needsActiveSubscription={false}
            hasActiveSubscription={
              userSubscription[0] ? userSubscription[0].isActive : false
            }>
            Settings
          </ScreenLink>

          <Pressable
            onPress={async () => handleLogOut(setUser, watermelonDatabase)}
            style={styles.LinkContainer}>
            <Text style={[styles.H2, {color: 'red'}]}>Logout</Text>
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
};
const enhance = withObservables(['user'], ({user}) => ({
  user: user.observe(),
  totalMiles: user.usersMiles.observe(),
  currentTrail: user.trail.observe(),
  userSubscription: user.usersSubscriptions.observe(),
}));

const EnhancedHomeScreen = enhance(HomeScreen);
export default EnhancedHomeScreen;
// export default HomeScreen;

const styles = StyleSheet.create({
  Container: {
    padding: 5,
    backgroundColor: 'rgb(18,19,21)',
    flex: 1,
  },
  H1: {
    color: 'rgb(249,253,255)',
    fontSize: 26,
    fontWeight: '800',
    padding: 5,
  },
  H2: {
    color: 'rgb(249,253,255)',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'left',
  },
  H3: {
    color: 'rgb(249,253,255)',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'left',
  },
  trailText: {
    color: 'rgb(221,224,226)',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  LinkContainer: {
    borderColor: 'rgb(31,33,35)',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: 'rgb(31,33,35)',
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    color: 'rgb(221,224,226)',
    fontWeight: '900',
    marginBottom: 10,
    padding: 20,
  },
});
