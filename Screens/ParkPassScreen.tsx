import React, {useState, useEffect, useCallback} from 'react';
import {Park, Trail, User_Completed_Trail, User, User_Park} from '../watermelon/models';
import { View, StyleSheet, FlatList, Text} from 'react-native';
import { useDatabase, withObservables } from '@nozbe/watermelondb/react';
import EnhancedParkPassCard from '../components/ParkPass/ParkPassCard';
import {Q} from '@nozbe/watermelondb';
import {CombinedData} from '../types/parkPasses';


const ParkPassScreen = ({ user, completedTrails, userParks}) => {
   const [combinedData, setCombinedData] = useState<ParkPassCard[]>([]);
    const watermelonDatabase = useDatabase();



//    const getParksData = useCallback(async () => {
//        try {
//            const parksData: Park[] = await watermelonDatabase.get('parks').query().fetch()
//          return parksData;
//
//        } catch (error) {
//            console.error('Error fetching park pass data:', error);
//            return [];
//        }
//    }, [user, completedTrails]);
//
//    const getTrailsData = useCallback(async () => {
//        try{
//            const trailsData : Trail[] = await watermelonDatabase.get('trails').query().fetch();
//            return trailsData;
//        } catch (error) {
//            console.error('Error fetching trails data');
//            return []
//        }
//    }, [user, completedTrails]);
//
    //{
       // parkId: '24',
        //parkName: 'Grand Canyon',
        //parkImageUrl: undefined,
        //totalTrails: 3,
        //completedTrails: 0,
        //trails: [ [Trail], [Trail], [Trail] ],
        //pass: undefined
      //},
   useEffect(() => {
       if(userParks && user) {
            const fetchParkPassData = async () => {
                const parks: Park[] = await watermelonDatabase.get('parks').query().fetch()
                const trails : Trail[] = await watermelonDatabase.get('trails').query().fetch();
                const combinedParkPassData = combineDataForParks(parks, trails, completedTrails)
            console.log(combinedParkPassData)
                setCombinedData(combinedParkPassData);
            };

             fetchParkPassData();
        }

   },[]) 
        
    const combineDataForParks: CombinedData[] = (parks: Park[], trails: Trail[], usersCompletedTrails: User_Completed_Trail[]) => {
        // Map completed trails for quick lookup
        // Trails only marked as completed if completeion count is greater than users current prestige level
        const completedTrailMap:Record<string, boolean> = usersCompletedTrails.reduce((map, completed) => {
            if(completed.completionCount == user.prestigeLevel + 1) {
                map[completed.trailId] = completed;
            }
            return map;
        }, {});

        // Organize trails by park
        // (i.e Park_id: [trail1, trail2, trail3])
        const parkTrailMap: Record<string, Trail[]> = trails.reduce((map, trail) => {
            if (!map[trail.parkId]) {
                map[trail.parkId] = [];
            }
            map[trail.parkId].push(trail);
            return map;
        }, {});

        //map user parkpasses for quick lookup
        // (i.e. Park_id: User_Park)
        const usersPassesMap: Record<string, User_Park> = userParks.reduce((map, park) => {
            map[park.parkId] = park;
            return map;
        },{})


        // Combine data for each park
        return parks.map((park) => {
            // Get trails for the current park
            const parkTrails = parkTrailMap[park.id] || [];
            // Filter out trails that have been completed
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

    if(!user || !userParks || !combinedData) {
        return <Text style={{color: 'white', textAlign: 'center'}}>Loading Park Passes...</Text>
        
    }


    return (
        <View testID="park-pass-screen" style={styles.container}>
            <Text testID='park-pass-count' style={styles.completedPasses}>{userParks.length} / {combinedData.length}</Text>
            <FlatList
                data={combinedData}
                keyExtractor={(item) => item.parkId}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <EnhancedParkPassCard
                        data={item}
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

const EnhancedParkPassScreen = enhance(ParkPassScreen);

export default EnhancedParkPassScreen;

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgb(18, 19, 21)',
        paddingBottom: 80,
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
