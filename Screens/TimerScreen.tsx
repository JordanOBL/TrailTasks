import {StyleSheet, Text, View} from 'react-native';
import * as React from 'react';
import NewSessionOptions from '../components/Timer/NewSessionOptions';
import SessionTimer from '../components/Timer/SessionTimer';
import {UserContext} from '../App';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import getJoinedUserTrail from '../helpers/Timer/getJoinedUserTrail';
import {SessionDetails} from '../types/session';

const TimerScreen = () =>
{
  //@ts-ignore
  const {userId} = React.useContext(UserContext);
  const watermelonDatabase = useDatabase();
  const {joinedUserTrail, setJoinedUserTrail} = getJoinedUserTrail(
    watermelonDatabase,
    userId
  );
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
    presaveDistanceHiked: 0.00,
    totalDistanceHiked: 0.00,
    isLoading: false,
    isError: false,
  });

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
          joinedUserTrail={joinedUserTrail}
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
