import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import * as Progress from 'react-native-progress';
import {JoinedUserTrail, SessionDetails} from '../types/session';

interface Props {
  trailProgress: number;
  trailDistance: number;
	pace?: number;
	sessionDetails?: SessionDetails;
}
const DistanceProgressBar = ({trailProgress, trailDistance, pace, sessionDetails}: Props) => {
  return (
    <View
      style={{
        alignItems: 'center',
      }}>
      <Text
        style={{
          color: 'rgb(249,253,255)',
          alignSelf: 'flex-end',
          fontWeight: '600',
          fontSize: 16,
          marginRight: 20,
          marginBottom: 5,
        }}>
        {trailProgress} / {trailDistance} mi.
        {pace && `- ${pace} mph`}
      </Text>

      <Progress.Bar
        width={350}
        height={40}
        borderWidth={0}
        borderRadius={10}
        unfilledColor={'rgba(41,184,169, .2)'}
        progress={trailProgress / trailDistance}
        animationType="timing"
        useNativeDriver={true}
        color={
          (sessionDetails && sessionDetails.isSessionStarted === false) ||
          (sessionDetails && sessionDetails.isPaused === true) ||
          (sessionDetails &&
            sessionDetails.elapsedPomodoroTime ===
              sessionDetails.initialPomodoroTime)
            ? 'rgb(217,49,7)'
            : 'rgb(7,254,213)'
        }
      />
    </View>
  );
};

export default DistanceProgressBar;

const styles = StyleSheet.create({});
