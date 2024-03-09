import {
  Completed_Hike,
  Queued_Trail,
  Subscription,
  Trail,
  User,
  User_Purchased_Trail,
} from '../watermelon/models';
import React, {useContext, useState} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text} from 'react-native';

import EnhancedNearbyTrails from '../components/NearbyTrails';
import SearchBar from '../components/searchBar';
import searchFilterFunction from '../helpers/searchFilter';
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
  userPurchasedTrails
}: Props) => {
  const watermelonDatabase = useDatabase();

  const [trailsCollection, setTrailsCollection] = React.useState<any>();
  const [
    basicSubscriptionTrailsCollection,
    setBasicSubscriptionTrailsCollection,
  ] = React.useState<any>(null);
  // const[usersPurchasedTrails, setUsersPurchasedTrails] = React.useState<any>() 

  const getTrails = async () => {
    try {
      const trailsCollection = await watermelonDatabase
        .get('trails')
        .query()
        .fetch();
     

      const basicSubscriptionTrailsCollection =
        await watermelonDatabase
          .get('basic_subscription_trails')
          .query()
          .fetch();
      // const usersPurchasedTrailsCollection =
      //   await watermelonDatabase.collections.get('users_purchased_trails')
      //     .query()
      //     .fetch();


      setBasicSubscriptionTrailsCollection(basicSubscriptionTrailsCollection);
      setTrailsCollection(trailsCollection);
    // setUsersPurchasedTrails(usersPurchasedTrailsCollection);
      console.debug(userPurchasedTrails[0])
    } catch (err) {
      console.error('Error in get trails exploreScreen', {err});
    }
  };

  React.useEffect(() => {
    getTrails();
    
  }, [user, userPurchasedTrails, queuedTrails]);

  if (!basicSubscriptionTrailsCollection || !trailsCollection) {
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
          basicSubscriptionTrails={basicSubscriptionTrailsCollection}
          queuedTrails={queuedTrails}
          completedHikes={completedHikes}
        userSubscription={userSubscription[0]}
        userPurchasedTrails={userPurchasedTrails}
        />
      
    </SafeAreaView>
  );
};

const enhance = withObservables(['user'], ({user}) => ({
  user,
  completedHikes: user.completedHikes.observe(),
  queuedTrails: user.queuedTrails.observe(),
  userSubscription: user.usersSubscriptions.observe(),
  userPurchasedTrails: user.usersPurchasedTrails.observe() 
  
  
}));

const EnhancedExploreScreen = enhance(ExploreScreen);
export default EnhancedExploreScreen;

const styles = StyleSheet.create({});
