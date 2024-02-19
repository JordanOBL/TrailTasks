import { StyleSheet, Text, View, FlatList, Pressable } from 'react-native';
import * as React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import withObservables from '@nozbe/with-observables';
import { Achievement, User, User_Achievement } from '../../watermelon/models';
import { AchievementsWithCompletion } from '../../types/achievements';


interface Props
{
	user: User
	achievementsWithCompletion: AchievementsWithCompletion[]
	userAchievements: User_Achievement[]
}

const AchievementsList = ({user, achievementsWithCompletion}: Props) => {
	
	const [selectedUserAchievement, setSelectedUserAchievement] =
		React.useState<number | null>(null);


	const handleAchievementClick = (id: number) => {
		if (id === selectedUserAchievement) {
			setSelectedUserAchievement(null);
		} else {
			setSelectedUserAchievement(id);
		}
	};


	if (achievementsWithCompletion)
	{
		return (
      <View style={{justifyContent: 'space-evenly', paddingTop: 22}}>
        <FlatList
          data={achievementsWithCompletion}
          renderItem={({item}) => (
            <Pressable
              style={{
                backgroundColor: item.completed
                  ? 'rgba(210,180,140, 1)'
                  : 'black',
              }}
              key={item.id}
              id={item.id}
              onPress={() => handleAchievementClick(parseInt(item.id))}>
              <View
                style={{
                  padding: 10,
                  height: 60,
                  borderBottomWidth: 1,
                  borderColor: item.completed
                    ? 'rgba(150,0,0,.1)'
                    : 'rgba(255,255,255,.3)',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={{
                    color:
                      selectedUserAchievement == parseInt(item.id) &&
                      item.completed
                        ? 'rgba(150,0,0,1)'
                        : item.completed
                        ? 'white'
                        : 'rgba(255, 255, 255, 0.1)',
                    fontWeight: 'bold',
                    fontSize: 26,
                  }}>
                  {/* {item.completed
                    ? item.achievement_name
                    : 'Locked'} */}
                  {item.achievement_name}
                </Text>
                <Ionicons
                  color={
                    selectedUserAchievement == parseInt(item.id) &&
                    item.completed
                      ? 'rgba(150,0,0,1)'
                      : 'white'
                  }
                  size={20}
                  name={
                    !item.completed
                      ? 'lock-closed-outline'
                      : selectedUserAchievement === parseInt(item.id)
                      ? 'caret-down-outline'
                      : 'caret-forward-outline'
                  }></Ionicons>
              </View>
              <View
                style={{
                  display:
                    selectedUserAchievement == parseInt(item.id) &&
                    item.completed
                      ? 'flex'
                      : 'none',
                  backgroundColor: 'rgba(210,180,140, .2)',
                  padding: 10,
                  height: 40,
                }}>
                <Text
                  style={{
                    color: 'rgba(150,0,0,1)',
                    fontWeight: 'bold',
                    fontSize: 16,
                    textAlign: 'center',
                  }}>
                  {item.achievement_description}
                </Text>
                <Text
                  style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: 10,
                    padding: 10,
                    height: 30,
                    display:
                      selectedUserAchievement == parseInt(item.id) &&
                      item.completed
                        ? 'flex'
                        : 'none',
                    backgroundColor: 'rgba(210,180,140, .2)',
                  }}>
                  Completed: {item.completed}
                </Text>
              </View>
            </Pressable>
          )}
        />
      </View>
    );
	}
	return (
    <View>
      <Text style={{color: 'white'}}>Loading</Text>
    </View>
  );
};



const enhance = withObservables(['user', 'userAchievements'], ({user}) => ({
	user,
		userAchievements: user.usersAchievements.observe()
}))

const EnhancedAchievementsList = enhance(AchievementsList)
export default EnhancedAchievementsList;
const styles = StyleSheet.create({});