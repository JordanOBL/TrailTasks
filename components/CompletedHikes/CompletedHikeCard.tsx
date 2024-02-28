import {StyleSheet, Text, View} from 'react-native';

import {Completed_Hike} from '../../watermelon/models';
import React from 'react';
import withObservables from '@nozbe/with-observables';

interface Props {
  completedHike: Completed_Hike;
  trail: any;
}

const CompletedHikeCard = ({completedHike, trail}: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.trailName}>{trail.trailName}</Text>
      <Text style={styles.trailInfo}>
        Distance: {trail.trailDistance} / {trail.trailDistance} miles
      </Text>
      <Text style={styles.trailInfo}>
        First Completed: {completedHike.firstCompletedAt}
      </Text>
      <Text style={styles.trailInfo}>
        Last Completed: {completedHike.lastCompletedAt}
      </Text>
      <Text style={styles.trailInfo}>
        Best Time: {completedHike.bestCompletedTime}
      </Text>
    </View>
  );
};

const enhance = withObservables(
  ['completedHike', 'trail'],
  ({completedHike}) => ({
    completedHike: completedHike.observe(),
    trail: completedHike.trail.observe(),
  })
);

export default enhance(CompletedHikeCard);

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
