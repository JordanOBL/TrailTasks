import {StyleSheet, Text, View, SafeAreaView} from 'react-native';
import React from 'react';
import {withObservables} from '@nozbe/watermelondb/react';
import {User} from '../../watermelon/models';

interface Props {
  hiker?: any;
  index: number;
  user: User;
  userRank?:any;
}

const UserMile = ({ index, user, hiker, userRank }: Props) => {
  const isCurrentUser = hiker?.username === user?.username;
  const borderColor = isCurrentUser ? 'rgb(7,254,213)' : 'rgb(31, 33, 35)';
  const textColor = isCurrentUser ? 'rgb(7,254,213)' : 'rgb(221, 224, 226)';
  const backgroundColor = isCurrentUser ? 'rgba(7, 254, 213, 0.1)' : 'rgb(24, 25, 27)';

  return (
    <SafeAreaView style={[styles.container, { borderColor, backgroundColor }]}>
      <View style={[styles.column, { width: '20%' }]}>
        <Text style={[styles.text, { color: textColor }]}>
          {userRank?.rank || index + 1}
        </Text>
      </View>
      <View style={[styles.column, { width: '50%' }]}>
        <Text style={[styles.text, { color: textColor }]} numberOfLines={1}>
          {hiker?.username || user.username}
        </Text>
      </View>
      <View style={[styles.column, { width: '30%' }]}>
        <Text style={[styles.text, { color: textColor }]}>
          {parseFloat(hiker?.total_miles || '0').toFixed(2)} mi
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
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  column: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
