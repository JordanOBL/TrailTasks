import {StyleSheet, Text, View} from 'react-native';

import React from 'react';
import { SessionSnapshot } from '../../sessionEngine/sessionEngine';
import formatCountdown from '../../helpers/Timer/formatCountdown';

const SessionTimer = React.memo(({snapshot}: {snapshot: SessionSnapshot}) => {

  const isCompleted = snapshot.phase === 'COMPLETED'

  const timerDisplay = React.useMemo(() => {
    if(snapshot.phase === 'FOCUS') return formatCountdown(snapshot.focusTimeSec - snapshot.elapsedInPhaseSec)
    if(snapshot.phase === 'SHORT_BREAK') return formatCountdown(snapshot.shortBreakSec - snapshot.elapsedInPhaseSec)
    if(snapshot.phase === 'LONG_BREAK') return formatCountdown(snapshot.longBreakSec - snapshot.elapsedInPhaseSec) 
  }, [snapshot.phase, snapshot.shortBreakSec, snapshot.longBreakSec, snapshot.elapsedInPhaseSec])


  return (
    <View style={styles.timerContainer} testID="timer-display">
      <Text
        style={[
          styles.timerText,
          (snapshot.isPaused || snapshot.phase.includes('BREAK')) && styles.pausedText,
        ]}>
        {snapshot.isPaused
          ? 'Paused'
          : isCompleted
          ? 'Completed'
          : timerDisplay}
      </Text>
      <Text style={{color: '#D3E5EB'}}>{formatCountdown(snapshot.totalElapsedSec)}</Text>
    </View>
  );
})

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
