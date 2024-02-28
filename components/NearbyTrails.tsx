import { Basic_Subscription_Trail, Completed_Hike, Queued_Trail, Subscription, Trail, User } from '../watermelon/models';
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';

import EnhancedTrailCard from './Trails/TrailCard';
import formatDateTime from '../helpers/formatDateTime';
import withObservables from '@nozbe/with-observables';

interface Props {
  trailsCollection: Trail[];
  user: User;
  queuedTrails: Queued_Trail[];
  basicSubscriptionTrails: Basic_Subscription_Trail[];
  completedHikes: Completed_Hike[];
  userSubscription: Subscription;
}

const NearbyTrails = ({
  trailsCollection,
  user,
  completedHikes,
  queuedTrails,
  basicSubscriptionTrails,
  userSubscription,
}: Props) => {
  const [showReplaceTrailModal, setShowReplaceTrailModal] = useState(false);
  const [replacementTrailId, setReplacementTrailId] = useState<null | number>(null);

  const queuedCache: {[key: string]: boolean} = {};
  const completedCache: {[key: string]: boolean} = {};
  const basicTrailsCache: { [key: string]: boolean }  = {};

  useEffect(() => {
    completedHikes.forEach((trail) => (completedCache[trail.trailId] = true));
    queuedTrails.forEach((trail) => (queuedCache[trail.trailId] = true));
    basicSubscriptionTrails.forEach(
      (trail: { trailId: string | number; }) => (basicTrailsCache[trail.trailId] = true)
    );
  }, [completedHikes, queuedTrails, basicSubscriptionTrails]);

  const handleReplaceTrail = async () => {
    await user.updateUserTrail({
      trailId: replacementTrailId?.toString(),
      trailStartedAt: formatDateTime(new Date()),
    });
    setShowReplaceTrailModal(false);
    setReplacementTrailId(null);
  };

  const renderTrailItem = ({item}) => (
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
      basicSubscriptionTrails={basicTrailsCache}
    />
  );

  return (
    <SafeAreaView>
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

      {userSubscription.isActive === false && (
        <View>
          <Text style={styles.H2}> Free Monthly Trails</Text>
          <FlatList
            data={trailsCollection.filter(
              (trail) => basicTrailsCache[trail.id]
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={renderTrailItem}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>
      )}

      <View>
        <Text style={styles.H2}>All Trails</Text>
        <FlatList
          data={trailsCollection}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderTrailItem}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
    </SafeAreaView>
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
  H2: {
    color: 'rgb(249,253,255)',
    fontSize: 22,
    fontWeight: '800',
    marginVertical: 10,
  },
});
