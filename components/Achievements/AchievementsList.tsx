import * as React from 'react';

import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import { User, User_Achievement } from '../../watermelon/models';

import {AchievementsWithCompletion} from '../../types/achievements';
import Ionicons from 'react-native-vector-icons/Ionicons';
import withObservables from '@nozbe/with-observables';

interface Props {
  user: User;
  achievementsWithCompletion: AchievementsWithCompletion[];
  userAchievements: User_Achievement[];
}

const AchievementsList: React.FC<Props> = ({
  user,
  achievementsWithCompletion,
}) => {
  const [selectedUserAchievement, setSelectedUserAchievement] = React.useState<
    string | null
  >(null);

  const handleAchievementClick = (id: string) => {
    setSelectedUserAchievement(selectedUserAchievement === id ? null : id);
  };

  if (achievementsWithCompletion) {
    return (
      <View style={styles.container}>
        <FlatList
          data={achievementsWithCompletion}
          renderItem={({item}) => (
            <Pressable
              style={[
                styles.achievementContainer,
                {
                  backgroundColor: item.completed
                    ? 'rgb(7, 254, 213)'
                    : 'black',
                },
              ]}
              key={item.id}
              id={item.id}
              onPress={() =>
              {
                if(item.completed) handleAchievementClick(item.id)
              }}>
              <View style={styles.achievementContent}>
                <Text
                  style={[
                    styles.achievementText,
                    {
                      color: item.completed
                        ? 'black'
                        : 'rgba(255, 255, 255, 0.8)',
                    },
                  ]}>
                  {item.achievement_name}
                </Text>
                <Ionicons
                  color={item.completed ? 'black' : 'white'}
                  size={12}
                  name={
                    selectedUserAchievement === item.id
                      ? 'caret-down-outline'
                      : 'caret-forward-outline'
                  }
                />
              </View>
              {selectedUserAchievement === item.id && item.completed && (
                <View style={styles.achievementDescription}>
                  <Text style={styles.descriptionText}>
                    {item.achievement_description}
                  </Text>
                </View>
              )}
            </Pressable>
          )}
        />
      </View>
    );
  }
  return (
    <View>
      <Text style={styles.loadingText}>Loading</Text>
    </View>
  );
};

const enhance = withObservables(['user', 'userAchievements'], ({user}) => ({
  user,
  userAchievements: user.usersAchievements.observe(),
}));

const EnhancedAchievementsList = enhance(AchievementsList);
export default EnhancedAchievementsList;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-evenly',
    paddingTop: 22,
  },
  achievementContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  achievementText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  achievementDescription: {
    backgroundColor: 'rgba(210,180,140, .2)',
    padding: 10,
  },
  descriptionText: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
  },
  completedText: {
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    color: '#960000',
  },
  loadingText: {
    color: 'white',
  },
});
