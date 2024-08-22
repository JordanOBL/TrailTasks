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
import BuyTrailModal from './Trails/BuyTrailModal';
import formatDateTime from '../helpers/formatDateTime';
import withObservables from "@nozbe/with-observables";
import {Completed_Hike, Queued_Trail, Subscription, Trail, User, User_Purchased_Trail} from "../watermelon/models";

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
  const [replacementTrailId, setReplacementTrailId] = useState<null | number>(null);
  const [showBuyTrailModal, setShowBuyTrailModal] = useState(false);
  const [selectedTrailForPurchase, setSelectedTrailForPurchase] = useState<Trail | null>(null);

  const completedCache = useMemo(() => {
    return completedHikes.reduce((cache, trail) => {
      // @ts-ignore
      cache[trail.trailId] = true;
      return cache;
    }, {});
  }, [completedHikes]);

  const freeTrailsCache = useMemo(() => {
    return freeTrails.reduce((cache, trail) => {
      // @ts-ignore
      cache[trail.id] = true;
      return cache;
    }, {});
  }, [freeTrails]);

  const queuedCache = useMemo(() => {
    return queuedTrails.reduce((cache, trail) => {
      // @ts-ignore
      cache[trail.trailId] = true;
      return cache;
    }, {});
  }, [queuedTrails]);

  const subscriptionTrailsCache = useMemo(() => {
    return subscriptionTrails.reduce((cache, trail) => {
      // @ts-ignore
      cache[trail.id] = true;
      return cache;
    }, {});
  }, [subscriptionTrails]);

  const userPurchasedTrailsCache = useMemo(() => {
    return userPurchasedTrails.reduce((cache, trail) => {
      // @ts-ignore
      cache[trail.trailId] = true;
      return cache;
    }, {});
  }, [userPurchasedTrails]);

  const handleReplaceTrail = async () => {
    await user.updateUserTrail({
      trailId: replacementTrailId?.toString(),
      trailStartedAt: formatDateTime(new Date()),
    });
    setShowReplaceTrailModal(false);
    setReplacementTrailId(null);
  };

  const handleBuyTrail = (trail: Trail) => {
    setSelectedTrailForPurchase(trail);
    setShowBuyTrailModal(true);
  };

  const renderTrailOfTheWeekItem = ({item}: any) => (
      <EnhancedTrailOfTheWeekCard
          userSubscription={userSubscription}
          completedCache={completedCache}
          user={user}
          setReplacementTrailId={setReplacementTrailId}
          setShowReplaceTrailModal={setShowReplaceTrailModal}
          trail={item}
          freeTrailsCache={freeTrailsCache}
          userPurchasedTrailsCache={userPurchasedTrailsCache}
      />
  );

  const renderFreeTrailsItem = ({item}: any) => (
      <EnhancedFreeTrailCard
          userSubscription={userSubscription}
          completedCache={completedCache}
          user={user}
          setReplacementTrailId={setReplacementTrailId}
          setShowReplaceTrailModal={setShowReplaceTrailModal}
          trail={item}
          freeTrailsCache={freeTrailsCache}
          userPurchasedTrailsCache={userPurchasedTrailsCache}
      />
  );

  const renderAllTrailsItem = ({item}: any) => (
      <EnhancedAllTrailsCard
          userSubscription={userSubscription}
          completedCache={completedCache}
          user={user}
          setReplacementTrailId={setReplacementTrailId}
          setShowReplaceTrailModal={setShowReplaceTrailModal}
          trail={item}
          freeTrailsCache={freeTrailsCache}
          subscriptionTrailsCache={subscriptionTrailsCache}
          userPurchasedTrailsCache={userPurchasedTrailsCache}
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

        <BuyTrailModal
            isVisible={showBuyTrailModal}
            onClose={() => setShowBuyTrailModal(false)}
            trail={selectedTrailForPurchase}
            trailTokens={user.trailTokens}
            onBuyTrail={async (trail, cost) => {
              const result = await user.purchaseTrail(trail, cost);
              console.log('Buying trail:', trail);
            }}
        />

        <View style={styles.trailsContainer}>
          <Text style={styles.H2}>Trail of The Week <Text style={{fontWeight:'100', fontStyle:'italic', fontSize:16}}>({trailOfTheWeek.length})</Text></Text>
          <FlatList
              data={trailOfTheWeek}
              initialNumToRender={1}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={renderTrailOfTheWeekItem}
              keyExtractor={(item) => item.id.toString()}
          />
        </View>

        <View style={styles.trailsContainer}>
          <Text style={styles.H2}>Free Trails <Text style={{fontWeight:'100', fontStyle:'italic', fontSize:16}}>({freeTrails.length})</Text></Text>
          <FlatList
              data={freeTrails}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={renderFreeTrailsItem}
              keyExtractor={(item) => item.id.toString()}
          />
        </View>

        <View style={styles.trailsContainer}>
          <Text style={styles.H2}>All Trails <Text style={{fontWeight:'100', fontStyle:'italic', fontSize:16}}>({trailsCollection.length})</Text></Text>
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
    backgroundColor: 'black', // Background color of the scrollable container
  },
  trailsContainer: {
    marginBottom: 20, // Space between the trail section
    borderColor: 'rgba(255,255, 255, 0.4)',
    borderBottomWidth: 1,


  },
  H2: {
    color: 'rgb(249, 253, 255)', // White color for the section headers
    fontSize: 22, // Larger font size for the section headers
    fontWeight: '800', // Bold text for the section headers
    marginVertical: 10, // Vertical margin around the section headers
    letterSpacing: 2
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center', // Center the modal vertically
    alignItems: 'center', // Center the modal horizontally
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
  },
  modalContainer: {
    backgroundColor: 'white', // White background for the modal
    borderRadius: 10, // Rounded corners for the modal
    padding: 20, // Padding inside the modal
    width: '80%', // Modal takes up 80% of the screen width
  },
  modalTitle: {
    fontSize: 18, // Font size for the modal title
    fontWeight: 'bold', // Bold text for the modal title
    marginBottom: 10, // Space below the modal title
    textAlign: 'center', // Center the modal title
    color: 'black',
  },
  modalText: {
    fontSize: 16, // Font size for the modal text
    marginBottom: 20, // Space below the modal text
    textAlign: 'center', // Center the modal text
    color: 'black',
  },
  buttonContainer: {
    flexDirection: 'row', // Buttons are arranged in a row
    justifyContent: 'center', // Center the buttons within the modal
  },
  button: {
    borderRadius: 5, // Rounded corners for the buttons
    paddingVertical: 10, // Vertical padding for the buttons
    paddingHorizontal: 20, // Horizontal padding for the buttons
    marginHorizontal: 10, // Space between the buttons
  },
  buttonText: {
    color: 'white', // White text color for the buttons
    fontSize: 16, // Font size for the button text
    fontWeight: 'bold', // Bold text for the buttons
    textAlign: 'center', // Center the button text
  },
  buttonCancel: {
    backgroundColor: 'gray', // Gray background for the cancel button
  },
  buttonConfirm: {
    backgroundColor: 'green', // Green background for the confirm button
  },
});