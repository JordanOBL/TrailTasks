import {ScrollView, StyleSheet, Text, SafeAreaView} from 'react-native';
import NearbyTrails from '../components/NearbyTrails';
import React from 'react';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import getTrails from '../helpers/Trails/getTrails';

const ExploreScreen = () => {
  const watermelonDatabase = useDatabase();
  const {trails, setTrails} = getTrails(watermelonDatabase);

  const filterTrails = (title: string, trailsArr: any): any => {
    if (title === 'Short Trails') {
      return trailsArr.filter(
        (trail: any) => trail.trail_difficulty === 'short'
      );
    } else if (title === 'Moderate Trails') {
      return trailsArr.filter(
        (trail: any) => trail.trail_difficulty === 'moderate'
      );
    } else if (title === 'Long Trails') {
      return trailsArr.filter((trail: any) => trail.trail_difficulty === 'long');
    } else return trails;
  };

  return (
    <SafeAreaView>
      {/* <Text style={{color: 'white', padding: 10, fontSize: 18, fontWeight: 'bold'}}>FIND / ADD NEW TRAILS</Text> */}
      {trails ? (
        <ScrollView>
          <NearbyTrails
            trails={filterTrails('all trails', [...trails])}
            sectionTitle={'Latest Trails'}
          />
          <NearbyTrails
            trails={filterTrails('Short Trails', [...trails])}
            sectionTitle={'Short Trails'}
          />
          <NearbyTrails
            trails={filterTrails('Moderate Trails', [...trails])}
            sectionTitle={'Moderate Trails'}
          />
          <NearbyTrails
            trails={filterTrails('Long Trails', [...trails])}
            sectionTitle={'Long Trails'}
          />
        </ScrollView>
      ) : (
        <Text>Loading...</Text>
      )}
    </SafeAreaView>
  );
};

export default ExploreScreen;

const styles = StyleSheet.create({});
