import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Queued_Trail, Trail, User} from '../../watermelon/models';
import {useTheme} from '../../contexts/ThemeProvider';
import React from 'react';
import {withObservables} from '@nozbe/watermelondb/react';

interface Props {
  user: User;
  queuedTrail: Queued_Trail;
  trail: Trail;
  onDelete: () => void; // Function to handle deletion
  isCompleted: boolean
}

const QueuedTrailCard: React.FC<Props> = ({ user, queuedTrail, trail, onDelete, isCompleted }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.card}>
      <View style={styles.textContainer}>
        <Text style={styles.trailName}>{trail.trailName}</Text>
        <Text style={styles.trailInfo}>{trail.trailDistance} miles</Text>
        <Text style={[styles.status, isCompleted ? styles.completed : styles.pending]}>
          {isCompleted ? '✅ Completed' : '🕓 Not Completed'}
        </Text>
      </View>
      <Pressable onPress={() => queuedTrail.deleteTrailFromQueue()} style={styles.removeButton}>
        <Text style={styles.removeButtonText}>Remove</Text>
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

const getStyles = (theme) => StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 4,
    shadowColor: theme.shadow,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flexShrink: 1,
  },
  trailName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  trailInfo: {
    fontSize: 14,
    color: theme.secondaryText,
    marginTop: 2,
  },
  status: {
    fontSize: 13,
    marginTop: 4,
  },
  completed: {
    color: 'green',
  },
  pending: {
    color: 'orange',
  },
  removeButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  removeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

