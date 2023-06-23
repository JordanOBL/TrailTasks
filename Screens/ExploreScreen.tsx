import {ScrollView, StyleSheet, Text, SafeAreaView} from 'react-native';
import EnhancedNearbyTrails from '../components/NearbyTrails';
import React, {useContext, useState} from 'react';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import searchFilterFunction from '../helpers/searchFilter';
import SearchBar from '../components/searchBar';
import withObservables from '@nozbe/with-observables';
import {
  Completed_Hike,
  Queued_Trail,
  Subscription,
  Trail,
  User,
} from '../watermelon/models';

interface Props {
  user: User;
  completedHikes: Completed_Hike[];
  queuedTrails: Queued_Trail[];
  userSubscription: Subscription[];
}

const ExploreScreen = ({
  user,
  completedHikes,
  queuedTrails,
  userSubscription,
}: Props) => {
  const watermelonDatabase = useDatabase();

  const [trailsCollection, setTrailsCollection] = React.useState<any>();
  const [
    basicSubscriptionTrailsCollection,
    setBasicSubscriptionTrailsCollection,
  ] = React.useState<any>(null);

  const getTrails = async () => {
    try {
      const trailsCollection = await watermelonDatabase.collections
        .get('trails')
        .query()
        .fetch();
      setTrailsCollection(trailsCollection);

      const basicSubscriptionTrailsCollection =
        await watermelonDatabase.collections
          .get('basic_subscription_trails')
          .query()
          .fetch();

      setBasicSubscriptionTrailsCollection(basicSubscriptionTrailsCollection);
    } catch (err) {
      console.error('Error in get trails exploreScreen', err);
    }
  };

  React.useEffect(() => {
    getTrails();
  }, []);

  if (!basicSubscriptionTrailsCollection || !trailsCollection) {
    return (
      <SafeAreaView>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView>
      <ScrollView>
        <EnhancedNearbyTrails
          user={user}
          trailsCollection={trailsCollection}
          basicSubscriptionTrails={basicSubscriptionTrailsCollection}
          queuedTrails={queuedTrails}
          completedHikes={completedHikes}
          userSubscription={userSubscription[0]}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const enhance = withObservables(['user'], ({user}) => ({
  user,
  completedHikes: user.completedHikes.observe(),
  queuedTrails: user.queuedTrails.observe(),
  userSubscription: user.usersSubscriptions.observe(),
}));

const EnhancedExploreScreen = enhance(ExploreScreen);
export default EnhancedExploreScreen;

const styles = StyleSheet.create({});
