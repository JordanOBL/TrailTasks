import { StyleSheet, Text, View } from 'react-native';
import withObservables from '@nozbe/with-observables';
import {Achievement, User, User_Achievement} from '../watermelon/models';
import React, {useEffect, useState} from 'react';
import Purchases from 'react-native-purchases';
import { Database } from '@nozbe/watermelondb';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import AchievementsList from '../components/Achievements/AchievementsList';
import EnhancedAchievementsList from '../components/Achievements/AchievementsList';
interface Props {
  user: User;
  usersAchievements: Achievement[];
}
const AchievementsScreen = ({user, usersAchievements}: Props) => {

  const watermelonDatabase = useDatabase();
  async function getCustomerInfo() {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      // access latest customerInfo
      console.log(customerInfo);
    } catch (e) {
      // Error fetching customer info
    }
  }

  const [achievementsCollection, setAchievementsCollection] = useState<any>(null);

  async function getAchievementsCollection() {
    const achievementsCollection = await watermelonDatabase.collections
      .get('achievements')
      .query()
      .fetch();
    setAchievementsCollection(achievementsCollection);
  }


  useEffect(() => {
    getCustomerInfo();
    getAchievementsCollection()
  }, []);

if(achievementsCollection){
  return (
    <View>
      <EnhancedAchievementsList
        user={user}
        achievements={achievementsCollection}
      />
    </View>
  );
}
  return (
    <View>
      <Text style={{color: 'white'}}>Loading Achievements</Text>
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
