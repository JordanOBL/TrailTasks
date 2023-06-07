import {StyleSheet, Text, View} from 'react-native';
import * as React from 'react';
import NewSessionOptions from '../components/Timer/NewSessionOptions';
import EnhancedSessionTimer from '../components/Timer/SessionTimer';
import {UserContext} from '../App';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import getJoinedUserTrail from '../helpers/Timer/getJoinedUserTrail';
import {JoinedUserTrail, SessionDetails} from '../types/session';
import {useFocusEffect} from '@react-navigation/native';

import {Q} from '@nozbe/watermelondb';
import withObservables from '@nozbe/with-observables';
import {Hiking_Queue, Trail, User, User_Miles} from '../watermelon/models';
interface Props {
  user: User;
  setUser: any;
  currentTrail: Trail;
}
const TimerScreen = ({user, setUser, currentTrail}: Props) => {
  //@ts-ignore
  const {userId} = React.useContext(UserContext);
  const watermelonDatabase = useDatabase();
  //get observble user
  //const [user, setUser ] = React.useState<any>()

  //observable user session
  const [userSession, setUserSession] = React.useState<any>();

  // const { joinedUserTrail, setJoinedUserTrail } = getJoinedUserTrail(
  //   watermelonDatabase,
  //   userId
  // );
  //    async function getLatestUserTrail()
  //   {
  //     try
  //     {
  //       const latestUserTrail = await watermelonDatabase
  //         .get('users')
  //         .query(
  //           Q.unsafeSqlQuery(
  //             'SELECT users.*, trails.*, parks.park_name, parks.park_type ' +
  //             'FROM users ' +
  //             'LEFT JOIN trails ON trails.id = users.trail_id  ' +
  //             'LEFT JOIN parks on trails.park_id = parks.id ' +
  //             'WHERE users.id = ? ',
  //             [userId]
  //           )
  //         )
  //         .unsafeFetchRaw();
  //       if (latestUserTrail?.length > 0)
  //       {
  //         console.log({ latestUserTrail });
  //         return latestUserTrail[0];
  //         //await sync(watermelonDatabase);
  //       }
  //     } catch (err)
  //     {
  //       console.log('error in getloggeduser function in timerScreen', err);
  //     }
  //   }

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
    totalDistanceHiked: 0.0,
    isLoading: false,
    isError: false,
  });

  return (
    <SafeAreaView style={styles.container}>
      {sessionDetails.isLoading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : sessionDetails.isSessionStarted === false || !userSession ? (
        <NewSessionOptions
          sessionDetails={sessionDetails}
          setSessionDetails={setSessionDetails}
          setUserSession={setUserSession}
          user={user}
        />
      ) : (
        <EnhancedSessionTimer
          sessionDetails={sessionDetails}
          setSessionDetails={setSessionDetails}
          //@ts-ignore
          // joinedUserTrail={joinedUserTrail}
          // //@ts-ignore
          // setJoinedUserTrail={setJoinedUserTrail}
          userSession={userSession}
          user={user}
        />
      )}
    </SafeAreaView>
  );
};

const enhance = withObservables(['user'], ({user}) => ({
  user: user.observe(),
}));

const EnhancedTimerScreen = enhance(TimerScreen);
export default EnhancedTimerScreen;
//export default TimerScreen;

const styles = StyleSheet.create({
  container: {flex: 1},
  loading: {color: 'white'},
});
