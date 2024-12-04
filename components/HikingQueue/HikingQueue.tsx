import * as React from 'react';

import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Queued_Trail, User} from '../../watermelon/models';

import EnhancedQueuedTrailCard from './QueuedTrailCard';
import {withObservables} from '@nozbe/watermelondb/react';

interface Props {
  user: User;
  queuedTrails: Queued_Trail[];
}
const queuedTrails = ({user, queuedTrails}: Props) => {
  console.log('queuedTrails', queuedTrails);

  return (
    <View>
      <Text
        style={[
          styles.TrailName,
          {color: 'rgba(255,255,255,.5)', padding: 16},
        ]}>
        Next Hikes:
      </Text>
      {queuedTrails.length === 0 ? (
        <Text style={[styles.TrailName, {color: 'white', textAlign: 'center'}]}>
          Add new hikes to your queue from the 'EXPLORE' tab below!
        </Text>
      ) : (
        <FlatList
          data={queuedTrails}
          renderItem={({item, index}) => (
            <EnhancedQueuedTrailCard
              key={item.id}
              user={user}
              queuedTrail={item}
              index={index}
            />
          )}
        />
      )}
    </View>
  );
};

const enhance = withObservables(['user', 'queuedTrails'], ({user}) => ({
  user: user.observe(),
  queuedTrails: user.queuedTrails.observe(),

  // Shortcut syntax for `post.comments.observe()`
}));

const EnhancedqueuedTrails = enhance(queuedTrails);
export default EnhancedqueuedTrails;

const styles = StyleSheet.create({
  TrailContainer: {
    padding: 16,
    borderBottomWidth: 2,
    borderColor: 'rgba(255, 255, 255,.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  TrailName: {
    fontSize: 26,
    fontWeight: 'bold',
  },
});
