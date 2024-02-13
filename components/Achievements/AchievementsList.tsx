import { StyleSheet, Text, View, FlatList, Pressable } from 'react-native';
import * as React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import withObservables from '@nozbe/with-observables';
import { Achievement, User, User_Achievement } from '../../watermelon/models';

interface Props
{
	user: User
	achievements: Achievement[]
	userAchievements: User_Achievement[]
}

const AchievementsList = ({user, achievements, userAchievements}: Props) => {
	
	const [selectedUserAchievement, setSelectedUserAchievement] =
		React.useState<number | null>(null);
	const completedAchievementIds:any = {}
	for (let achievement of userAchievements)
	{
		completedAchievementIds[achievement.id] = achievement.completedAt
	}
	const handleAchievementClick = (id: number) => {
		if (id === selectedUserAchievement) {
			setSelectedUserAchievement(null);
		} else {
			setSelectedUserAchievement(id);
		}
	};
console.log(achievements)
// 	React.useEffect(() => {
// 		if (!userAchievements) {
// 			db.transaction(
// 				(tx: SQLite.SQLTransaction) => {
// 					tx.executeSql(
// 						`SELECT a.*, ua.*,
//        CASE WHEN ua.user_id IS NOT NULL THEN 1 ELSE 0 END AS completed
// FROM achievements a
// LEFT JOIN user_achievements ua ON a.achievement_id = ua.achievement_id AND ua.user_id = ?

//           `,
// 						[user.user_id],
// 						(_tx, resultSet) => {
// 							console.log(
// 								'Successfully got userAchievements from SQLite'
// 							);
// 							console.log(resultSet.rows._array);
// 							setUserAchievements(resultSet.rows._array);
// 						},
// 						(_tx, error: SQLite.SQLError) => {
// 							console.error(
// 								'Error: unable to get userAchievements in useEffect executeSQL',
// 								error
// 							);
// 							return false;
// 						}
// 					);
// 				},
// 				(error) =>
// 					console.error(
// 						'Error: unable to get userAchievements in useEffect executeSQL',
// 						error
// 					),
// 				() => console.log('Successfully connected to db.transaction')
// 			);
// 		}
// 	});
	if (achievements)
	{
		return (
      <View style={{ justifyContent: 'space-evenly', paddingTop: 22}}>
        <FlatList
          data={achievements}
          renderItem={({item}) => (
            <Pressable
              style={{
                backgroundColor: completedAchievementIds[item.id]
                  ? 'rgba(210,180,140, 1)'
                  : 'black',
              }}
              id={item.id}
              onPress={() => handleAchievementClick(parseInt(item.id))}>
              <View
                style={{
                  padding: 10,
                  height: 60,
                  borderBottomWidth: 1,
                  borderColor: completedAchievementIds[item.id]
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
                      completedAchievementIds[item.id]
                        ? 'rgba(150,0,0,1)'
                        : completedAchievementIds[item.id]
                        ? 'white'
                        : 'rgba(255, 255, 255, 0.1)',
                    fontWeight: 'bold',
                    fontSize: 26,
                  }}>
                  {completedAchievementIds[item.id]
                    ? item.achievementName
                    : 'Locked'}
                </Text>
                <Ionicons
                  color={
                    selectedUserAchievement == parseInt(item.id) &&
                    completedAchievementIds[item.id]
                      ? 'rgba(150,0,0,1)'
                      : 'white'
                  }
                  size={20}
                  name={
                    !completedAchievementIds[item.id]
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
                    completedAchievementIds[item.id]
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
                  {item.achievementDescription}
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
                      completedAchievementIds[item.id]
                        ? 'flex'
                        : 'none',
                    backgroundColor: 'rgba(210,180,140, .2)',
                  }}>
                  Completed: {completedAchievementIds[item.id]}
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
      <Text style={{color: 'white'}}>'hello'</Text>
    </View>
  );
};



const enhance = withObservables(['user', 'achievements', 'userAchievements'], ({user, achievements}) => ({
	user,
		//achievements,
		userAchievements: user.usersAchievements.observe()
}))

const EnhancedAchievementsList = enhance(AchievementsList)
export default EnhancedAchievementsList;
const styles = StyleSheet.create({});