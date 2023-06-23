import {StyleSheet, Text, View, SafeAreaView} from 'react-native';
import React from 'react';
import withObservables from '@nozbe/with-observables';
import { User } from '../../watermelon/models';
interface Props {
  userMiles: any;
  index: number;
  user: User,
  otherUser: User
}
const UserMile = ({userMiles, index, user, otherUser}: Props) => {
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
            userMiles.userId === user.id ? 'rgb(7,254,213)' : 'rgb(61,63,65)',
          borderWidth: 1,
          padding: 5,
          width: '20%',
          justifyContent: 'center',
        }}>
        <Text
          style={{
            color:
              userMiles.userId === user.id
                ? 'rgb(7,254,213)'
                : 'rgb(151,153,155)',
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
            userMiles.userId === user.id ? 'rgb(7,254,213)' : 'rgb(61,63,65)',
          borderWidth: 1,
          width: '50%',
          padding: 5,
          justifyContent: 'center',
        }}>
        <Text
          style={{
            color:
              userMiles.userId == user.id
                ? 'rgb(7,254,213)'
                : 'rgb(161,163,165)',
            fontWeight: 'bold',
            fontSize: 18,
            textAlign: 'center',
          }}>
          {otherUser.username}
        </Text>
      </View>
      <View
        style={{
          borderColor:
            userMiles.userId === user.id ? 'rgb(7,254,213)' : 'rgb(61,63,65)',
          borderWidth: 1,
          width: '30%',
          padding: 5,
          justifyContent: 'center',
        }}>
        <Text
          style={{
            color:
              userMiles.userId === user.id
                ? 'rgb(7,254,213)'
                : 'rgb(161,163,165)',
            fontWeight: 'bold',
            fontSize: 18,
            textAlign: 'center',
          }}>
          {userMiles.totalMiles} mi.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const enhance = withObservables(['userMiles', 'user'], ({userMiles, user}) => ({
  userMiles,
  user,
 otherUser : userMiles.user.observe()
}));

const EnhancedUserMile = enhance(UserMile);
export default EnhancedUserMile;

const styles = StyleSheet.create({});
