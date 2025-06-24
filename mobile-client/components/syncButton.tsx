import React, {useState, useEffect} from 'react';
import {View, Text, Pressable} from 'react-native';
import {hasUnsyncedChanges} from '@nozbe/watermelondb/sync';

import {useDatabase} from '@nozbe/watermelondb/react';

import {sync} from '../watermelon/sync'
import {useAuthContext} from '../services/AuthContext';
import {useInternetConnection} from "../hooks/useInternetConnection"
const SyncButton = () => {
  const {user} = useAuthContext();
  const {isConnected} = useInternetConnection()
  const [showButton, setShowButton] = useState(false);
  const watermelonDatabase = useDatabase()

  async function handleClick() {
    await sync(watermelonDatabase, isConnected, user?.id)
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
        <Pressable testID="sync-button" style={{padding: 10, color: 'blue'}} onPress={handleClick}><Text>Sync Changes</Text></Pressable>
      )}
    </View>
  )
}

export default SyncButton;
