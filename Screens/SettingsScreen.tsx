import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
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
      <Text>SettingsScreen</Text>
      <EnhancedSubscribeScreen user={user} />
    </View>
  )
}

export default SettingsScreen

const styles = StyleSheet.create({})
