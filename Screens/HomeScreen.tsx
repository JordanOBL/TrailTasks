import {StyleSheet, Text, View, ScrollView} from 'react-native';
import * as React from 'react';
import SyncIndicator from '../components/SyncIndicator';
import DistanceProgressBar from '../components/Timer/DistanceProgressBar';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {Pressable} from 'react-native';

import {handleLogOut} from '../helpers/logoutHelpers';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import {UserContext} from '../App';
import getCurrentTrail from '../helpers/Trails/getCurrentTrail';
import {sync} from '../watermelon/sync';
import {Q} from '@nozbe/watermelondb';

const HomeScreen = ({navigation}: any) => {
  const {userId, setUserId} = React.useContext(UserContext);
  const [loggedInUser, setLoggedInUser] = React.useState<any>(null);
  const watermelonDatabase = useDatabase();

  async function getLoggedInUser() {
    try {
      const loggedInUser = await watermelonDatabase
        .get('users')
        .query(
          Q.unsafeSqlQuery(
            'SELECT users.*, trails.* FROM users ' +
              'LEFT JOIN trails ON trails.id = users.trail_id ' +
              'WHERE users.id =  ?',
            [userId]
          )
        )
        .unsafeFetchRaw();
      if (loggedInUser?.length > 0)
      {
        setLoggedInUser(loggedInUser[0]);
        await sync(watermelonDatabase);
      }
    } catch (err) {
      console.log('error in getloggeduser function in Homescreen', err);
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      getLoggedInUser();
      console.log('Screen was focused');

      return () => {
        console.log('Screen was unfocused');
        // Useful for cleanup functions
      };
    }, [])
  );
  return !loggedInUser ? (
    <View>
      <Text>Loading Your Data...</Text>
    </View>
  ) : (
    <View style={styles.Container}>
      {/* <SyncIndicator delay={3000} /> */}
      <Text style={styles.H1}>Hey, {loggedInUser.username}</Text>
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
          <Text style={styles.trailText}>{loggedInUser?.trail_name}</Text>
          <DistanceProgressBar
          // trailDistance={user.current_trail_distance}
          // trailProgress={user.current_trail_progress}
          />
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
              Hiking Queue{' '}
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
            onPress={async () => handleLogOut(setUserId, watermelonDatabase)}
            style={styles.LinkContainer}>
            <Text style={[styles.H2, {color: 'red'}]}>Logout</Text>
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  Container: {
    padding: 5,
    backgroundColor: 'rgb(18,19,21)',
    flex: 1,
  },
  H1: {
    color: 'rgb(249,253,255)',
    fontSize: 26,
    fontWeight: '900',
    marginVertical: 10,
    padding: 10,
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
