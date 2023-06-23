import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Subscription} from '../watermelon/models';
import {useDatabase} from '@nozbe/watermelondb/hooks';

const useUserSubscription = () => {
  const database = useDatabase();
  const [userSubscription, setUserSubscription] =
    useState<Subscription | null>();
  async function getSubscription() {
    try {
      const subscriptionId: string | void = await database.localStorage.get(
        'subscription_id'
      );
      const subscription = await database
        .get('users_subscriptions')
        .find(subscriptionId!);
      //console.log('user subscription', subscription);
      //@ts-ignore
      setUserSubscription(subscription);
    } catch (error) {
      console.log('Error in useUserSubscription', error);
    }
  }
  useEffect(() => {
    getSubscription();
  },[]);
  return userSubscription;
};

export default useUserSubscription;
