import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
} from 'react-native';
import * as React from 'react';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import withObservables from '@nozbe/with-observables';
import {
  Basic_Subscription_Trail,
  Completed_Hike,
  Queued_Trail,
  Subscription,
  Trail,
  User,
} from '../watermelon/models';

import EnhancedTrailCard from './Trails/TrailCard';
import {formatDateTime} from '../helpers/formatDateTime';

interface Props {
  trailsCollection: Trail[];
  user: User;
  queuedTrails: Queued_Trail[];
  basicSubscriptionTrails: any;
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
  const [showReplaceTrailModal, setShowReplaceTrailModal] =
    React.useState<boolean>(false);
  const [replacementTrailId, setReplacementTrailId] = React.useState<
    number | string | null
  >(null);

  const filterTrails = (title: string, trailsArr: any): any => {
    if (title === 'Short Trails') {
      return trailsArr.filter(
        (trail: any) => trail.trailDifficulty === 'short'
      );
    } else if (title === 'Moderate Trails') {
      return trailsArr.filter(
        (trail: any) => trail.trailDifficulty === 'moderate'
      );
    } else if (title === 'Long Trails') {
      return trailsArr.filter(
        (trail: any) => trail.trailDiifficulty === 'long'
      );
    }
  };
  const queuedCache: {[key: string]: boolean} = {};
  const completedCache: {[key: string]: boolean} = {};
  const basicTrailsCache: {[key: string]: boolean} = {};

  React.useEffect(() => {
    completedHikes.forEach(
      (trail: Completed_Hike) => (completedCache[trail.trailId] = true)
    );
  }, [completedHikes]);

  React.useEffect(() => {
    queuedTrails.forEach(
      (trail: Queued_Trail) => (queuedCache[trail.trailId] = true)
    );
  }, [queuedTrails]);

  basicSubscriptionTrails
    .map((trail: any) => trail.trailId)
    .forEach((trailId: any) => (basicTrailsCache[trailId] = true));

  return showReplaceTrailModal ? (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showReplaceTrailModal}
      onRequestClose={() => {
        setShowReplaceTrailModal(!showReplaceTrailModal);
      }}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>
            Are you sure you want to replace your trail? ( Trail progress will
            be RESET, but total user miles hiked will be saved.)
          </Text>
          <Pressable
            style={[styles.button, styles.buttonCancel]}
            onPress={() => {
              setShowReplaceTrailModal((prev) => !prev);
              setReplacementTrailId(null);
            }}>
            <Text style={styles.textStyle}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.buttonExit]}
            onPress={async () => {
              await user.updateUserTrail({
                trailId: replacementTrailId?.toString(),
                trailStartedAt: formatDateTime(new Date()),
              });
              setShowReplaceTrailModal((prev) => !prev);
              setReplacementTrailId(null);
            }}>
            <Text style={styles.textStyle}>Change</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  ) : (
    <SafeAreaView>
      <ScrollView
        style={{
          backgroundColor: 'transparent',
          borderTopWidth: 1,
          borderColor: 'rgb(31,33,35)',
          padding: 10,
        }}>
        {userSubscription.isActive === false ? (
          <View>
            <Text style={styles.H2}> Free Monthly Trails</Text>
            <ScrollView horizontal>
              {trailsCollection && user ? (
                trailsCollection.map((trail: any) => {
                  if (basicTrailsCache && basicTrailsCache[trail.id]) {
                    return (
                      <EnhancedTrailCard
                        userSubscription={userSubscription}
                        queuedCache={queuedCache}
                        completedCache={completedCache}
                        user={user}
                        key={trail.id}
                        setReplacementTrailId={setReplacementTrailId}
                        setShowReplaceTrailModal={setShowReplaceTrailModal}
                        trail={trail}
                        completedHikes={completedHikes}
                        queuedTrails={queuedTrails}
                        basicSubscriptionTrails={basicTrailsCache}
                      />
                    );
                  }
                })
              ) : (
                <Text>Loading...</Text>
              )}
            </ScrollView>
          </View>
        ) : (
          <></>
        )}

        <Text style={styles.H2}>All Trails</Text>
        <ScrollView horizontal>
          {trailsCollection && user ? (
            trailsCollection.map((trail: any) => (
              <EnhancedTrailCard
                userSubscription={userSubscription}
                queuedCache={queuedCache}
                completedCache={completedCache}
                user={user}
                key={trail.id}
                setReplacementTrailId={setReplacementTrailId}
                setShowReplaceTrailModal={setShowReplaceTrailModal}
                trail={trail}
                completedHikes={completedHikes}
                queuedTrails={queuedTrails}
                basicSubscriptionTrails={basicTrailsCache}
              />
            ))
          ) : (
            <Text>Loading...</Text>
          )}
        </ScrollView>
      </ScrollView>
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

    // Shortcut syntax for `post.comments.observe()`
  })
);

const EnhancedNearbyTrails = enhance(NearbyTrails);
export default EnhancedNearbyTrails;

//export default NearbyTrails;

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    padding: 20,
    marginTop: 0,
  },
  QueueButtons: {
    color: 'rgb(249,253,255)',
    fontSize: 26,
    fontWeight: '900',
  },
  H1: {
    color: 'rgb(249,253,255)',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 10,
  },
  H2: {
    color: 'rgb(249,253,255)',
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
