import {Alert, StyleSheet, Text, View} from 'react-native'
import React, {useEffect} from 'react'

import {  User } from '../watermelon/models';
import EnhancedSubscribeScreen from "./SubscribeScreen";

interface Props
{
  user: User;
}



const SettingsScreen = ({user}: Props) => {
  return (
    <View>
      <EnhancedSubscribeScreen user={user} />
    </View>
  )
}

export default SettingsScreen

const styles = StyleSheet.create({})
