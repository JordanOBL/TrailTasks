import { StyleSheet, Text, View } from 'react-native';
import withObservables from '@nozbe/with-observables';
import {Achievement, User, User_Achievement} from '../watermelon/models';
import React, {useEffect, useState} from 'react';
import Purchases from 'react-native-purchases';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import AchievementsList from '../components/Achievements/AchievementsList';
import EnhancedAchievementsList from '../components/Achievements/AchievementsList';
import { Q } from '@nozbe/watermelondb';
interface Props {
  user: User;
  usersAchievements: Achievement[];
}
const AchievementsScreen = ({user, usersAchievements}: Props) => {

  const watermelonDatabase = useDatabase();
  const [achievementsWithCompletion, setAchievementsWithCompletion] = useState<any>(null);

  async function getCustomerInfo() {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      // access latest customerInfo
      console.log(customerInfo);
    } catch (e) {
      // Error fetching customer info
    }
  }

  //make an unsafe query to join users_achievements on achievements and add  a completed column if achievement exists in users achievements 
  async function getAchievementsWithCompletion()
  {
    const query = `SELECT achievements.*, 
               CASE WHEN users_achievements.achievement_id IS NOT NULL THEN 1 ELSE 0 END AS completed 
               FROM achievements 
               LEFT JOIN users_achievements ON achievements.id = users_achievements.achievement_id 
               AND users_achievements.user_id = '${user.id}'`;
    
    try
    {
      const results = await watermelonDatabase.get('achievements').query(Q.unsafeSqlQuery(query)).unsafeFetchRaw()
      if (results.length > 0)
      {
        setAchievementsWithCompletion(results)
      }
      return 
      //console.debug('DEBUG: joined achievements and usersachieveents with completeion', {results})
    } catch (err)
    {
      console.error('Error in joinUsersAchievements', err)
      return null
    }
  }



  useEffect(() => {
    //getCustomerInfo();
    getAchievementsWithCompletion()
  }, [usersAchievements]);

if(achievementsWithCompletion){
  return (
    <View>
      <EnhancedAchievementsList
        user={user}
        achievementsWithCompletion={achievementsWithCompletion}
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
  usersAchievements: user.usersAchievements.observe(),

}))

const EnhancedAchievementsScreen = enhance(AchievementsScreen)
export default EnhancedAchievementsScreen;

const styles = StyleSheet.create({});
