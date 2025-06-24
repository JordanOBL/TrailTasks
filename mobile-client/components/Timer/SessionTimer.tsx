import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  checkPaceIncrease,
  checkTimerIsZero,
} from '../../helpers/Timer/timerFlow';

import Timer from '../../types/timer';
import formatCountdown from '../../helpers/Timer/formatCountdown';

interface Props {
  timer: Timer;
  setTimer: React.Dispatch<React.SetStateAction<Timer>>;
  minimumPace: number;
  maximumPace: number;
  paceIncreaseInterval: number;
  paceIncreaseValue: number;
}

const SessionTimer = ({
  timer,
  setTimer,
  minimumPace,
  maximumPace,
  paceIncreaseInterval,
  paceIncreaseValue,
}: Props) => {
  const countdown = formatCountdown(timer.time);

 useEffect(() => {
  let timerInterval: NodeJS.Timeout | undefined;

  if (timer?.isRunning && !timer?.isPaused && !timer.isCompleted) {
    timerInterval = setInterval(() => {
      setTimer((prev) => {
        if (prev.time <= 0) {
          checkTimerIsZero({ timer: prev, setTimer });
          return prev; // Don't modify state here, let checkTimerIsZero handle it
        }

        if (!prev.isBreak) {
          checkPaceIncrease({
            timer: prev,
            setTimer,
            minimumPace,
            maximumPace,
            paceIncreaseInterval,
            paceIncreaseValue,
          });

          return { ...prev, time: prev.time - 1, elapsedTime: prev.elapsedTime + 1 };
        } else {
          return { ...prev, time: prev.time - 1 };
        }
      });
    }, 1000);
  }

  return () => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
  };
}, [timer?.isRunning, timer?.isPaused, timer?.isCompleted, minimumPace, maximumPace, paceIncreaseInterval, paceIncreaseValue]);

  return (
    <View style={styles.timerContainer} testID="timer-display">
      <Text
        style={[
          styles.timerText,
          (timer.isPaused || timer.isBreak) && styles.pausedText,
        ]}>
        {timer.isPaused
          ? 'Paused'
          : timer.isCompleted
          ? 'Completed'
          : countdown}
      </Text>
      <Text style={{color: '#D3E5EB'}}>{formatCountdown(timer.elapsedTime)}</Text>
    </View>
  );
};

export default SessionTimer;
const styles = StyleSheet.create({
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 60,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
    color: 'rgb(7,254,213)',
  },
  pausedText: {
    color: '#D3E5EB',
  },
});
