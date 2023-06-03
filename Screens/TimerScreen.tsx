import {StyleSheet, Text, View} from 'react-native';
import * as React from 'react';
import NewSessionOptions from '../components/Timer/NewSessionOptions';
import SessionTimer from '../components/Timer/SessionTimer';
import {UserContext} from '../App';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import getJoinedUserTrail from '../helpers/Timer/getJoinedUserTrail';
import {JoinedUserTrail, SessionDetails} from '../types/session';
import {useFocusEffect} from '@react-navigation/native';
import {save} from '../helpers/Timer/timerFlow';
import {Q} from '@nozbe/watermelondb';

const TimerScreen = () =>
{
  //@ts-ignore
  const { userId } = React.useContext(UserContext);
  const watermelonDatabase = useDatabase();
  const { joinedUserTrail, setJoinedUserTrail } = getJoinedUserTrail(
    watermelonDatabase,
    userId
  );
  async function getLatestUserTrail()
  {
    try
    {
      const latestUserTrail = await watermelonDatabase
        .get('users')
        .query(
          Q.unsafeSqlQuery(
            'SELECT users.*, trails.*, parks.park_name, parks.park_type ' +
            'FROM users ' +
            'LEFT JOIN trails ON trails.id = users.trail_id  ' +
            'LEFT JOIN parks on trails.park_id = parks.id ' +
            'WHERE users.id = ? ',
            [userId]
          )
        )
        .unsafeFetchRaw();
      if (latestUserTrail?.length > 0)
      {
        console.log({ latestUserTrail });
        return latestUserTrail[0];
        //await sync(watermelonDatabase);
      }
    } catch (err)
    {
      console.log('error in getloggeduser function in timerScreen', err);
    }
  }
  const [sessionDetails, setSessionDetails] = React.useState<SessionDetails>({
    isSessionStarted: false,
    isPaused: false,
    sessionName: '',
    sessionDescription: '',
    sessionCategoryId: null,
    initialPomodoroTime: 1500,
    initialShortBreakTime: 300,
    initialLongBreakTime: 2700,
    elapsedPomodoroTime: 0,
    elapsedShortBreakTime: 0,
    elapsedLongBreakTime: 0,
    sets: 3,
    currentSet: 1,
    pace: 2,
    completedHike: false,
    strikes: 0,
    endSessionModal: false,
    totalSessionTime: 0,
    presaveDistanceHiked: 0.0,
    totalDistanceHiked: 0.0,
    isLoading: false,
    isError: false,
  });

  // const asyncSave = async() =>
  // {
  //   await save({
  //     watermelonDatabase,
  //     userId,
  //     setSessionDetails,
  //     sessionDetails,
  //     //@ts-ignore
  //     setJoinedUserTrail,
  //     //@ts-ignore
  //     joinedUserTrail,
  //     paused: true,
  //   });
  // }

  async function compareUserChanges()
  {
    try
    {
      
      const latestUserInfo = await getLatestUserTrail();
      setJoinedUserTrail((prev: JoinedUserTrail) =>
      {
        return {
          ...prev,
          park_id: latestUserInfo.park_id,
          park_name: latestUserInfo.park_name,
          park_type: latestUserInfo.park_type,
          trail_difficulty: latestUserInfo.trail_difficulty,
          trail_distance: latestUserInfo.trail_distance,
          trail_elevation: latestUserInfo.trail_elevation,
          trail_id: latestUserInfo.trail_id,
          trail_image_url: latestUserInfo.trail_image_url,
          trail_lat: latestUserInfo.trail_lat,
          trail_long: latestUserInfo.trail_long,
          trail_name: latestUserInfo.trail_name,
          trail_progress: latestUserInfo.trail_progress,
          trail_started_at: latestUserInfo.trail_started,
        };
      });
      await save({
        watermelonDatabase,
        userId,
        setJoinedUserTrail,
        joinedUserTrail,
        setSessionDetails,
        sessionDetails,
        paused: true,
      });
     
    } catch (error)
  {
    console.error('error in compare user changes timerscreen', error);
  }
}

  useFocusEffect(
    React.useCallback(() => {
      compareUserChanges(); 

      return async () =>
      {
        await await save({
          watermelonDatabase,
          userId,
          setJoinedUserTrail,
          joinedUserTrail,
          setSessionDetails,
          sessionDetails,
          paused: true,
        });
        if (
          sessionDetails.elapsedPomodoroTime <
          sessionDetails.initialPomodoroTime
        ) {
          console.log({sessionDetails});
          setSessionDetails((prev) => {
            return {...prev, isPaused: true, strikes: prev.strikes + 1};
          });
        } else {
          console.log(sessionDetails);
          setSessionDetails((prev) => {
            return {...prev, isPaused: true};
          });
        }

        console.log('Timer Screen was unfocused');
      };
    }, [watermelonDatabase])
  );
  return (
    <SafeAreaView style={styles.container}>
      {sessionDetails.isLoading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : sessionDetails.isSessionStarted === false ? (
        <NewSessionOptions
          sessionDetails={sessionDetails}
          setSessionDetails={setSessionDetails}
        />
      ) : (
        <SessionTimer
          sessionDetails={sessionDetails}
          setSessionDetails={setSessionDetails}
          //@ts-ignore
          joinedUserTrail={joinedUserTrail}
          //@ts-ignore
          setJoinedUserTrail={setJoinedUserTrail}
        />
      )}
    </SafeAreaView>
  );
};

export default TimerScreen;

const styles = StyleSheet.create({
  container: {flex: 1},
  loading: {color: 'white'},
});
