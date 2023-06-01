import {StyleSheet, Text, View} from 'react-native';
import * as React from 'react';
import NewSessionOptions from '../components/Timer/NewSessionOptions';
import SessionTimer from '../components/Timer/SessionTimer';
import {UserContext} from '../App';
import {SafeAreaView} from 'react-native-safe-area-context';

const TimerScreen = () => {
  const {userId} = React.useContext(UserContext);
  const [timerState, setTimerState] = React.useState({
    pomodoroTime: null,
    shortBreakTime: null,
    longBreakTime: null,
    elapsedPomodoroTime: 0,
    elapsedShortBreakTime: 0,
    elapsedLongBreakTime: 0,
    isPaused: false,
  });

  const [sessionDetails, setSessionDetails] = React.useState({
    isSessionStarted: false,
    sessionName: '',
    sessionDescription: '',
    sessionCategoryId: null,
    initialPomodoroTime: null,
    initialShortBreakTime: null,
    initialLongBreakTime: null,
    sets: null,
    currentSet: 1,
    pace: 2,
    completedHike: false,
    strikes: 0,
    endSessionModal: false,
    totalSessionTime: 0,
    totalDistanceHiked: 0,
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
        <SessionTimer timerState={timerState} setTimerState={setTimerState} />
      )}
    </SafeAreaView>
  );
};

export default TimerScreen;

const styles = StyleSheet.create({
  container: {flex: 1},
  loading: {color: 'white'},
});
