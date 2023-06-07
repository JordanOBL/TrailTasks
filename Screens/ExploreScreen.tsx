import {ScrollView, StyleSheet, Text, SafeAreaView} from 'react-native';
import EnhancedNearbyTrails from '../components/NearbyTrails';
import React, {useContext, useState} from 'react';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import searchFilterFunction from '../helpers/searchFilter';
import SearchBar from '../components/searchBar';
import withObservables from '@nozbe/with-observables';
import {Completed_Hike, Hiking_Queue, Trail, User} from '../watermelon/models';

interface Props {
  user: User;
  completedHikes: Completed_Hike[];
  hikingQueue: Hiking_Queue[];
}

const ExploreScreen = ({user, completedHikes, hikingQueue}: Props) => {
  const watermelonDatabase = useDatabase();
  const [trailsCollection, setTrailsCollection] = React.useState<any>();
  const getTrailsCollection = async () => {
    const trailsCollection = await watermelonDatabase.collections
      .get('trails')
      .query()
      .fetch();
    setTrailsCollection(trailsCollection);
  };
  const queuedCache = new Map();
  const completedTrailsCache = new Map();

  React.useEffect(() => {
    getTrailsCollection();
    if (completedHikes && hikingQueue) {
      hikingQueue.forEach((trail) => queuedCache.set(trail.trailId, true));
      completedHikes.forEach((trail) =>
        completedTrailsCache.set(trail.trailId, true)
      );
    }
  }, [hikingQueue, completedHikes]);

  return (
    <SafeAreaView>
      <ScrollView>
        <EnhancedNearbyTrails
          user={user}
          trailsCollection={trailsCollection}
          queuedCache={queuedCache}
          completedTrailsCache={completedTrailsCache}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const enhance = withObservables(['user', 'completedTrails'], ({user}) => ({
  user,
  completedHikes: user.completedHikes.observe(),
  hikingQueue: user.hikingQueue,

  // Shortcut syntax for `post.comments.observe()`
}));

const EnhancedExploreScreen = enhance(ExploreScreen);
export default EnhancedExploreScreen;

const styles = StyleSheet.create({});
