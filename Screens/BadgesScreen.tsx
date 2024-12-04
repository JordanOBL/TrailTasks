import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList } from 'react-native';
import { useDatabase, withObservables } from '@nozbe/watermelondb/react';
import ParkBadgeCard from '../components/Badges/ParkBadgeCard';
import {Badge, User_Completed_Trail, Trail, User, User_Badge} from "../watermelon/models";

type Park_Id_Map = {
    trails: string[] | []
    completed: number
    userBadge: User_Badge | null | undefined
}

// @ts-ignore
const BadgesScreen = ({ user, completedTrails, userBadges}) => {
    const database = useDatabase();
    const [badges, setBadges] = useState<number[]>([]);
    const [trails, setTrails] = useState<number[]>([]);


    useEffect(() => {
        const fetchBadges = async () => {
            const fetchedBadges = await database.get('badges').query().fetch();
            setBadges(fetchedBadges);
        };

        const fetchTrails = async () => {
            const fetchedTrails = await database.get('trails').query().fetch();
            setTrails(fetchedTrails);
        };

        fetchBadges();
        fetchTrails();


    }, []);

    useEffect(()=>{
        console.log(userBadges)
    }, [userBadges])

    const Park_Trail_Badge_Map = new Map<string,Park_Id_Map>();
    const ParkTrailId_Map = new Map<string,string>();
    const userBadgeMap = new Map<string, User_Badge>();


    userBadges.forEach((badge: User_Badge) => {
        userBadgeMap.set(badge.badgeId, badge);
    });

//add park ids and badges to park_trail_badge_map
    badges.forEach(badge => {
        if(badge.parkId) {
            Park_Trail_Badge_Map.set(badge.parkId, {trails: [], completed: 0, userBadge: userBadgeMap.get(badge.id)});
        }
    });

//map all trails to their parks in park_trail_badge_map
    trails.forEach(trail => {
        Park_Trail_Badge_Map.get(trail.parkId)!.trails.push(trail.id);
        ParkTrailId_Map.set(trail.id, trail.parkId);
    });

    //count all completed trails for each park
    completedTrails.forEach((completedTrail: User_Completed_Trail) => {
        const parkId = ParkTrailId_Map.get(completedTrail.trailId);
        if (parkId) {
            const currentParkDetails = Park_Trail_Badge_Map.get(parkId);
            if (currentParkDetails) {
                Park_Trail_Badge_Map.set(parkId, {
                    ...currentParkDetails,
                    completed: currentParkDetails.completed + 1,
                });
            }
        }
    });


    return (
        <View style={styles.container}>
            <FlatList
                data={badges}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                    if (item.badgeType === 'park') {
                        return (
                            <ParkBadgeCard
                                data={Park_Trail_Badge_Map.get(item.parkId)}
                                badge={item}
                            />
                        );
                    }
                    return null; // Return null for non-park type badges
                }}
            />
        </View>
    );

};

const enhance = withObservables(['user', 'completedTrails', 'userBadges'], ({ user }) => ({
    user: user.observe(),
    completedTrails: user.usersCompletedTrails.observe(),
    userBadges: user.usersBadges,
}));

export default enhance(BadgesScreen);

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgb(18, 19, 21)',
        padding: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    listContent: {
        alignItems: 'center', // Centers the grid content
        justifyContent: 'center',
    },

});
