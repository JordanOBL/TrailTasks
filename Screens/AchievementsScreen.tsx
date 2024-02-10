import { StyleSheet, Text, View } from 'react-native';
import withObservables from '@nozbe/with-observables';
import {Achievement, User, User_Achievement} from '../watermelon/models';
import React, {useEffect} from 'react';
import Purchases from 'react-native-purchases';

interface Props {
  user: User;
  usersAchievements: Achievement[];
}
const AchievementsScreen = ({user, usersAchievements}: Props) => {
  async function getCustomerInfo() {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      // access latest customerInfo
      console.log(customerInfo);
    } catch (e) {
      // Error fetching customer info
    }
  }

  useEffect(() => {
    getCustomerInfo();
    console.log({usersAchievements})
  }, []);
  return (
    <View>
      <Text>AchievementsScreen</Text>
    </View>
  );
};



const enhance = withObservables(['user', 'usersAchievements'], ({ user }) =>
({ 
  user,
    usersAchievements: user.usersAchievements.observe()
}))

const EnhancedAchievementsScreen = enhance(AchievementsScreen)
export default EnhancedAchievementsScreen;

const styles = StyleSheet.create({});
