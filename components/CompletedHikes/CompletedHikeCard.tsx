import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import withObservables from '@nozbe/with-observables';
import {Completed_Hike} from '../../watermelon/models';

interface Props {
  completedHike: Completed_Hike;
  trail: any;

}

const CompletedHikeCard = ({completedHike, trail }: Props) => {
  return (
    <View style={styles.TrailContainer}>
      <Text style={styles.TrailName}>{trail.trailName}</Text>
      {/* <Text style={styles.TrailPark}>
        {item.park_name} {.park_type} Park
      </Text> */}
      <Text style={styles.TrailStats}>
        Distance: {' '}
        <Text style={{fontWeight: '600'}}>
          {trail.trailDistance} / {trail.trailDistance} miles
        </Text>
      </Text>
      <Text style={styles.TrailStats}>
        First Completed: <Text style={{fontWeight: '600'}}> {completedHike.firstCompletedAt}</Text>
      </Text>
      <Text style={styles.TrailStats}>
        Last Completed: <Text style={{fontWeight: '600'}}> {completedHike.lastCompletedAt}</Text>
      </Text>
      <Text style={styles.TrailStats}>
        Best Time:<Text style={{fontWeight: '600'}}> {completedHike.bestCompletedTime}</Text> 
      </Text>
    </View>
  );
};

const enhance = withObservables(['completedHike', 'trail'], ({completedHike}) => ({
  completedHike: completedHike.observe(),
  trail: completedHike.trail.observe(),
}));

const EnhancedCompletedHikeCard = enhance(CompletedHikeCard);

export default EnhancedCompletedHikeCard;

const styles = StyleSheet.create({
  TrailContainer: {
    padding: 10,
    flex: 1,
    marginVertical: 10,
    backgroundColor: 'rgb(31, 33, 35)',
    borderRadius: 10,
  },
  TrailName: {
    fontSize: 26,
    fontWeight: '800',
    color: 'rgb(7,254,213)',
    padding: 5,
  },
  TrailStats: {
    fontSize: 16,
    fontWeight: '800',
    color: 'rgb(221,224,226)',
    padding: 5,
  },
  TrailPark: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgb(221,224,226)',
    padding: 5,
  },
});
