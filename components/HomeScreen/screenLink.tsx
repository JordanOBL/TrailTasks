import {Pressable, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {User} from '../../watermelon/models';
interface Props {
  children: any;
  navTo: string;
  navigation: any;
  user: User;
  hasActiveSubscription: boolean;
  needsActiveSubscription: boolean;
}
const ScreenLink = ({
  children,
  navigation,
  navTo,
  user,
  hasActiveSubscription,
  needsActiveSubscription,
}: Props) => {
  return (
    <Pressable
      style={styles.LinkContainer}
      onPress={() =>
        !needsActiveSubscription
          ? navigation.navigate(navTo)
          : hasActiveSubscription
          ? navigation.navigate(navTo)
          : navigation.navigate('Subscribe')
      }>
      <Text
        style={[
          styles.H2,
          {
            color:
              needsActiveSubscription && hasActiveSubscription
                ? 'rgb(249,253,255)'
                : needsActiveSubscription && !hasActiveSubscription
                ? 'rgb(149,153,155)'
                : 'rgb(249,253,255)',
          },
        ]}>
        {children}
        {needsActiveSubscription && hasActiveSubscription
          ? ''
          : needsActiveSubscription && !hasActiveSubscription
          ? ' - Upgrade to Pro'
          : ''}
      </Text>
    </Pressable>
  );
};

export default ScreenLink;

const styles = StyleSheet.create({
  H2: {
    color: 'rgb(249,253,255)',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'left',
  },

  LinkContainer: {
    borderColor: 'rgb(31,33,35)',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: 'rgb(31,33,35)',
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    color: 'rgb(221,224,226)',
    fontWeight: '900',
    marginBottom: 10,
    padding: 20,
  },
});
