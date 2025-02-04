import React, {useState, useEffect, useCallback} from 'react';
import { View, StyleSheet, FlatList, Text} from 'react-native';
import { useDatabase, withObservables } from '@nozbe/watermelondb/react';
import EnhancedParkPassCard from '../components/ParkPass/ParkPassCard';
import {Q} from '@nozbe/watermelondb';


// @ts-ignore
const ParkPassScreen = ({ user, completedTrails, userParks}) => {
   const [combinedData, setCombinedData] = useState<ParkPassCard[]>([]);
    const watermelonDatabase = useDatabase();

    async function redeemParkPass(parkId: string){
        try{
            console.debug("Redeeming...");
            await user.redeemParkPass(parkId)
            console.log("redeem complete")
        } catch(err){
            console.log(err)
        }
    }


    const getParksData = useCallback(async () => {
        try {
            const parksData = await watermelonDatabase.get('parks').query().fetch()
          return parksData;

        } catch (error) {
            console.error('Error fetching park pass data:', error);
            return [];
        }
    }, [user, completedTrails]);

    const getTrailsData = useCallback(async () => {
        try{
            const trailsData = await watermelonDatabase.get('trails').query().fetch();
            return trailsData;
        } catch (error) {
            console.error('Error fetching trails data');
            return []
        }
    }, [user, completedTrails]);


    useEffect(() => {
        if(userParks && user) {
            const fetchParkPassData = async () => {
                const parks = await getParksData();
                const trails = await getTrailsData()
                const combinedParkPassData = combineDataForParks(parks, trails, completedTrails)
                setCombinedData(combinedParkPassData);
            };

            fetchParkPassData();
        }
    }, [user, userParks]);

    const combineDataForParks = (parks, trails, usersCompletedTrails) => {
        // Map completed trails for quick lookup
        const completedTrailMap = usersCompletedTrails.reduce((map, completed) => {
            if(completed.completionCount == user.prestigeLevel + 1) {
                map[completed.trailId] = completed;
            }
            return map;
        }, {});

        // Organize trails by park
        const parkTrailMap = trails.reduce((map, trail) => {
            if (!map[trail.parkId]) {
                map[trail.parkId] = [];
            }
            map[trail.parkId].push(trail);
            return map;
        }, {});

        //map user parkpasses for quick lookup
        const usersPassesMap = userParks.reduce((map, park) => {
            map[park.parkId] = park;
            return map;
        },{})


        // Combine data for each park
        return parks.map((park) => {
            const parkTrails = parkTrailMap[park.id] || [];
            const completedTrails = parkTrails.filter((trail) => completedTrailMap[trail.id] );

            return {
                parkId: park.id,
                parkName: park.parkName,
                parkImageUrl: park.imageUrl,
                totalTrails: parkTrails.length,
                completedTrails: completedTrails.length,
                trails: parkTrails, // Include trail details if needed by the child
                pass: usersPassesMap[park.id],
            };
        });
    };


    return (
        <View style={styles.container}>
            <Text style={styles.completedPasses}>{userParks.length} / {combinedData.length}</Text>
            <FlatList
                data={combinedData}
                keyExtractor={(item) => item.parkId}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <EnhancedParkPassCard
                        data={item}
                        //redeemParkPass={redeemParkPass}
                        user={user}
                    />
                )}
            />
        </View>
    );

};

const enhance = withObservables(['user', 'completedTrails'], ({ user }) => ({
    user: user.observe(),
    completedTrails: user.usersCompletedTrails.observe(),
    userParks: user.usersParks,
}));

export default enhance(ParkPassScreen);

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
    completedPasses:{
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: "white",
    },
    listContent: {
        alignItems: 'center', // Centers the grid content
        justifyContent: 'center',
    },

});
