
import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import Timer from '../../types/timer';
import formatCountdown from '../../helpers/Timer/formatCountdown';

interface Props {
  timer: Timer;
  setTimer: React.Dispatch<React.SetStateAction<Timer>>;
}

const PhysicalSessionTimer = ({
  timer,
  setTimer,
}: Props) => {
  const elapsedTime = formatCountdown(timer.elapsedTime);

 useEffect(() => {
  let timerInterval: NodeJS.Timeout | undefined;

  if (timer?.isRunning && !timer?.isPaused && !timer.isCompleted) {
    timerInterval = setInterval(() => {
      setTimer((prev) => {
          return { ...prev, elapsedTime: prev.elapsedTime + 1 };
        }) 
      }, 1000);
  }

  return () => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
  };
}, [timer?.isRunning, timer?.isPaused, timer?.isCompleted]);

  return (
    <View style={styles.timerContainer} testID="timer-display">
      <Text
        style={[
          styles.timerText,
          timer.isPaused  && styles.pausedText,
        ]}>
        {timer.isPaused
          ? 'Paused'
          : elapsedTime}
      </Text>
    </View>
  );
};

export default PhysicalSessionTimer;
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
