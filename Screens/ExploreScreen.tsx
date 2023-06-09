import {ScrollView, StyleSheet, Text, SafeAreaView} from 'react-native';
import EnhancedNearbyTrails from '../components/NearbyTrails';
import React, {useContext, useState} from 'react';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import searchFilterFunction from '../helpers/searchFilter';
import SearchBar from '../components/searchBar';
import withObservables from '@nozbe/with-observables';
import {Completed_Hike, Queued_Trail, Trail, User} from '../watermelon/models';

interface Props {
  user: User;
  completedHikes: Completed_Hike[];
  queuedTrails: Queued_Trail[];
}

const ExploreScreen = ({user, completedHikes, queuedTrails}: Props) => {
  const watermelonDatabase = useDatabase();
  const [trailsCollection, setTrailsCollection] = React.useState<any>();

  const getTrailsCollection = async () => {
    const trailsCollection = await watermelonDatabase.collections
      .get('trails')
      .query()
      .fetch();
    setTrailsCollection(trailsCollection);
  };

  React.useEffect(() => {
    getTrailsCollection();
  }, [queuedTrails, completedHikes]);

  return (
    <SafeAreaView>
      <ScrollView>
        <EnhancedNearbyTrails
          user={user}
          trailsCollection={trailsCollection}
          queuedTrails={queuedTrails}
          completedHikes={completedHikes}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const enhance = withObservables(['user'], ({user}) => ({
  user,
  completedHikes: user.completedHikes.observe(),
  queuedTrails: user.queuedTrails.observe(),

}));

const EnhancedExploreScreen = enhance(ExploreScreen);
export default EnhancedExploreScreen;

const styles = StyleSheet.create({});
