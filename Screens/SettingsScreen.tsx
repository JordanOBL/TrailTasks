import {Alert, StyleSheet, Text, View} from 'react-native'
import React, {useEffect} from 'react'
import SubscribeScreen from './SubscribeScreen'
import EnhancedSubscribeScreen from './SubscribeScreen'
import { Subscription, User } from '../watermelon/models';

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
