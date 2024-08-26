import {StyleSheet, Text, View, Pressable} from 'react-native';
import React from 'react';

import {useDatabase} from '@nozbe/watermelondb/hooks';

import {  User } from '../watermelon/models';
import withObservables from '@nozbe/with-observables';

interface Props
{
  user: User

}

const SubscribeScreen = ({user}: Props) => {
  return (
    <View>
      <Pressable
        style={{padding: 10, backgroundColor: 'green'}}>
        <Text style={{color: 'white'}}>Settings screen</Text>
      </Pressable>
    </View>
  );
};

const enhance = withObservables(['user'], ({user}) => ({
  user: user.observe(),

}));

const EnhancedSubscribeScreen = enhance(SubscribeScreen);


export default EnhancedSubscribeScreen;

const styles = StyleSheet.create({});
