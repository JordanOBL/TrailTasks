import {ScrollView, StyleSheet, Text, SafeAreaView} from 'react-native';
import NearbyTrails from '../components/NearbyTrails';
import React, {useContext, useState} from 'react';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import getTrails from '../helpers/Trails/getTrails';
import {UserContext} from '../App';
import {sync} from '../watermelon/sync';

const ExploreScreen = () => {
  const watermelonDatabase = useDatabase();
  const {userId, setUserId} = useContext(UserContext);
  const {trails, setTrails} = getTrails(watermelonDatabase);
  const [user, setUser] = useState<any>(null);

  async function getLoggedInUser() {
    try {
      const loggedInUser = await watermelonDatabase.get('users').find(userId);

      if (loggedInUser) {
        setUser(loggedInUser);
        await sync(watermelonDatabase);
      }
    } catch (err) {
      console.log('error in getloggeduser function in Homescreen', err);
    }
  }
  React.useEffect(() => {
    getLoggedInUser();
  }, [user, trails]);
  
  return (
    <SafeAreaView>
      {trails && user ? (
        <ScrollView>
          <NearbyTrails
            user={user}
            trails={trails}
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
