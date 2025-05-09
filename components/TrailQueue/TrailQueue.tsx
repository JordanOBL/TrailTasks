import * as React from 'react';

import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Queued_Trail, User, Completed_Trail} from '../../watermelon/models';
import {useTheme} from '../../contexts/ThemeProvider';

import EnhancedQueuedTrailCard from './QueuedTrailCard';
import {withObservables} from '@nozbe/watermelondb/react';

interface Props {
  user: User;
  queuedTrails: Queued_Trail[];
  completedTrails: Completed_Trail[];

}
const TrailQueue = ({ user, queuedTrails, completedTrails }: Props) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const completedQueuedTrailMap = {};
  queuedTrails.forEach(q => completedQueuedTrailMap[q.trailId] = false);
  completedTrails.forEach(c => {
    if (completedQueuedTrailMap.hasOwnProperty(c.trailId)) {
      completedQueuedTrailMap[c.trailId] = true;
    }
  });

  return (
    <View>
      {queuedTrails.length === 0 ? (
        <Text style={styles.emptyText}>
          Your hiking queue is empty. Add some trails from the Explore tab.
        </Text>
      ) : (
        <FlatList
          data={queuedTrails}
          contentContainerStyle={{ paddingBottom: 16 }}
          renderItem={({ item, index }) => (
            <EnhancedQueuedTrailCard
              key={item.id}
              user={user}
              queuedTrail={item}
              index={index}
              isCompleted={completedQueuedTrailMap[item.trailId]}
            />
          )}
        />
      )}
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  emptyText: {
    textAlign: 'center',
    color: theme.secondaryText,
    fontSize: 16,
    padding: 20,
  },
});
const enhance = withObservables(['user', 'queuedTrails', 'completedTrails'], ({user}) => ({
  user: user.observe(),
  queuedTrails: user.usersQueuedTrails.observe(),
  completedTrails: user.usersCompletedTrails.observe(),

  // Shortcut syntax for `post.comments.observe()`
}));

const EnhancedTrailQueue = enhance(TrailQueue);
export default EnhancedTrailQueue;


