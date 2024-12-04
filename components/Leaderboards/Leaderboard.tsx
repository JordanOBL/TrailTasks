import {FlatList, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import EnhancedUserMile from './UserMile';
import React from 'react';
import {User} from '../../watermelon/models';
import {withObservables} from '@nozbe/watermelondb/react';

interface Props {
    leaderboard: any
    user: User;
}

const Leaderboard = ({leaderboard, user}: Props) => {
    // Check if the user is in the top 100 list
    const isUserInTop100 = leaderboard?.top100Rankings?.some((hiker: any) => hiker?.username === user?.username) || [];

    // If the user is not in the top 100, add them to the list separately
    const topUsers = isUserInTop100 ? leaderboard.top100Rankings : [{...user, rank: leaderboard.userRank?.rank || 101}, ...leaderboard.top100Rankings];

    return (
        <SafeAreaView style={styles.container}>

            <Text style={styles.sectionTitle}> Top Users: </Text>

            <FlatList
                data={topUsers}
                renderItem={({item, index}) => (
                    <EnhancedUserMile
                        key={item.id}
                        index={index}
                        hiker={item}
                        user={user}
                    />
                )}
                keyExtractor={(item, idx) => item.username + idx}
                contentContainerStyle={styles.listContainer}
            />
        </SafeAreaView>
    );
};

const enhance = withObservables(['user'], ({ user}) => ({
    user,
}));

const EnhancedLeaderboard = enhance(Leaderboard);
export default EnhancedLeaderboard;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        paddingHorizontal: 16,
    },
    sectionTitle: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginVertical: 10,
    },
    listContainer: {
        paddingBottom: 400, // Adjust this value as needed
    },
});
