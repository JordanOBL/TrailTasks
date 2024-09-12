import {StyleSheet, Text, View, SafeAreaView} from 'react-native';
import React from 'react';
import withObservables from '@nozbe/with-observables';
import {User} from '../../watermelon/models';

interface Props {
  hiker?: any;
  index: number;
  user: User;
  userRank?:any;
}

const UserMile = ({ index, user, hiker, userRank}: Props) => {
  const borderColor =
     hiker?.username === user?.username ? 'rgb(7,254,213)' : 'rgb(61,63,65)';
  const textColor =
      hiker?.username === user?.username  ? 'rgb(7,254,213)' : 'rgb(161,163,165)';

  return (
    <SafeAreaView style={[styles.container, {borderColor}]}>
      <View style={[styles.column, {width: '20%'}]}>
        <Text style={[styles.text, {color: textColor}]}>{userRank?.rank || index + 1}</Text>
      </View>
      <View style={[styles.column, {width: '50%'}]}>
        <Text style={[styles.text, {color: textColor}]}>
          {hiker?.username || user.username}
        </Text>
      </View>
      <View style={[styles.column, {width: '30%'}]}>
        <Text style={[styles.text, {color: textColor}]}>
          {!hiker?.total_miles ? '0.00' :  hiker?.total_miles } mi.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const enhance = withObservables(['user'], ({ user}) => ({
  user,
}));

const EnhancedUserMile = enhance(UserMile);
export default EnhancedUserMile;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    flexDirection: 'row',
    width: '100%',
    marginVertical: 2,
    borderWidth: 1,
    padding: 5,
  },
  column: {
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'rgb(61,63,65)',
    borderRightWidth: 1,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    padding: 5,
  },
});
