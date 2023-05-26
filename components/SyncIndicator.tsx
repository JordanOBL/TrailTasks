import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {sync} from '../watermelon/sync';
import { Database } from '@nozbe/watermelondb';

interface Props
{
  delay: number
  database: Database
}
const SyncIndicator = ({delay, database} : Props) => {
  const [syncState, setSyncState] = useState<string>('Syncing data...');

  useEffect(() => {
    let timeoutId = setTimeout(() =>
    {
      sync(database)
      .then(() => setSyncState(''))
      .catch((e) =>
      {
        console.error(e);
        setSyncState('Sync failed!')
      });
    }, delay)

    return () => clearTimeout(timeoutId)
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
    backgroundColor: 'rgb(7,254,213)',
    color: 'white',
  },
});

export default SyncIndicator;
