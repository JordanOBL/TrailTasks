import { StyleSheet, Text, View, SafeAreaView } from 'react-native'
import React from 'react'

interface Props
{
  item: any, index: number, user: any
}
const UserRow = ({item, index, user}: Props) => {
  return (
    <SafeAreaView
      style={{
        backgroundColor: 'black',
        flexDirection: 'row',
        width: '100%',
        marginVertical: 2,
      }}>
      <View
        style={{
          borderColor:
            item.user_id === user.id ? 'rgb(7,254,213)' : 'rgb(61,63,65)',
          borderWidth: 1,
          padding: 5,
          width: '20%',
          justifyContent: 'center',
        }}>
        <Text
          style={{
            color:
              item.user_id === user.id ? 'rgb(7,254,213)' : 'rgb(151,153,155)',
            fontWeight: 'bold',
            fontSize: 18,
            textAlign: 'center',
            padding: 5,
          }}>
          {index + 1}
        </Text>
      </View>
      <View
        style={{
          borderColor:
            item.user_id === user.id ? 'rgb(7,254,213)' : 'rgb(61,63,65)',
          borderWidth: 1,
          width: '50%',
          padding: 5,
          justifyContent: 'center',
        }}>
        <Text
          style={{
            color:
              item.user_id == user.id ? 'rgb(7,254,213)' : 'rgb(161,163,165)',
            fontWeight: 'bold',
            fontSize: 18,
            textAlign: 'center',
          }}>
          {item.username}
        </Text>
      </View>
      <View
        style={{
          borderColor:
            item.user_id === user.id ? 'rgb(7,254,213)' : 'rgb(61,63,65)',
          borderWidth: 1,
          width: '30%',
          padding: 5,
          justifyContent: 'center',
        }}>
        <Text
          style={{
            color:
              item.user_id === user.id ? 'rgb(7,254,213)' : 'rgb(161,163,165)',
            fontWeight: 'bold',
            fontSize: 18,
            textAlign: 'center',
          }}>
          {item.total_miles} mi.
        </Text>
      </View>
    </SafeAreaView>
  );
}

export default UserRow

const styles = StyleSheet.create({})