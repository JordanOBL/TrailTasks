import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {withObservables} from '@nozbe/watermelondb/react';
import { Queued_Trail, User } from '../watermelon/models';
import EnhancedHikingQueue from '../components/HikingQueue/HikingQueue';

interface Props
{
  user: User,
  queuedTrails: Queued_Trail[]
}

const HikingQueueScreen = ({ user, queuedTrails }: Props) =>
{

  console.log('hikescreen hikingQueue', queuedTrails);
  return (
    <View>
      <Text>HikingQueueScreen</Text>
      <EnhancedHikingQueue user={user} queuedTrails={queuedTrails} />
    </View>
  );
}

const enhance = withObservables(['user', 'queuedTrails'], ({user}) => ({
  user: user.observe(),
  queuedTrails: user.queuedTrails,
  // Shortcut syntax for `post.comments.observe()`
}));

const EnhancedHikingQueueScreen = enhance(HikingQueueScreen);
export default EnhancedHikingQueueScreen;

//export default HikingQueueScreen

const styles = StyleSheet.create({})
