import {ImageBackground, Pressable, StyleSheet, Text, View} from 'react-native';

import formatDateTime from '../../helpers/formatDateTime';
import withObservables from '@nozbe/with-observables';
import CapitalizeWord from '../../helpers/capitalizeWord';

import {
  Completed_Hike,
  Queued_Trail,
  Subscription,
} from '../../watermelon/models';

interface Props {
  trail: any;
  setReplacementTrailId: any;
  setShowReplaceTrailModal: any;
  user: any;
  queuedTrails: any;
  completedHikes: any;
  park: any;
  basicSubscriptionTrails: any;
  userSubscription: Subscription;
  queuedCache: any;
  completedCache: any;
}
const TrailCard = ({
  user,
  trail,
  completedHikes,
  completedCache,
  queuedTrails,
  queuedCache,
  setReplacementTrailId,
  setShowReplaceTrailModal,
  park,
  basicSubscriptionTrails,
  userSubscription,
}: Props) => {
  // const completedCache: {[key: string]: boolean} = {};
  // completedHikes.forEach(
  //   (trail: Completed_Hike) => (completedCache[trail.trailId] = true)
  // );
  // const queuedCache: {[key: string]: boolean} = {};
  // queuedTrails.forEach(
  //   (trail: Queued_Trail) => (queuedCache[trail.trailId] = true)
  // );

  return user && basicSubscriptionTrails && userSubscription ? (
    <View
      key={trail.id}
      style={{
        height: '100%',
        position: 'relative',
        marginRight: 40,
        marginVertical: 10,
        padding: 10,
      }}>
      <ImageBackground
        source={
          trail.trailImageUrl
            ? {uri: trail.trailImageUrl}
            : require('../../assets/trailpic.jpg')
        }
        style={{
          width: 250,
          height: 150,
        }}
        imageStyle={{
          borderRadius: 20,
          borderColor: 'rgb(31, 33, 35)',
          borderWidth: 2,
          shadowColor: 'white',
          shadowRadius: 20,
        }}>
        <Text
          style={
            completedHikes && completedCache[trail.id]
              ? {
                  position: 'absolute',
                  backgroundColor: 'rgb(41,184,169)',
                  top: 20,
                  width: 80,
                  textAlign: 'center',
                }
              : {}
          }>
          {completedHikes && completedCache[trail.id] ? (
            <Text
              style={{
                color: 'white',
                fontSize: 12,
                fontWeight: '600',
                marginLeft: 5,
              }}>
              Completed
            </Text>
          ) : (
            <></>
          )}
        </Text>
      </ImageBackground>

      <View style={{marginTop: 10, padding: 5}}>
        <Text
          style={
            trail.trailDifficulty === 'short'
              ? styles.TrailEasy
              : trail.trailDifficulty === 'moderate'
              ? styles.TrailModerate
              : styles.TrailHard
          }>
          {CapitalizeWord(trail.trailDifficulty)}
        </Text>
        <Text style={styles.TrailName}>{trail.trailName}</Text>
        <Text style={styles.TrailPark}>{park.parkName} Park</Text>
        <Text style={styles.TrailDistance}>
          Distance: {trail.trailDistance} mi - Est{' '}
          {(trail.trailDistance / 2).toFixed()} hr.
        </Text>
        <View style={{position: 'relative'}}>
          <Text
            style={{
              position: 'absolute',
              right: 10,
              bottom: 90,
            }}>
            {userSubscription && userSubscription.isActive ? (
              queuedTrails && queuedCache[trail.id] ? (
                <Pressable
                  onPress={async () => {
                    console.log('trailId', trail.id);
                    console.log('userId', user.id);
                    console.log(user.queuedTrails);

                    await trail.deleteFromQueuedTrails({userId: user.id});
                  }}>
                  <Text
                    style={[
                      styles.QueueButtons,
                      {
                        color:
                          queuedTrails && queuedCache[trail.id]
                            ? 'red'
                            : 'rgb(7,254,213)',
                      },
                    ]}>
                    -
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={async () =>
                    await trail.addToQueuedTrails({userId: user.id})
                  }>
                  <Text
                    style={[
                      styles.QueueButtons,
                      {
                        color:
                          queuedTrails && queuedCache[trail.id] === undefined
                            ? 'rgb(7,254,213)'
                            : 'red',
                      },
                    ]}>
                    +
                  </Text>
                </Pressable>
              )
            ) : (
              <></>
            )}
          </Text>
          <Pressable
            style={{
              backgroundColor:
                user.trailId == trail.id
                  ? 'grey'
                  : userSubscription && userSubscription.isActive
                  ? 'rgb(7,254,213)'
                  : basicSubscriptionTrails && basicSubscriptionTrails[trail.id]
                  ? 'rgb(7,254,213)'
                  : 'grey',

              width: '50%',
              borderRadius: 10,
              paddingVertical: 5,
              marginTop: 10,
            }}
            onPress={async () => {
              try {
                if (user.trailId) {
                  setShowReplaceTrailModal(true);
                  setReplacementTrailId(trail.id);
                } else {
                  user.updateCurrentTrailId({
                    trailId: trail.trailId,
                    formatDateTime: formatDateTime(new Date()),
                  });
                }
              } catch (err) {
                console.log('error Setting new trail for user', err);
              }
            }}
            disabled={
              user.trailId == trail.id ||
              (userSubscription &&
                !userSubscription.isActive &&
                basicSubscriptionTrails &&
                !basicSubscriptionTrails[trail.id])
            }>
            <Text
              style={{
                color: 'rgb(31,33,35)',
                fontWeight: 'bold',
                fontSize: 16,
                textAlign: 'center',
              }}>
              {user.trailId == trail.id
                ? 'In Progress'
                : basicSubscriptionTrails && basicSubscriptionTrails[trail.id]
                ? 'Start Now'
                : userSubscription && userSubscription.isActive === true
                ? 'Start Now'
                : 'Unlock with Pro'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  ) : (
    <Text>Loading...</Text>
  );
};

const enhance = withObservables(
  ['user', 'trail', 'queuedTrails', 'userSubscription'],
  ({user, trail, userSubscription}) => ({
    user: user.observe(),
    completedHikes: user.completedHikes.observe(),
    queuedTrails: user.queuedTrails.observe(),
    trail: trail.observe(),
    park: trail.park.observe(),
    userSubscription,

    // Shortcut syntax for `post.comments.observe()`
  })
);

const EnhancedTrailCard = enhance(TrailCard);
export default EnhancedTrailCard;

//export default TrailCard;

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
  TrailName: {
    color: 'rgb(249,253,255)',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 0,
  },
  TrailEasy: {
    color: 'limegreen',
    fontSize: 16,
    fontWeight: '300',
    marginBottom: 5,
  },
  TrailModerate: {
    color: 'orange',
    fontSize: 16,
    fontWeight: '300',
    marginBottom: 5,
  },
  TrailHard: {
    color: 'red',
    fontSize: 16,
    fontWeight: '300',
    marginBottom: 5,
  },
  TrailDistance: {
    color: 'rgb(221,224,226)',
    fontSize: 14,
    fontWeight: '300',
    marginBottom: 0,
  },
  TrailPark: {
    color: 'rgb(221,224,226)',
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 0,
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
