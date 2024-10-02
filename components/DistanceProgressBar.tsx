import * as Progress from 'react-native-progress';

import {Dimensions, StyleSheet, Text, View} from 'react-native';

import React from 'react';
import { SessionDetails } from '../types/session';
import  Timer  from '../types/timer';
import withObservables from '@nozbe/with-observables';

interface Props {
  user: any;
  pace?: number;
  sessionDetails?: SessionDetails;
  timer: Timer;
  currentTrail: any
}
const DistanceProgressBar = ({
  user,
  pace,
  timer,
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
          (sessionDetails && timer && !sessionDetails.startTime) ||
          (sessionDetails && timer && timer.isPaused) ||
          (timer && timer.isBreak)
            ? '#E2DFDE'
            : 'rgb(7,254,213)'
        }
      /><Text
        style={{
          color: 'rgba(249,253,255, .5)',
          alignSelf: 'center',
          fontWeight: 'bold',
          fontSize: 14,
          marginRight: 0,
          marginVertical: 5,
        }}>
        {Number(user.trailProgress).toFixed(2)} / {Number(currentTrail.trailDistance).toFixed(2)} mi.
        
      </Text>
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

