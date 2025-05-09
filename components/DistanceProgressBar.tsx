import * as Progress from 'react-native-progress';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { SessionDetails } from '../types/session';
import Timer from '../types/timer';
import { withObservables } from '@nozbe/watermelondb/react';
import { useTheme } from '../contexts/ThemeProvider';

interface Props {
  user: any;
  pace?: number;
  sessionDetails?: SessionDetails;
  timer: Timer;
  currentTrail: any;
}

const DistanceProgressBar = ({
  user,
  timer,
  currentTrail,
  sessionDetails,
}: Props) => {
  const width = Dimensions.get('window').width;
  const { theme } = useTheme();

  const isPaused =
    (sessionDetails && timer && !sessionDetails.startTime) ||
    (sessionDetails && timer && timer.isPaused) ||
    (timer && timer.isBreak);

  const progressColor = isPaused ? theme.progressBarPaused : theme.progressBar;

  return (
    <View style={{ alignItems: 'center' }}>
      <Progress.Bar
        width={width - 50}
        height={40}
        borderWidth={0}
        borderRadius={10}
        unfilledColor={theme.progressBarBackground}
        progress={Number(user.trailProgress) / Number(currentTrail.trailDistance)}
        animationType="timing"
        useNativeDriver={true}
        color={progressColor}
      />
      <Text
        style={{
          color: theme.progressText,
          alignSelf: 'center',
          fontWeight: 'thin',
          fontSize: 14,
          marginVertical: 5,
        }}
      >
        {Number(user.trailProgress).toFixed(2)} / {Number(currentTrail.trailDistance).toFixed(2)} mi.
      </Text>
    </View>
  );
};

const enhance = withObservables(['user'], ({ user }) => ({
  user: user.observe(),
  currentTrail: user.trail.observe(),
}));

const EnhancedDistanceProgressBar = enhance(DistanceProgressBar);
export default EnhancedDistanceProgressBar;

