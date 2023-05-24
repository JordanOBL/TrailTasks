import { StyleSheet, Text, View, SafeAreaView, FlatList, Pressable } from 'react-native';
import React from 'react';


interface Props {
	milesLeaderboard: any[];
	user: any;
}

const Leaderboard = ({ milesLeaderboard, user }: Props) =>
{
	// const { results, error } = useElectricQuery(
	// 	`SELECT users_miles.*, users.username
	// 	FROM users_miles
	// 	LEFT JOIN users ON users_miles.user_id = users.user_id;`,
	// 	[]
	// );

	// const db = useElectric() as ElectrifiedDatabase;
	//  const addItem = () => {
	// 		db.transaction((tx) => {
	// 			tx.executeSql(
	// 				'INSERT INTO users_miles VALUES("5A094D75-C85B-46CA-9362-635EF97DD122", "56B432DD-ADEA-40CA-832F-7A53D61EB2B5", 50.4)',
	// 				[]
	// 			);
	// 		});
	// 	};

	//   if (error) {
	// 		return (
	// 			<View>
	// 				<Text style={{color: 'white'}}>Error: {`${error}`}</Text>
	// 			</View>
	// 		);
	// 	}

	// 	if (results === undefined) {
	// 		return null;
	// 	}

	
	return (
    <SafeAreaView
      style={{
        backgroundColor: 'black',
        width: '100%',
      }}>
      {user ? (
        <>
          <View>
            <Text>Leaderboards</Text>
          </View>
          <FlatList
            data={milesLeaderboard}
            renderItem={({item, index}) => (
              <SafeAreaView
                style={{
                  backgroundColor: 'black',
                  flexDirection: 'row',
                  width: '100%',
                  marginVertical: 2,
                }}>
                <View
                  style={{
                    borderColor:
                      item.user_id === user.id
                        ? 'rgb(41,184,169)'
                        : 'white',
                    borderWidth: 2,
                    padding: 5,
                    width: '20%',
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{
                      color:
                        item.user_id === user.id
                          ? 'rgb(41,184,169)'
                          : 'white',
                      fontWeight: 'bold',
                      fontSize: 18,
                      textAlign: 'center',
                      padding: 5,
                    }}>
                    {index + 1}
                  </Text>
                </View>
                <View
                  style={{
                    borderColor:
                      item.user_id === user.id
                        ? 'rgb(41,184,169)'
                        : 'white',
                    borderWidth: 2,
                    width: '50%',
                    padding: 5,
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{
                      color:
                        item.user_id == user.id
                          ? 'rgb(41,184,169)'
                          : 'white',
                      fontWeight: 'bold',
                      fontSize: 18,
                      textAlign: 'center',
                    }}>
                    {item.username}
                  </Text>
                </View>
                <View
                  style={{
                    borderColor:
                      item.user_id === user.id
                        ? 'rgb(41,184,169)'
                        : 'white',
                    borderWidth: 2,
                    width: '30%',
                    padding: 5,
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{
                      color:
                        item.user_id === user.id
                          ? 'rgb(41,184,169)'
                          : 'white',
                      fontWeight: 'bold',
                      fontSize: 22,
                      textAlign: 'center',
                    }}>
                    {item.total_miles} mi.
                  </Text>
                </View>
              </SafeAreaView>
            )}
          />
        </>
      ) : (
        <Text> Connect to Internet</Text>
      )}
    </SafeAreaView>
  );
};


export default Leaderboard;

const styles = StyleSheet.create({});
