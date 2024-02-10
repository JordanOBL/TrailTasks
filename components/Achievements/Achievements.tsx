import { StyleSheet, Text, View, FlatList, Pressable } from 'react-native';
import * as React from 'react';

import Ionicons from 'react-native-vector-icons/Ionicons';

const AchievementsList = () => {
	const [userAchievements, setUserAchievements] = React.useState<any>(null);
	const [selectedUserAchievement, setSelectedUserAchievement] =
		React.useState<number | null>(null);
	//const { user } = React.useContext(MyContext);

	const handleAchievementClick = (id: number) => {
		if (id === selectedUserAchievement) {
			setSelectedUserAchievement(null);
		} else {
			setSelectedUserAchievement(id);
		}
	};

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
// 								'Succsessfully got userAchievments from SQLite'
// 							);
// 							console.log(resultSet.rows._array);
// 							setUserAchievements(resultSet.rows._array);
// 						},
// 						(_tx, error: SQLite.SQLError) => {
// 							console.error(
// 								'Error: unable to get userAchievments in useEffect executeSQL',
// 								error
// 							);
// 							return false;
// 						}
// 					);
// 				},
// 				(error) =>
// 					console.error(
// 						'Error: unable to get userAchievments in useEffect executeSQL',
// 						error
// 					),
// 				() => console.log('Succsessfully connected to db.transaction')
// 			);
// 		}
// 	});

	return (
		<View
			style={{ justifyContent: 'space-evenly', flex: 1, paddingTop: 22 }}>
			<FlatList
				data={userAchievements}
				renderItem={({ item }) => (
					<Pressable
						style={{
							backgroundColor: item.completed
								? 'rgba(210,180,140, 1)'
								: 'black',
						}}
						id={item.achievement_id}
						onPress={() =>
							handleAchievementClick(item.achievement_id)
						}>
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
										selectedUserAchievement ===
											item.achievement_id &&
										item.completed
											? 'rgba(150,0,0,1)'
											: item.completed
											? 'white'
											: 'rgba(255, 255, 255, 0.1)',
									fontWeight: 'bold',
									fontSize: 26,
								}}>
								{item.completed
									? item.achievement_name
									: 'Locked'}
							</Text>
							<Ionicons
								color={
									selectedUserAchievement ==
										item.achievement_id && item.completed
										? 'rgba(150,0,0,1)'
										: 'white'
								}
								size={20}
								name={
									!item.completed
										? 'lock-closed-outline'
										: selectedUserAchievement ===
										  item.achievement_id
										? 'caret-down-outline'
										: 'caret-forward-outline'
								}></Ionicons>
						</View>
						<View
							style={{
								display:
									selectedUserAchievement ==
										item.achievement_id && item.completed
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
										selectedUserAchievement ==
											item.achievement_id &&
										item.completed
											? 'flex'
											: 'none',
									backgroundColor: 'rgba(210,180,140, .2)',
								}}>
								Completed: {item.date_completed}
							</Text>
						</View>
					</Pressable>
				)}
			/>
		</View>
	);
};

export default AchievementsList;

const styles = StyleSheet.create({});