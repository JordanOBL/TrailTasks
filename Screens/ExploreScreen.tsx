import {
  Completed_Hike,
  Queued_Trail,
  Subscription,
  Trail,
  User,
  User_Purchased_Trail,
} from '../watermelon/models';
import {Model, Q} from '@nozbe/watermelondb';
import {SafeAreaView, ScrollView, StyleSheet, Text} from 'react-native';
import {useCallback, useEffect, useState} from 'react';

import EnhancedNearbyTrails from '../components/NearbyTrails';
import SearchBar from '../components/searchBar';
import searchFilterFunction from '../helpers/searchFilter';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import withObservables from '@nozbe/with-observables';

interface Props {
  user: User;
  completedHikes: Completed_Hike[];
  queuedTrails: Queued_Trail[];
  userSubscription: Subscription[];
  userPurchasedTrails: User_Purchased_Trail[];
}

const ExploreScreen = ({
  user,
  completedHikes,
  queuedTrails,
  userSubscription,
  userPurchasedTrails,
}: Props) => {
  const watermelonDatabase = useDatabase();

  const [trailsCollection, setTrailsCollection] = useState<Trail[]>([]);
  const [trailOfTheWeek, setTrailOfTheWeek] = useState<Trail[]>();
  const [freeTrails, setFreeTrails] = useState<Trail[]>([]);
  const [subscriptionTrails, setSubscriptionTrails] = useState<Trail[]>([])
  // const [usersPurchasedTrails, setUsersPurchasedTrails] = useState<User_Purchased_Trail[]>();

  const getTrails = async () => {
    try {
      const trailsCollection = (await watermelonDatabase
        .get('trails')
        .query()
        .fetch()) as Trail[];
      const trailOfTheWeekCollection = (await watermelonDatabase
        .get('trails')
        .query(Q.where('trail_of_the_week', true))
        .fetch()) as Trail[];
      const freeTrailsCollection = (await watermelonDatabase
        .get('trails')
        .query(Q.where('is_free', true))
        .fetch()) as Trail[];
      const subscriptionTrailsCollection = (await watermelonDatabase
        .get('trails')
        .query(Q.where('is_subscribers_only', true))
        .fetch()) as Trail[];

      // const usersPurchasedTrailsCollection =
      //   (await watermelonDatabase.collections
      //     .get('users_purchased_trails')
      //     .query()
      //     .fetch()) as User_Purchased_Trail[]

      setTrailsCollection(trailsCollection);
      setTrailOfTheWeek(trailOfTheWeekCollection);
      setFreeTrails(freeTrailsCollection);
      setSubscriptionTrails(subscriptionTrailsCollection)
      // setUsersPurchasedTrails(usersPurchasedTrailsCollection);
    } catch (err) {
      console.error('Error in get trails exploreScreen', {err});
    }
  };

useFocusEffect(
  useCallback(() => {
    getTrails();
  }, [user, userPurchasedTrails, queuedTrails])
);

  if (!trailsCollection) {
    return (
      <SafeAreaView>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView>
      <EnhancedNearbyTrails
        user={user}
        trailsCollection={trailsCollection}
        queuedTrails={queuedTrails}
        completedHikes={completedHikes}
        userSubscription={userSubscription[0]}
        userPurchasedTrails={userPurchasedTrails}
        freeTrails={freeTrails}
        trailOfTheWeek={trailOfTheWeek}
        subscriptionTrails={subscriptionTrails}
      />
    </SafeAreaView>
  );
};

const enhance = withObservables(['user'], ({user}) => ({
  user,
  completedHikes: user.completedHikes.observe(),
  queuedTrails: user.queuedTrails.observe(),
  userSubscription: user.usersSubscriptions.observe(),
  userPurchasedTrails: user.usersPurchasedTrails.observe(),
}));

const EnhancedExploreScreen = enhance(ExploreScreen);
export default EnhancedExploreScreen;

const styles = StyleSheet.create({});
