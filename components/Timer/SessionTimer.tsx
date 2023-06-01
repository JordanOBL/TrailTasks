import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

interface Props
{
  timerState: any;
  setTimerState: React.Dispatch<React.SetStateAction<any>>;
}
const SessionTimer = ({timerState, setTimerState}: Props) => {
  return (
    <View>
      <Text>SessionTimer</Text>
    </View>
  )
}

export default SessionTimer

const styles = StyleSheet.create({})