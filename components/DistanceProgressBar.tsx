import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import * as Progress from 'react-native-progress';
import { JoinedUserTrail, SessionDetails } from '../types/session';



interface Props {
  user: any;
  pace?: number;
  sessionDetails?: SessionDetails;
  trail: any
}
const DistanceProgressBar = ({
  user,
  pace,
  trail,
  sessionDetails,
 
}: Props) =>
{
  React.useEffect(() => {
    // Handle trail or user change
    console.log('Trail or user changed:', user);
  }, [ trail]);

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
        {Number(user.trailProgress)} / {Number(trail.trailDistance)} mi.
        {pace && `- ${pace} mph`}
      </Text>

      <Progress.Bar
        width={350}
        height={40}
        borderWidth={0}
        borderRadius={10}
        unfilledColor={'rgba(41,184,169, .2)'}
        progress={Number(user.trailProgress) /Number(trail.trailDistance)}
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




export default DistanceProgressBar;

const styles = StyleSheet.create({});

