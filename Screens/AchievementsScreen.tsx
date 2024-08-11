import {Achievement, User} from '../watermelon/models';
import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import EnhancedAchievementsList from '../components/Achievements/AchievementsList';
import {Q} from '@nozbe/watermelondb';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import withObservables from '@nozbe/with-observables';

interface Props {
  user: User;
}

const AchievementsScreen = ({user}: Props) => {
  const watermelonDatabase = useDatabase();
  const [achievementsWithCompletion, setAchievementsWithCompletion] =
    useState<any>(null);

  async function getAchievementsWithCompletion() {
    const query = `SELECT achievements.*, 
               CASE WHEN users_achievements.achievement_id IS NOT NULL THEN 1 ELSE 0 END AS completed 
               FROM achievements 
               LEFT JOIN users_achievements ON achievements.id = users_achievements.achievement_id 
               AND users_achievements.user_id = '${user.id}'`;

    try {
      const results = await watermelonDatabase
        .get('achievements')
        .query(Q.unsafeSqlQuery(query))
        .unsafeFetchRaw();
      if (results.length > 0) {
        setAchievementsWithCompletion(results);
      }
    } catch (err) {
      console.error('Error in getAchievementsWithCompletion', err);
    }
  }

  useEffect(() => {
    getAchievementsWithCompletion().catch(e => console.error(e));
  }, []);

  if (achievementsWithCompletion) {
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

const enhance = withObservables(['user'], ({user}) => ({user}));
const EnhancedAchievementsScreen = enhance(AchievementsScreen);
export default EnhancedAchievementsScreen;

const styles = StyleSheet.create({});
