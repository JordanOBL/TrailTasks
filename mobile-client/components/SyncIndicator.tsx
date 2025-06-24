import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';

import {Database} from '@nozbe/watermelondb';

interface Props {
  delay: number;
  database: Database;
}
const SyncIndicator = ({delay, database}: Props) => {
  const [syncState, setSyncState] = useState<string>('Syncing data...');

  useEffect(() => {
    let timeoutId = setTimeout(() => {
      // database.localStorage
      //   .get('isConnected')
      //   .then((isConnected) => {
      //     if (isConnected) {
            setSyncState('');
          // } else {
          //   setTimeout(() => {
          //     setSyncState('');
            // }, 3000);
            
        //     setSyncState('Sync failed! User Offline');
        //   }
        // })
        // .catch((e) => {
        //   setTimeout(() => {
        //     setSyncState('');
        //   }, 3000);

        //   console.error(e);
        //   setSyncState('Sync failed!');
        // });
    }, delay);

    return () => { clearTimeout(timeoutId)};
  }, []);

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
