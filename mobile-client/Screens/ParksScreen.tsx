import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import {Park, Park_Wild, Trail, User, User_Completed_Trail, User_Park} from '../watermelon/models';
import React, {useCallback, useEffect, useState} from 'react';
import { useDatabase, withObservables } from '@nozbe/watermelondb/react';

import {Button} from 'react-native-paper';
import {CombinedData} from '../types/parkPasses';
import EnhancedParkCard from '../components/Parks/ParkCard';
import {Q} from '@nozbe/watermelondb';
import { useTheme } from '../contexts/ThemeProvider';

const ParksScreen = ({user, completedTrails, userParks}) => {
  const [combinedData, setCombinedData] = useState<ParkPassCard[]>([]);
  const watermelonDatabase = useDatabase();
  const [parksWildsData, setParksWildsData] = useState<Park_Wild[]>([]);


  const {theme} = useTheme();


  useEffect(() => {
    if (userParks && user) {
      const fetchParkPassData = async () => {
        const parks: Park[] = await watermelonDatabase
          .get('parks')
          .query()
          .fetch();
        const trails: Trail[] = await watermelonDatabase
          .get('trails')
          .query()
          .fetch();
        const parksWilds: Park_Wild[] = await watermelonDatabase
          .get('parks_wilds')
          .query()
          .fetch();
        console.log(
          'Fetched Parks and Trails',
          parks.length,
          trails.length,
          parksWilds.length,
        );
        const combinedParkPassData = combineDataForParks(
          parks,
          trails,
          completedTrails,
        );
        setCombinedData(combinedParkPassData);
        setParksWildsData(parksWilds);
      };

      fetchParkPassData();
    }
  }, [user, userParks, completedTrails]);

  const combineDataForParks = (
    parks: Park[],
    trails: Trail[],
    usersCompletedTrails: User_Completed_Trail[],
  ): CombinedData[] => {
    // Map completed trails for quick lookup
    // Trails only marked as completed if completeion count is greater than users current prestige level allowing park completion progress to be reset upon prestige
    const completedTrailMap: Record<string, boolean> =
      usersCompletedTrails.reduce((map, completed) => {
        if (completed.completionCount >= user.prestigeLevel + 1) {
          map[completed.trailId] = completed;
        }
        return map;
      }, {});

    // Organize trails by park
    // (i.e Park_id: [trail1, trail2, trail3])
    const parkTrailMap: Record<string, Trail[]> = trails.reduce(
      (map, trail) => {
        if (!map[trail.parkId]) {
          map[trail.parkId] = [];
        }
        map[trail.parkId].push(trail);
        return map;
      },
      {},
    );

    //map user parkpasses for quick lookup
    // (i.e. Park_id: User_Park)
    const usersPassesMap: Record<string, User_Park> = userParks.reduce(
      (map, park) => {
        map[park.parkId] = park;
        return map;
      },
      {},
    );

    // Combine data for each park
    return parks.map(park => {
      // Get trails for the current park
      const parkTrails = parkTrailMap[park.id] || [];
      // Filter out trails that have been completed
      const completedTrails = parkTrails.filter(
        trail => completedTrailMap[trail.id],
      );

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

  const renderParkCard = useCallback(
    ({item}) => (
      <EnhancedParkCard
        key={item.parkId}
        testID={`park-pass-${item.parkId}`}
        parkWild={item}
        user={user}
        park={item.park}
        wild={item.wild}
      />
    ),
    [user],
  );

  if (!user || !userParks || !combinedData?.length) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text
          style={{
            color: 'white',
            textAlign: 'center',
            marginBottom: 16,
            fontWeight: '600',
            fontSize: 16,
          }}>
          Loading Parks Data...
        </Text>
        <ActivityIndicator size="large" color={theme.button} />
      </View>
    );
  }



  return (
    <View
      testID="park-pass-screen"
      style={[styles.container, {backgroundColor: theme.background}]}>
      <Text
        testID="park-pass-count"
        style={[styles.completedPasses, {color: theme.text}]}>
        {userParks.length} / {combinedData.length}
      </Text>

      <FlatList
        data={parksWildsData}
        keyExtractor={item => item.parkId}
        numColumns={2}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        renderItem={renderParkCard}
      />
    </View>
  );
};

const enhance = withObservables(['user'], ({ user }) => ({
    user: user.observe(),
    completedTrails: user.usersCompletedTrails.observe(),
    userParks: user.usersParks,
}));

const EnhancedParksScreen = enhance(ParksScreen);

export default EnhancedParksScreen;

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgb(18, 19, 21)',
        paddingBottom: 80,
        paddingHorizontal: 16,
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
