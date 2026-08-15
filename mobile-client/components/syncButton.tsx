import {Pressable, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';

import {hasUnsyncedChanges} from '@nozbe/watermelondb/sync';
import {sync} from '../watermelon/sync'
import {useAuthContext} from '../services/AuthContext';
import {useDatabase} from '@nozbe/watermelondb/react';
import {useInternetConnection} from "../contexts/InternetConnectionProvider"

const SyncButton = () => {
  const {user} = useAuthContext();
  const {isConnected} = useInternetConnection()
  const [showButton, setShowButton] = useState(false);
  const watermelonDatabase = useDatabase()

  async function handleClick() {
    await sync(watermelonDatabase, isConnected, user?.id)
    //@ts-ignore
    checkUnsyncedChanges({database: watermelonDatabase});

  }
      const checkUnsyncedChanges = async () => {
      const unsyncedChanges = await hasUnsyncedChanges({database: watermelonDatabase});
      setShowButton(unsyncedChanges);
    };

 
  useEffect(() => {

    checkUnsyncedChanges();
  }, [])

  return (
    <View>
      {showButton && (
        <Pressable testID="sync-button" style={{padding: 10, backgroundColor: 'blue'}} onPress={handleClick}><Text>Sync Changes</Text></Pressable>
      )}
    </View>
  )
}

export default SyncButton;
