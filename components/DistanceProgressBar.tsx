import * as Progress from 'react-native-progress';

import {Dimensions, StyleSheet, Text, View} from 'react-native';

import React from 'react';
import { SessionDetails } from '../types/session';
import withObservables from '@nozbe/with-observables';

interface Props {
  user: any;
  pace?: number;
  sessionDetails?: SessionDetails;
  currentTrail: any
}
const DistanceProgressBar = ({
  user,
  pace,
  currentTrail,
  sessionDetails,
 
}: Props) =>
{
  const width = Dimensions.get('window').width;
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
          marginRight: 25,
          marginBottom: 5,
        }}>
        {Number(user.trailProgress)} / {Number(currentTrail.trailDistance)} mi.
        
      </Text>

      <Progress.Bar
        width={width - 50}
        height={40}
        borderWidth={0}
        borderRadius={10}
        unfilledColor={'rgba(41,184,169, .2)'}
        progress={
          Number(user.trailProgress) / Number(currentTrail.trailDistance)
        }
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
}



const enhance = withObservables(['user'], ({user}) => ({
  user: user.observe(),
  currentTrail: user.trail.observe(),
  // Shortcut syntax for `post.comments.observe()`
}));

const EnhancedDistanceProgressBar = enhance(DistanceProgressBar);
export default EnhancedDistanceProgressBar;
//export default DistanceProgressBar;

const styles = StyleSheet.create({});

