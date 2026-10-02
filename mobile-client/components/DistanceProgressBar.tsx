import * as Progress from 'react-native-progress';

import { Dimensions, StyleSheet, Text, View } from 'react-native';
import React from 'react';

import { EventBus } from '../EventBus/EventBus';
import { SessionDetails } from '../types/session';
import Timer from '../types/timer';
import { useTheme } from '../contexts/ThemeProvider';
import { withObservables } from '@nozbe/watermelondb/react';

interface Props {
  user: any;
  pace?: number;
  sessionDetails?: SessionDetails;
  timer?: Timer;
  currentTrail: any;
  height?: number;
  borderRadius?: number;
  barColor?: string;
  width?: number;
}

export const DistanceProgressBar = ({
  user,
  timer,
  currentTrail,
  sessionDetails,
  height,
  borderRadius,
  barColor,
  width: requestedWidth

}: Props) => {
  const { theme } = useTheme();

  const isPaused =
    (sessionDetails && timer && !sessionDetails.startTime) ||
    (sessionDetails && timer && timer.isPaused) ||
    (timer && timer.isBreak);

  const progressColor = isPaused ? theme.progressBarPaused : theme.progressBar;
  const trailProgress = Number(user?.trailProgress ?? 0);
  const trailDistance = Number(currentTrail?.trailDistance ?? 0);
  const progress = trailDistance > 0 ? Math.max(0, Math.min(1, trailProgress / trailDistance)) : 0;
  const width = requestedWidth ?? Dimensions.get('window').width - 50;



  return (
    <View style={{ alignItems: 'center' }}>
      <Progress.Bar
        width={width}
        height={height ?? 40}
        borderWidth={0}
        borderRadius={ borderRadius ?? 10}
        unfilledColor={theme.progressBarBackground}
        progress={progress}
        animationType="timing"
        useNativeDriver={true}
        color={barColor ?? progressColor}
      />
      <Text
        testID="trail-progress-text"
        style={{
          color: theme.progressText,
          alignSelf: 'center',
          fontWeight: 'thin',
          fontSize: 14,
          marginVertical: 5,
        }}
      >
        {trailProgress.toFixed(2)} / {trailDistance.toFixed(2)} mi.
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

