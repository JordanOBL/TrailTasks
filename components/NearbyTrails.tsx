import {
Completed_Hike,
Queued_Trail,
Subscription,
Trail,
User,
User_Purchased_Trail,
} from '../watermelon/models';
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';

import EnhancedFreeTrailCard from './Trails/FreeTrailsCard';
import EnhancedTrailCard from './Trails/TrailCard';
import EnhancedTrailOfTheDayCard from './Trails/TrailOfTheDayCard';
import formatDateTime from '../helpers/formatDateTime';
import withObservables from '@nozbe/with-observables';

interface Props {
  trailsCollection: Trail[];
  user: User;
  queuedTrails: Queued_Trail[];
 
  completedHikes: Completed_Hike[];
  userSubscription: Subscription;
  userPurchasedTrails: User_Purchased_Trail[];
}

const NearbyTrails = ({
  trailsCollection,
  user,
  completedHikes,
  queuedTrails,

  userSubscription,
  userPurchasedTrails,
}: Props) => {
  const [showReplaceTrailModal, setShowReplaceTrailModal] = useState(false);
  const [replacementTrailId, setReplacementTrailId] = useState<null | number>(
    null
  );
  const [basicTrails, setBasicTrails] = useState<any>([]);
  const [purchasedTrails, setPurchasedTrails] = useState<any>([]);
  const [dailyTrail, setDailyTrail] = useState<any>([]);
  
  const queuedCache: {[key: string]: boolean} = {};
  const completedCache: {[key: string]: boolean} = {};
  const basicTrailsCache: {[key: string]: boolean} = {};
  const purchasedTrailsCache: {[key: string]: boolean} = {};

  useEffect(() => {
    completedHikes.forEach((trail) => (completedCache[trail.trailId] = true));
    queuedTrails.forEach((trail) => (queuedCache[trail.trailId] = true));

    userPurchasedTrails.forEach(
      (trail: {trailId: string | number}) =>
        (purchasedTrailsCache[trail.trailId] = true)
    );

   const freeTrails =  trailsCollection.filter((trail) => basicTrailsCache[trail.id] === true)
    
    setBasicTrails(freeTrails)
    ;
    setPurchasedTrails(() =>
      trailsCollection.filter((trail) => purchasedTrailsCache[trail.id])
    );
    setDailyTrail(() =>
      trailsCollection.filter((trail) => trail.id == '2')
    );
    
  }, [
  ]);

  const handleReplaceTrail = async () => {
    await user.updateUserTrail({
      trailId: replacementTrailId?.toString(),
      trailStartedAt: formatDateTime(new Date()),
    });
    setShowReplaceTrailModal(false);
    setReplacementTrailId(null);
  };

  const renderTrailOfTheDayItem = ({item}: any) => (
    <EnhancedTrailOfTheDayCard
      userSubscription={userSubscription}
      completedCache={completedCache}
      user={user}
      setReplacementTrailId={setReplacementTrailId}
      setShowReplaceTrailModal={setShowReplaceTrailModal}
      trail={item}
      completedHikes={completedHikes}
     
    />
  );  

  const renderFreeTrailsItem = ({item}: any) => (
    <EnhancedFreeTrailCard
      userSubscription={userSubscription}
      queuedCache={queuedCache}
      completedCache={completedCache}
      user={user}
      setReplacementTrailId={setReplacementTrailId}
      setShowReplaceTrailModal={setShowReplaceTrailModal}
      trail={item}
      completedHikes={completedHikes}
      queuedTrails={queuedTrails}


    />
  );  



  const renderAllTrailsItem = ({item}: any) => (
    <EnhancedTrailCard
      userSubscription={userSubscription}
      queuedCache={queuedCache}
      completedCache={completedCache}
      user={user}
      setReplacementTrailId={setReplacementTrailId}
      setShowReplaceTrailModal={setShowReplaceTrailModal}
      trail={item}
      completedHikes={completedHikes}
      queuedTrails={queuedTrails}
      purchasedTrailsCache={purchasedTrailsCache}
    />
  );

return (
  <ScrollView style={styles.container}>
    <Modal
      animationType="fade"
      transparent={true}
      visible={showReplaceTrailModal}
      onRequestClose={() => setShowReplaceTrailModal(false)}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>
            Are you sure you want to replace your trail? ( Trail progress will
            be RESET, but total user miles hiked will be saved.)
          </Text>
          <Pressable
            style={[styles.button, styles.buttonCancel]}
            onPress={() => setShowReplaceTrailModal(false)}>
            <Text style={styles.textStyle}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.buttonExit]}
            onPress={handleReplaceTrail}>
            <Text style={styles.textStyle}>Change</Text>
          </Pressable>
        </View>
      </View>
    </Modal>

    {/* Trail of The Day*/}

    <View style={styles.trailsContainer}>
      <Text style={styles.H2}> Trail of The Week</Text>
      <FlatList
        data={dailyTrail}
        initialNumToRender={1}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={renderTrailOfTheDayItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
    {/* Free Trails */}

    <View style={styles.trailsContainer}>
      <Text style={styles.H2}> Free Trails</Text>
      <FlatList
        data={basicTrails}
      
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={renderFreeTrailsItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>

    {/* All Trails */}
    <View style={styles.trailsContainer}>
      <Text style={styles.H2}>All Trails</Text>
      <FlatList
        data={trailsCollection}
       
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={renderAllTrailsItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  </ScrollView>
);

};

const enhance = withObservables(
  ['user', 'userSubscription'],
  ({user, userSubscription}) => ({
    user,
    completedHikes: user.completedHikes.observe(),
    queuedTrails: user.queuedTrails.observe(),
    userSubscription,
    
    
  })
);

const EnhancedNearbyTrails = enhance(NearbyTrails);
export default EnhancedNearbyTrails;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'black',
  },
  trailsContainer: {
    marginBottom: 20, // Add margin to separate the two lists
  },
  H2: {
    color: 'rgb(249, 253, 255)',
    fontSize: 22,
    fontWeight: '800',
    marginVertical: 10,
  },

  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'rgb(31,33,35)',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonExit: {
    backgroundColor: 'green',
  },
  buttonCancel: {
    backgroundColor: 'grey',
  },
  textStyle: {
    color: 'rgb(249,253,255)',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});
