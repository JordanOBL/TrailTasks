import {StyleSheet, Text, View, ScrollView} from 'react-native';
import * as React from 'react';
import SyncIndicator from '../components/SyncIndicator';
import DistanceProgressBar from '../components/DistanceProgressBar';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {Pressable} from 'react-native';
import withObservables from '@nozbe/with-observables';
import {handleLogOut} from '../helpers/logoutHelpers';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import {UserContext} from '../App';
import getCurrentTrail from '../helpers/Trails/getCurrentTrail';
import {sync} from '../watermelon/sync';
import {Q} from '@nozbe/watermelondb';
import {User} from '../watermelon/models';
import {formatDateTime} from '../helpers/formatDateTime';
import checkInternetConnection from '../helpers/InternetConnection/checkInternetConnection';

interface Props {
  user: User;
  currentTrail?: any;
  navigation: any;
  setUser: any;
}
const HomeScreen = ({navigation, user, setUser, currentTrail}: Props) => {
  const {userId, setUserId} = React.useContext(UserContext);
  const watermelonDatabase = useDatabase();

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

      return async () => {
        console.log('Timer Screen was unfocused');
      };
    }, [watermelonDatabase])
  );
  return !user || !currentTrail ? (
    <View>
      <Text style={{color: 'white'}}>Loading Your Data...</Text>
    </View>
  ) : (
    <View style={styles.Container}>
      {/* <SyncIndicator delay={3000} /> */}
      <View
        style={{
          backgroundColor: 'transparent',
          width: '100%',
          flexDirection: 'row',
          alignItems: 'flex-end',
          marginVertical: 10,
          paddingHorizontal: 10,
        }}>
        <Text style={styles.H1}>Hello, {user.username}</Text>
        <Text
          style={{
            color: isConnected ? 'green' : 'gray',
            paddingHorizontal: 10,
            paddingVertical: 6,
          }}>
          {isConnected ? 'Online' : 'Offline'}
        </Text>
      </View>
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
          <Text style={[styles.H2, {margin: 0, color: 'rgb(7,254,213)'}]}>
            Current Trail:
          </Text>
          <Text style={styles.trailText}>{currentTrail.trailName}</Text>
          <DistanceProgressBar user={user} trail={currentTrail} />
        </View>
        <ScrollView
          style={{
            marginTop: 10,
            backgroundColor: 'rgb(18,19,21)',
            flex: 1,
          }}>
          <Pressable
            style={styles.LinkContainer}
            onPress={() => navigation.navigate('Stats')}>
            <Text style={[styles.H2, {color: 'rgb(249,253,255)'}]}>Stats</Text>
          </Pressable>
          <Pressable
            style={styles.LinkContainer}
            onPress={() => navigation.navigate('HikingQueue')}>
            <Text style={[styles.H2, {color: 'rgb(249,253,255)'}]}>
              Hiking Queue
            </Text>
            {/* <Text style={{ color: 'rgb(221,224,226)' }}>
							{hikingQueue.length > 0
								? `Next Trail: ${hikingQueue[0].trail_name} ${hikingQueue[0].trail_distance} mi.`
								: 'No Upcoming Trails'}
						</Text> */}
          </Pressable>
          <Pressable
            style={styles.LinkContainer}
            onPress={() => navigation.navigate('Friends')}>
            <Text style={[styles.H2, {color: 'rgb(249,253,255)'}]}>
              Friends
            </Text>
          </Pressable>
          <Pressable
            style={styles.LinkContainer}
            onPress={() => navigation.navigate('Achievements')}>
            <Text style={[styles.H2, {color: 'rgb(249,253,255)'}]}>
              Achievements
            </Text>
          </Pressable>
          <Pressable
            style={styles.LinkContainer}
            onPress={() => navigation.navigate('CompletedHikes')}>
            <Text style={[styles.H2, {color: 'rgb(249,253,255)'}]}>
              Completed Trails
            </Text>
          </Pressable>
          <Pressable
            style={styles.LinkContainer}
            onPress={() => navigation.navigate('Leaderboards')}>
            <Text style={[styles.H2, {color: 'rgb(249,253,255)'}]}>
              Leaderboards
            </Text>
          </Pressable>
          <Pressable
            onPress={async () => handleLogOut(setUser, watermelonDatabase)}
            style={styles.LinkContainer}>
            <Text style={[styles.H2, {color: 'red'}]}>Logout</Text>
          </Pressable>

          <Pressable
            onPress={async () =>
              user.updateUserTrail({
                trailId: '1',
                trailStartedAt: formatDateTime(new Date()),
              })
            }
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
  currentTrail: user.trail.observe(),
  // Shortcut syntax for `post.comments.observe()`
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
