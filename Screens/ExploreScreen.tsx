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
  completedTrails: User_Completed_Trail[];
  queuedTrails: User_Queued_Trail[];
  userPurchasedTrails: User_Purchased_Trail[];
}

const ExploreScreen = ({
  user,
  completedTrails,
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
                  'park_states.id AS park_state_id, park_states.state_code, park_states.state, ' +
                  'COUNT(DISTINCT users_completed_trails.trail_id) AS completed_trails, ' +
                  'users_parks.park_level ' +
                  'FROM trails ' +
                  'LEFT JOIN parks ON trails.park_id = parks.id ' +
                  'LEFT JOIN park_states ON parks.id = park_states.park_id ' +
                  'LEFT JOIN users_completed_trails ON users_completed_trails.trail_id = trails.id AND users_completed_trails.user_id = ? ' +
                  'LEFT JOIN users_parks ON users_parks.park_id = parks.id AND users_parks.user_id = ? ' +
                  'GROUP BY trails.id',
                  [user.id, user.id]
              ),
          ).unsafeFetchRaw();

          if (fullTrailRecords.length === 0) {
            setErrorMessage("Error Getting trails, try again later!");
          } else {
        console.debug("fullTrailRecords", fullTrailRecords);
            setTrailsCollection(fullTrailRecords);
          }
        } catch (err) {
          handleError(err, "getFullTrailInfo");
        }
      }, [userPurchasedTrails, user ]);


useFocusEffect(
  useCallback(() => {
    getTrails();
  }, [user])
);

  if (!trailsCollection) {
    return (
      <SafeAreaView>
        <Text style={{color: 'blue'}}>Loading...</Text>
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

const enhance = withObservables(['user', 'completedTrails', 'userPurchasedTrails'], ({user}) => ({
  user,
  completedTrails: user.usersCompletedTrails.observe(),
  queuedTrails: user.usersQueuedTrails.observe(),
  userPurchasedTrails: user.usersPurchasedTrails.observe(),
}));

const EnhancedExploreScreen = enhance(ExploreScreen);
export default EnhancedExploreScreen;

const styles = StyleSheet.create({

});
