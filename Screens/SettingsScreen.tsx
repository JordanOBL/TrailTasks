import { Pressable, StyleSheet, Text, View } from 'react-native'

import EnhancedSubscribeScreen from "./SubscribeScreen";
import React from 'react'
import { User } from '../watermelon/models';
import {sync} from '../watermelon/sync';
import { useDatabase } from '@nozbe/watermelondb/react';

interface Props
{
  user: User;

}
const SettingsScreen = ({user}: Props) => {
  const database = useDatabase();
  return (
    <View style={{display: 'flex'}}>
      <EnhancedSubscribeScreen user={user} />
      <Pressable style={{padding: 10, backgroundColor: 'rgb(31,33,35)'}} onPress={() => sync(database, user.id)}><Text style={{color: "white"}} >Sync</Text></Pressable>
    </View>
  )
}

export default SettingsScreen


