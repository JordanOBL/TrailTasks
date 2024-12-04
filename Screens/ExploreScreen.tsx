import {
  User_Completed_Trail,
  User_Queued_Trail,
  User,
  User_Purchased_Trail,
} from '../watermelon/models';
import {Q} from '@nozbe/watermelondb';
import {SafeAreaView, StyleSheet, Text} from 'react-native';
import React, {useCallback, useState} from 'react';

import EnhancedTrailsList from '../components/TrailsList';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useDatabase} from '@nozbe/watermelondb/react';
import {withObservables} from '@nozbe/watermelondb/react';
import handleError from "../helpers/ErrorHandler";
import FullTrailDetails from "../types/fullTrailDetails";

interface Props {
  user: User;
  completedHikes: User_Completed_Trail[];
  queuedTrails: User_Queued_Trail[];
  userPurchasedTrails: User_Purchased_Trail[];
}

const ExploreScreen = ({
  user,
  completedHikes,
  queuedTrails,
  userPurchasedTrails,
}: Props) => {
  const watermelonDatabase = useDatabase();

  const [trailsCollection, setTrailsCollection] = useState<FullTrailDetails[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("")

  const getTrails =  useCallback(async () => {
        try {
          const fullTrailRecords = await watermelonDatabase.get('trails').query(
              Q.experimentalJoinTables(['parks']),
              Q.experimentalNestedJoin('parks', 'parks_states'),
                  Q.unsafeSqlQuery(
                      'SELECT trails.*, ' +
                        'parks.id AS park_id, parks.park_name, parks.park_type, parks.park_image_url, ' +
                        'park_states.id AS park_state_id, park_states.state_code, park_states.state ' +
                 'FROM trails ' +
                 'LEFT JOIN parks ON trails.park_id = parks.id ' +
                 'LEFT JOIN park_states ON parks.id = park_states.park_id ' +
                 'GROUP BY trails.id', []
                  ),
          ).unsafeFetchRaw();

          if (fullTrailRecords.length === 0) {
            setErrorMessage("Error Getting trails, try again later!");
          } else {
            setTrailsCollection(fullTrailRecords);
          }
        } catch (err) {
          handleError(err, "getFullTrailInfo");
        }
      }, []);


useFocusEffect(
  useCallback(() => {
    getTrails();
  }, [user])
);

  if (!trailsCollection) {
    return (
      <SafeAreaView>
        <Text style={{color: 'red'}}>Loading...</Text>
      </SafeAreaView>
    );
  }
  if (errorMessage) {
    return (
        <Text style={{color: 'red'}}>{errorMessage}</Text>
    )
  }


  return (
    <SafeAreaView style={{flex: 1}}>
      <EnhancedTrailsList
        user={user}
        trailsCollection={trailsCollection}
        queuedTrails={queuedTrails}
        completedTrails={completedTrails}
        userPurchasedTrails={userPurchasedTrails}
      />
    </SafeAreaView>
  );
};

const enhance = withObservables(['user'], ({user}) => ({
  user,
  completedTrails: user.usersCompletedTrails.observe(),
  queuedTrails: user.usersQueuedTrails.observe(),
  userPurchasedTrails: user.usersPurchasedTrails.observe(),
}));

const EnhancedExploreScreen = enhance(ExploreScreen);
export default EnhancedExploreScreen;

const styles = StyleSheet.create({

});
