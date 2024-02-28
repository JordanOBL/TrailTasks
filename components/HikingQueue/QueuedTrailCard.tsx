import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Queued_Trail, Trail, User} from '../../watermelon/models';

import React from 'react';
import withObservables from '@nozbe/with-observables';

interface Props {
  user: User;
  queuedTrail: Queued_Trail;
  trail: Trail;
  onDelete: () => void; // Function to handle deletion
}

const QueuedTrailCard: React.FC<Props> = ({
  user,
  queuedTrail,
  trail,
  onDelete,
}) => {
  console.log(queuedTrail);

  return (
    <View style={styles.container}>
      <View>
        <Text style={[styles.trailName, {color: 'white'}]}>
          {trail.trailName}
        </Text>
        <Text style={{color: 'white', fontSize: 16}}>
          {trail.trailDistance} miles
        </Text>
      </View>
      <Pressable
        onPress={() => queuedTrail.deleteTrailFromQueue()}
        style={[styles.button, styles.buttonRemove]}>
        <Text style={styles.buttonText}>Remove</Text>
      </Pressable>
    </View>
  );
};

const enhance = withObservables(
  ['user', 'queuedTrail'],
  ({user, queuedTrail}) => ({
    user: user.observe(),
    trail: queuedTrail.trail.observe(),
  })
);

export default enhance(QueuedTrailCard);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  trailName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRemove: {
    backgroundColor: 'red',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
