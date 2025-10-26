import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import {Park, Park_Wild, Trail, User, User_Completed_Trail, User_Park, User_Wild} from '../watermelon/models';
import React, {useCallback, useEffect, useState} from 'react';
import { useDatabase, withObservables } from '@nozbe/watermelondb/react';

import {CombinedData} from '../types/parkPasses';
import ParkCard from '../components/Parks/ParkCard';
import {Q} from '@nozbe/watermelondb';
import { useAuthContext } from '../services/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeProvider';

interface Props {
  navigation: any;
}
interface ParkCardData{
    parkName: string;
    parkId: string;
    isParkPassCompleted: boolean;
    isWildUnlocked: boolean;
    wildId: string;
  }

const ParksScreen = ({navigation}: Props) => {
  const {user} = useAuthContext();
  const db = useDatabase(); 
  const [parksWilds, setParksWilds] = useState<Park_Wild[]>([]);
  const [parks, setParks] = useState<Park[]>([]);
  const [userParks, setUserParks] = useState<User_Park[] | null>(null);
  const [userWilds, setUserWilds] = useState<User_Wild[] | null>(null);


const load = useCallback(async () => {
    console.log('Fetching park pass data');
    const [parksWilds, parks, userParks, userWilds] = await Promise.all([
      db.get<Park_Wild>('parks_wilds').query().fetch(),
      db.get<Park>('parks').query().fetch(),
      db.get<User_Park>('users_parks').query(
        Q.where('user_id', user!.id),
      ).fetch(),
      db.get<User_Wild>('users_wilds').query(
        Q.where('user_id', user!.id),
      ).fetch(),
    ]);

    setParksWilds(parksWilds);
    setParks(parks);
    setUserParks(userParks);
    setUserWilds(userWilds);
},[db, user])

useFocusEffect(useCallback(() => {
  load();
}, [load]))

  const {theme} = useTheme();

  const parkCardData: ParkCardData[] = React.useMemo(() => {
    return parksWilds.map(pw => {
      return {
        parkId: pw.parkId,
        parkName: parks.find(p => p.id === pw.parkId)?.parkName || "",
        isParkPassCompleted: userParks?.some(up => up.parkId === pw.parkId) || false,
        isWildUnlocked: userWilds?.some(uw => uw.wildId === pw.wildId) || false,
        wildId: pw.wildId,
      };
    });
  }
  , [parksWilds, parks, userParks, userWilds]);

  // const combineDataForParks = (
  //   parks: Park[],
  //   trails: Trail[],
  //   usersCompletedTrails: User_Completed_Trail[],
  // ): CombinedData[] => {

  //   console.log('Trails:', trails);
  //   // Map completed trails for quick lookup
  //   // Trails only marked as completed if completeion count is greater than users current prestige level allowing park completion progress to be reset upon prestige
  //   const completedTrailMap: Record<string, User_Completed_Trail> =
  //     usersCompletedTrails.reduce((map:Record<string, User_Completed_Trail>, completed) => {
  //       if (completed.completionCount >= user.prestigeLevel + 1) {
  //         map[completed.trailId] = completed;
  //       }
  //       return map;
  //     }, {});

  //   // Organize trails by park
  //   // (i.e Park_id: [trail1, trail2, trail3])
  //   const parkTrailMap: Record<string, Trail[]> = trails.reduce(
  //     (map:Record<string, Trail[]>, trail) => {
  //       if (!map[trail.parkId]) {
  //         map[trail.parkId] = [];
  //       }
  //       map[trail.parkId].push(trail);
  //       return map;
  //     },
  //     {},
  //   );

  //   console.log(parkTrailMap);

  //   //map user parkpasses for quick lookup
  //   // (i.e. Park_id: User_Park)
    // const usersPassesMap: Record<string, User_Park> = userParks.reduce(
    //   (map: Record<string, User_Park>, park) => {
    //     map[park.parkId] = park;
    //     return map;
    //   },
    //   {},
    // );

  //   // Combine data for each park
  //   return parks.map(park => {
  //     // Get trails for the current park
  //     const parkTrails = parkTrailMap[park.id] || [];
  //     // Filter out trails that have been completed
  //     const completedTrails = parkTrails.filter(
  //       trail => completedTrailMap[trail.id],
  //     );

  //     return {
  //       parkId: park.id,
  //       parkName: park.parkName,
  //       parkImageUrl: park.parkImageUrl,
  //       totalTrails: parkTrails.length,
  //       completedTrails: completedTrails.length,
  //       trails: parkTrails, // Include trail details if needed by the child
  //       pass: usersPassesMap[park.id],
  //     };
  //   });
  // };




  const renderParkCard = useCallback(
    ({item}: {item: ParkCardData}) => (
      <ParkCard
        key={item.parkId}
        test-id={`park-pass-${item.parkId}`}
        parkId = {item.parkId}
        parkName = {item.parkName}
        isParkPassCompleted={item.isParkPassCompleted}
        isWildUnlocked={item.isWildUnlocked}
        wildId={item.wildId}
        user={user}
        navigation={navigation}
      />
    ),
    [user, navigation],
  );

  if (!user || userParks === null || parks === null || !parksWilds) {
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
          Loading Your Data...
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
        {userParks.length} / {parks.length}
      </Text>

      <FlatList
        data={parkCardData}
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

// const enhance = withObservables(['user'], ({ user}) => ({
//     user: user.observe(),
//     completedTrails: user.usersCompletedTrails.observe(),
//     userParks: user.usersParks,
    
// }));

// const EnhancedParksScreen = enhance(ParksScreen);

export default ParksScreen;

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
