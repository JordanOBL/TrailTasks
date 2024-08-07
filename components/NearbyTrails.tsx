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

import EnhancedAllTrailsCard from './Trails/AllTrailsCard';
import EnhancedFreeTrailCard from './Trails/FreeTrailsCard';
import EnhancedTrailOfTheWeekCard from './Trails/TrailOfTheWeekCard';
import formatDateTime from '../helpers/formatDateTime';
import withObservables from '@nozbe/with-observables';
import BuyTrailModal from './Trails/BuyTrailModal';

interface Props {
  trailsCollection: Trail[];
  user: User;
  queuedTrails: Queued_Trail[];
  completedHikes: Completed_Hike[];
  userSubscription: Subscription;
  userPurchasedTrails: User_Purchased_Trail[];
  trailOfTheWeek: Trail[];
  freeTrails: Trail[];
  subscriptionTrails: Trail[];
}

const NearbyTrails = ({
  trailsCollection,
  user,
  completedHikes,
  queuedTrails,
  freeTrails,
  trailOfTheWeek,
  userSubscription,
  userPurchasedTrails,
  subscriptionTrails,
}: Props) => {
  const [showReplaceTrailModal, setShowReplaceTrailModal] = useState(false);
  const [replacementTrailId, setReplacementTrailId] = useState<null | number>(
    null
  );
  const [showBuyTrailModal, setShowBuyTrailModal] = useState(false); // State variable for BuyTrailModal
  const [selectedTrailForPurchase, setSelectedTrailForPurchase] =
    useState<Trail | null>(null); // State variable for selected trail to purchase

  const completedCache: {[key: string]: boolean} = {};
  const freeTrailsCache: {[key: string]: boolean} = {};
  const queuedCache: {[key: string]: boolean} = {};
  const subscriptionTrailsCache: {[key: string]: boolean} = {};
  const userPurchasedTrailsCache: {[key: string]: boolean} = {};

  useEffect(() => {
    completedHikes.forEach((trail) => (completedCache[trail.trailId] = true));
    freeTrails.forEach((trail) => (freeTrailsCache[trail.id] = true));
    queuedTrails.forEach((trail) => (queuedCache[trail.trailId] = true));
    subscriptionTrails.forEach(
      (trail) => (subscriptionTrailsCache[trail.id] = true)
    );
    userPurchasedTrails.forEach(
      (trail: {trailId: string | number}) =>
        (userPurchasedTrailsCache[trail.trailId] = true)
    );
  }, [subscriptionTrails, freeTrails, queuedTrails, completedHikes]);

  const handleReplaceTrail = async () => {
    await user.updateUserTrail({
      trailId: replacementTrailId?.toString(),
      trailStartedAt: formatDateTime(new Date()),
    });
    setShowReplaceTrailModal(false);
    setReplacementTrailId(null);
  };

    const handleBuyTrail = (trail: Trail) => {
      setSelectedTrailForPurchase(trail); // Set the selected trail for purchase
      setShowBuyTrailModal(true); // Show the BuyTrailModal
    };

  const renderTrailOfTheWeekItem = ({item}: any) => (
    <EnhancedTrailOfTheWeekCard
      userSubscription={userSubscription}
      completedCache={{...completedCache}}
      user={user}
      setReplacementTrailId={setReplacementTrailId}
      setShowReplaceTrailModal={setShowReplaceTrailModal}
      trail={item}
      completedHikes={completedHikes}
      freeTrailsCache={{...freeTrailsCache}}
      userPurchasedTrailsCache={{...userPurchasedTrailsCache}}
    />
  );

  const renderFreeTrailsItem = ({item}: any) => (
    <EnhancedFreeTrailCard
      userSubscription={userSubscription}
      completedCache={{...completedCache}}
      user={user}
      setReplacementTrailId={setReplacementTrailId}
      setShowReplaceTrailModal={setShowReplaceTrailModal}
      trail={item}
      completedHikes={completedHikes}
      freeTrailsCache={{...freeTrailsCache}}
      userPurchasedTrailsCache={{...userPurchasedTrailsCache}}
    />
  );

  const renderAllTrailsItem = ({item}: any) => (
    <EnhancedAllTrailsCard
      userSubscription={userSubscription}
      completedCache={{...completedCache}}
      user={user}
      setReplacementTrailId={setReplacementTrailId}
      setShowReplaceTrailModal={setShowReplaceTrailModal}
      trail={item}
      completedHikes={completedHikes}
      freeTrailsCache={{...freeTrailsCache}}
      subscriptionTrailsCache={{...subscriptionTrailsCache}}
      userPurchasedTrailsCache={{...userPurchasedTrailsCache}}
      onBuyTrail={handleBuyTrail}
    />
  );

  return (
    <ScrollView style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={showReplaceTrailModal}
        onRequestClose={() => setShowReplaceTrailModal(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Start New Trail</Text>
            <Text style={styles.modalText}>
              Are you sure you want to replace your current trail? Trail
              progress will be RESET. Total miles hiked will be saved.
            </Text>
            <View style={styles.buttonContainer}>
              <Pressable
                style={[styles.button, styles.buttonCancel]}
                onPress={() => setShowReplaceTrailModal(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.buttonConfirm]}
                onPress={handleReplaceTrail}>
                <Text style={styles.buttonText}>Start New</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for buying trail with trail tokens */}
      <BuyTrailModal
        isVisible={showBuyTrailModal}
        onClose={() => setShowBuyTrailModal(false)}
        trail={selectedTrailForPurchase}
        trailTokens={user.trailTokens}
        onBuyTrail={async (trail, cost) => {
          // Logic to handle buying trail
          // Example: You can update the user's trail or deduct trail tokens here
          // You may need to implement this logic based on your app's requirements
          const results = await user.purchaseTrail(trail, cost)
          console.log('Buying trail:', trail);
        }}
      />

      {/* Trail of The Week*/}

      <View style={styles.trailsContainer}>
        <Text style={styles.H2}> Trail of The Week</Text>
        <FlatList
          data={trailOfTheWeek}
          initialNumToRender={1}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderTrailOfTheWeekItem}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
      {/* Free Trails */}

      <View style={styles.trailsContainer}>
        <Text style={styles.H2}> Free Trails</Text>
        <FlatList
          data={freeTrails}
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

  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonCancel: {
    backgroundColor: 'gray',
  },
  buttonConfirm: {
    backgroundColor: 'green',
  },
});
