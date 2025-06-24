import {StyleSheet, Text, View} from 'react-native';

import {User_Completed_Trail} from '../../watermelon/models';
import React from 'react';
import {withObservables} from '@nozbe/watermelondb/react';

interface Props {
  completedTrail: User_Completed_Trail;
  trail: any;
}

const CompletedTrailCard = ({completedTrail, trail}: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.trailName}>{trail.trailName}</Text>
      <Text style={styles.trailInfo}>
        Distance: {trail.trailDistance} / {trail.trailDistance} miles
      </Text>
      <Text style={styles.trailInfo}>
        First Completed: {completedTrail.firstCompletedAt}
      </Text>
      <Text style={styles.trailInfo}>
        Last Completed: {completedTrail.lastCompletedAt}
      </Text>
      <Text style={styles.trailInfo}>
        Best Time: {completedTrail.bestCompletedTime}
      </Text>
    </View>
  );
};

const enhance = withObservables(
  ['completedTrail', 'trail'],
  ({completedTrail}) => ({
    completedTrail: completedTrail.observe(),
    trail: completedTrail.trail.observe(),
  })
);

export default enhance(CompletedTrailCard);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#1f2123',
    borderRadius: 10,
    marginBottom: 16,
  },
  trailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#07fed5',
    marginBottom: 8,
  },
  trailInfo: {
    fontSize: 16,
    color: '#dddfe2',
    marginBottom: 4,
  },
});
