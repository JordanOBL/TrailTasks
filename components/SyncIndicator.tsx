import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {sync} from '../watermelon/sync';

const SyncIndicator = () => {
  const [syncState, setSyncState] = useState<string>('Syncing data...');

  useEffect(() => {
    sync()
      .then(() => setSyncState(''))
      .catch(() => setSyncState('Sync failed!'));
  });

  if (!syncState) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text>{syncState}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 5,
    alignItems: 'center',
    backgroundColor: 'orange',
    color: 'white',
  },
});

export default SyncIndicator;
