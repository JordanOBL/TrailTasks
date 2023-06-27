import {StyleSheet, Text, View, Pressable} from 'react-native';
import React from 'react';
import {Database} from '@nozbe/watermelondb';
import {useDatabase} from '@nozbe/watermelondb/hooks';
//import useUserSubscription from '../helpers/useUserSubscription';
import { Subscription, User } from '../watermelon/models';
import withObservables from '@nozbe/with-observables';

interface Props
{
  user: User
  userSubscription: Subscription[]
}

const SubscribeScreen = ({user, userSubscription}: Props) => {
  //const userSubscription = useUserSubscription();
  const database = useDatabase();
  return (
    <View>
      <Pressable
        onPress={async () => {
          await database.write(async () => {
            await userSubscription[0]!.update((subscription) => {
              subscription.isActive = !subscription.isActive;
            });
          });
        }}
        style={{padding: 10, backgroundColor: 'green'}}>
        <Text style={{color: 'white'}}>{userSubscription[0] && userSubscription[0].isActive ? 'unsubscribe' : 'subscribe'}</Text>
      </Pressable>
    </View>
  );
};

const enhance = withObservables(['user', 'userSubscription'], ({user, userSubscription}) => ({
  user: user.observe(),
  userSubscription: user.usersSubscriptions.observe(),
}));

const EnhancedSubscribeScreen = enhance(SubscribeScreen);


export default EnhancedSubscribeScreen;

const styles = StyleSheet.create({});
