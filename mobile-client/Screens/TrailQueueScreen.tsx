import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {withObservables} from '@nozbe/watermelondb/react';
import { Queued_Trail, User } from '../watermelon/models';
import EnhancedTrailQueue from '../components/TrailQueue/TrailQueue';
import { useTheme } from '../contexts/ThemeProvider';

interface Props
{
  user: User,
  queuedTrails: Queued_Trail[]
}

const TrailQueueScreen = ({ user, queuedTrails }: Props) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upcoming Hikes</Text>
      <EnhancedTrailQueue user={user} queuedTrails={queuedTrails} />
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 12,
    textAlign: 'center',
  },
});

const enhance = withObservables(['user', 'queuedTrails'], ({user}) => ({
  user: user.observe(),
  queuedTrails: user.usersQueuedTrails,
  // Shortcut syntax for `post.comments.observe()`
}));

const EnhancedTrailQueueScreen = enhance(TrailQueueScreen);
export default EnhancedTrailQueueScreen;


