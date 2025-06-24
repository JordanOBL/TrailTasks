import React, {useState, useEffect, useCallback} from 'react';
import {Park, Trail, User_Completed_Trail, User, User_Park} from '../watermelon/models';
import { View, StyleSheet, FlatList, Text, ActivityIndicator} from 'react-native';
import { useDatabase, withObservables } from '@nozbe/watermelondb/react';
import EnhancedParkPassCard from '../components/ParkPass/ParkPassCard';
import {Q} from '@nozbe/watermelondb';
import {CombinedData} from '../types/parkPasses';
import {Button } from 'react-native-paper';
import { useTheme } from '../contexts/ThemeProvider';


const ParkPassScreen = ({ user, completedTrails, userParks}) => {
   const [combinedData, setCombinedData] = useState<ParkPassCard[]>([]);
    const watermelonDatabase = useDatabase();

const { theme } = useTheme();
const canPrestige = userParks.length > 0 && (userParks.length === combinedData.length && userParks.every(pass => pass.parkLevel === user.prestigeLevel + 1 ))

  useEffect(() => {
       if(userParks && user) {
            const fetchParkPassData = async () => {
                const parks: Park[] = await watermelonDatabase.get('parks').query().fetch()
                const trails : Trail[] = await watermelonDatabase.get('trails').query().fetch();
                const combinedParkPassData = combineDataForParks(parks, trails, completedTrails)
                setCombinedData(combinedParkPassData);
            };

             fetchParkPassData();
        }

   },[user, userParks, completedTrails]); 
        
   const combineDataForParks = (
  parks: Park[],
  trails: Trail[],
  usersCompletedTrails: User_Completed_Trail[]
): CombinedData[] => {
        // Map completed trails for quick lookup
        // Trails only marked as completed if completeion count is greater than users current prestige level allowing park completion progress to be reset upon prestige
        const completedTrailMap:Record<string, boolean> = usersCompletedTrails.reduce((map, completed) => {
            if(completed.completionCount >= user.prestigeLevel + 1) {
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

    if(!user || !userParks || !combinedData?.length) {
        return (<View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><Text style={{color: 'white', textAlign: 'center', marginBottom: 16, fontWeight: '600', fontSize: 16}}>Loading Park Passes...</Text>
        <ActivityIndicator size="large" color={theme.button} />
        </View>)
        
    }

    if(canPrestige) {
        return (
             <View style={{padding: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, margin: 16}}>
                    <Text style={{color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 8}}>All Park Passes Completed!</Text>
                    <Text style={{color: 'white', fontSize: 14, marginBottom: 8}}>
                        Prestige to reset and rank up your Park Passes for more rewards. Your completed trails still count toward the next rank!
                    </Text>
                    <Button  testID={"prestige-button"}
                        mode="contained"
                        buttonColor="rgb(7,254,213)"
                        onPress={async () => {
                            await user.prestigeParkPasses();
                        }}
                        style={styles.prestigeButton}
                        dark={false}
                    >Prestige</Button>
                </View>
        )
    }


    return (
        <View testID="park-pass-screen" style={[styles.container, { backgroundColor: theme.background }]}>
            <Text testID='park-pass-count' style={[styles.completedPasses, { color: theme.text }]}>{userParks.length} / {combinedData.length}</Text>
           
            <FlatList
                data={combinedData}
                keyExtractor={(item) => item.parkId}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <EnhancedParkPassCard
                        key={item.parkId}
                        testID={`park-pass-${item.parkId}`}
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
    padding: 16,
        color: "white",
    },
    listContent: {
        alignItems: 'center', // Centers the grid content
        justifyContent: 'center',
    }, 
    prestigeButton: {
        marginTop: 8,
        borderRadius: 20,
    },

});
