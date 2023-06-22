import {StyleSheet, Text, View, Pressable} from 'react-native';
import React from 'react';
import {Database} from '@nozbe/watermelondb';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import useUserSubscription from '../helpers/useUserSubscription';

const SubscribeScreen = () => {
  const userSubscription = useUserSubscription();
  const database = useDatabase();
  return (
    <View>
      <Text>SubscribeScreen</Text>
      <Pressable
        onPress={async () => {
          await database.write(async () => {
            await userSubscription!.update((subscription) => {
              subscription.isActive = !subscription.isActive;
            });
          });
        }}
        style={{padding: 10, backgroundColor: 'green'}}>
        <Text style={{color: 'white'}}>{userSubscription && userSubscription.isActive ? 'unsubscribe' : 'subscribe'}</Text>
      </Pressable>
    </View>
  );
};

export default SubscribeScreen;

const styles = StyleSheet.create({});
