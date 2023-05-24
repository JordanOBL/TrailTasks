import { StyleSheet, Text, View, SafeAreaView, FlatList, Pressable } from 'react-native';
import React from 'react';
import UserRow from './userRow';


interface Props {
	milesLeaderboard: any[];
	user: any;
}

const Leaderboard = ({ milesLeaderboard, user }: Props) =>
{
	
	return (
    <SafeAreaView
      style={{
        backgroundColor: 'black',
        width: '100%',
      }}>
      {user ? (
        <>
          <View>
            <Text
              style={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: 16,
                marginBottom: 10,
              }}>
              Your Rank:{' '}
            </Text>
            {milesLeaderboard.map(
              (item, index) =>
                user.id === item.user_id && (
                  <UserRow
                    key={item.user_id}
                    item={item}
                    index={index}
                    user={user}
                  />
                )
            )}
          </View>
          <Text
            style={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: 16,
              marginVertical: 10,
            }}>
            All Users:{' '}
          </Text>
          <FlatList
            data={milesLeaderboard}
            renderItem={({item, index}) => (
              <UserRow
                key={item.user_id}
                item={item}
                index={index}
                user={user}
              />
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
