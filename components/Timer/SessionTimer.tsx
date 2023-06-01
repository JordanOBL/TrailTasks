import {Pressable, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import formatCountdown from '../../helpers/Timer/formatCountdown';

interface Props {
  // timerState: any;
  // setTimerState: React.Dispatch<React.SetStateAction<any>>;
  sessionDetails: any;
  setSessionDetails: React.Dispatch<React.SetStateAction<any>>;
  joinedUserTrail: any;
}
const SessionTimer = ({
  // timerState,
  // setTimerState,
  setSessionDetails,
  sessionDetails,
  joinedUserTrail,
}: Props) => {
  React.useEffect(() => {
    //if elapsedworkTime < initialPomodoroTime
    //countdown()
    //update()
  });
  let pomodoroCountdown = formatCountdown(
    sessionDetails.initialPomodoroTime,
    sessionDetails.elapsedPomodoroTime
  );
  let shortBreakCountdown = formatCountdown(
    sessionDetails.initialShortBreakTime,
    sessionDetails.elapsedShortBreakTime
  );
  let longBreakCountdown = formatCountdown(
    sessionDetails.initialLongBreakTime,
    sessionDetails.elapsedLongBreakTime
  );
  console.log(pomodoroCountdown + shortBreakCountdown + longBreakCountdown);
  return (
    <View>
      <Text>SessionTimer</Text>
      <Pressable
        onPress={() =>
          setSessionDetails((prev: any) => {
            return {
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
            };
          })
        }>
        <Text style={{color: 'white'}}>End Session</Text>
      </Pressable>
    </View>
  );
};

export default SessionTimer;

const styles = StyleSheet.create({});
