import {Pressable, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import formatCountdown from '../../helpers/Timer/formatCountdown';
import {SessionDetails} from '../../types/session';
import {
  Hike,
  endSession,
  longBreak,
  pauseSession,
  resumeSession,
  shortBreak,
  skipBreak,
} from '../../helpers/Timer/timerFlow';
import {useDatabase} from '@nozbe/watermelondb/hooks';

interface Props {
  sessionDetails: SessionDetails;
  setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
  joinedUserTrail: any;
}
const SessionTimer = ({
  // timerState,
  // setTimerState,
  setSessionDetails,
  sessionDetails,
  joinedUserTrail,
}: Props) => {
  const watermelonDatabase = useDatabase();
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

  let totalFormattedSessionTime = formatCountdown(
    sessionDetails.totalSessionTime,
    0
  );

  let canHike =
    sessionDetails.elapsedPomodoroTime < sessionDetails.initialPomodoroTime;

  React.useEffect(() => {
    let intervalId: any;
    console.log(sessionDetails);
    if (
      sessionDetails.isPaused === false &&
      sessionDetails.currentSet <= sessionDetails.sets
    ) {
      if (
        sessionDetails.elapsedPomodoroTime < sessionDetails.initialPomodoroTime
      ) {
        intervalId = setInterval(() => {
          Hike(setSessionDetails, sessionDetails);
        }, 1000);
      } else if (
        sessionDetails.elapsedShortBreakTime <
        sessionDetails.initialShortBreakTime
      ) {
        intervalId = setInterval(() => {
          shortBreak(setSessionDetails, sessionDetails);
        }, 1000);
      }
    } else if (
      sessionDetails.isPaused === false &&
      sessionDetails.currentSet > sessionDetails.sets
    ) {
      if (
        sessionDetails.elapsedLongBreakTime <
        sessionDetails.initialLongBreakTime
      ) {
        intervalId = setInterval(() => {
          longBreak(setSessionDetails, sessionDetails);
        }, 1000);
      }
    }
    return () => clearInterval(intervalId);
  }, [sessionDetails]);

  return (
    <SafeAreaView>
      <Text
        style={{
          color: sessionDetails.isPaused
            ? 'rgb(81,83,85)'
            : sessionDetails.isSessionStarted && !canHike
            ? 'rgb(217,49,7)'
            : 'rgb(7,254,213)',
          fontSize: 60,
          fontWeight: 'bold',
          marginTop: 20,
          textAlign: 'center',
        }}>
        {sessionDetails.isPaused === true
          ? 'Paused'
          : canHike === true && sessionDetails.currentSet <= sessionDetails.sets
          ? pomodoroCountdown
          : sessionDetails.currentSet <= sessionDetails.sets
          ? shortBreakCountdown
          : longBreakCountdown}
      </Text>
      <Text style={{color: 'white'}}>{totalFormattedSessionTime}</Text>
      <Pressable
        onPress={() =>
          endSession(watermelonDatabase, setSessionDetails, sessionDetails)
        }>
        <Text style={{color: 'white'}}>End Session</Text>
      </Pressable>
      {sessionDetails.elapsedPomodoroTime >=
        sessionDetails.initialPomodoroTime && (
        <Pressable onPress={() => skipBreak(setSessionDetails, sessionDetails)}>
          <Text style={{color: 'white'}}>Skip Break</Text>
        </Pressable>
      )}
      {
        <Pressable
          onPress={() => {
            sessionDetails.isPaused === false
              ? pauseSession(setSessionDetails)
              : resumeSession(setSessionDetails);
          }}>
          <Text style={{color: 'white'}}>
            { sessionDetails.isPaused === false
              ? 'Pause Session'
              : 'Resume Session'}
          </Text>
        </Pressable>
      }
    </SafeAreaView>
  );
};

export default SessionTimer;

const styles = StyleSheet.create({});
