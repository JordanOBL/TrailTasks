import { Pressable, StyleSheet, Text, View } from 'react-native'

import EnhancedSubscribeScreen from "./SubscribeScreen";
import React from 'react'
import { User } from '../watermelon/models';
import {sync} from '../watermelon/sync';
import { useDatabase } from '@nozbe/watermelondb/react';
import {useInternetConnection} from '../hooks/useInternetConnection';

interface Props
{
  user: User;

}
const SettingsScreen = ({user}: Props) => {
  const database = useDatabase();
  const {isConnected} = useInternetConnection();
  return (
    <View style={{display: 'flex'}}>
      <EnhancedSubscribeScreen user={user} />
      <Pressable style={{padding: 10, backgroundColor: 'rgb(31,33,35)'}} onPress={() => sync(database,isConnected, user.id)}><Text style={{color: "white"}} >Sync</Text></Pressable>
    </View>
  )
}

export default SettingsScreen


