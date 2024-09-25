import { StyleSheet, Text, View, Pressable} from 'react-native'
import React from 'react'
import {sync} from '../watermelon/sync';
import {  User } from '../watermelon/models';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import EnhancedSubscribeScreen from "./SubscribeScreen";

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


