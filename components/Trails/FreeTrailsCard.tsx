import {
  Completed_Hike,
  Queued_Trail,
  Subscription,
  User_Purchased_Trail,
} from '../../watermelon/models';
import {ImageBackground, Pressable, StyleSheet, Text, View} from 'react-native';

import CapitalizeWord from '../../helpers/capitalizeWord';
import formatDateTime from '../../helpers/formatDateTime';
import withObservables from '@nozbe/with-observables';

interface Props {
  trail: any;
  setReplacementTrailId: any;
  setShowReplaceTrailModal: any;
  user: any;
  completedHikes: any;
  park: any;
  freeTrailsCache: any;
  userSubscription: Subscription;
  completedCache: any;
  userPurchasedTrailsCache: any;
}
const FreeTrailCard = ({
  user,
  trail,
  completedCache,
  setReplacementTrailId,
  setShowReplaceTrailModal,
  park,
  freeTrailsCache,
  userSubscription,
  userPurchasedTrailsCache,
}: Props) => {
  const isFreeTrail = freeTrailsCache[trail.id];
  const isActiveSubscription = userSubscription.isActive === true;
  const isCompleted = completedCache[trail.id];
  const isPurchased = userPurchasedTrailsCache[trail.id];
  const trailDifficulty =
    trail.trailDistance > 20
      ? 'Insane'
      : trail.trailDistance > 10
      ? 'Long'
      : trail.trailDistance > 5
      ? 'Moderate'
      : 'Short';

  const calculateCoinReward = () => {
    let reward = trail.trailDistance;
    if (isActiveSubscription) {
      if (trail.trailDistance >= 5 && trail.trailDistance < 10) {
        reward *= 1.5;
      } else if (trail.trailDistance >= 10) {
        reward *= 2;
      }
    }
    return Math.round(reward);
  };

  const renderCoinReward = () => {
    const coinReward = calculateCoinReward();
    return (
      <>
        <Text
          style={{
            color: 'gold',
            fontWeight: 'bold',
          }}>
          Reward: {coinReward} Trail Tokens
        </Text>
      </>
    );
  };

  return user && userSubscription ? (
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
        }}></ImageBackground>

      <View style={{marginTop: 10, padding: 5}}>
        <Text
          style={
            trailDifficulty === 'Short'
              ? styles.TrailEasy
              : trailDifficulty === 'Moderate'
              ? styles.TrailModerate
              : styles.TrailHard
          }>
          {trailDifficulty}
        </Text>
        <Text style={styles.TrailName}>{trail.trailName}</Text>
        <Text style={styles.TrailPark}>{park.parkName} Park</Text>
        <Text style={styles.TrailDistance}>
          Distance: {trail.trailDistance} mi - Est{' '}
          {(trail.trailDistance / 2).toFixed()} hr.
        </Text>
        {renderCoinReward()}
        <View style={{position: 'relative'}}>
          <Pressable
            style={{
              backgroundColor:
                user.trailId == trail.id ? 'grey' : 'rgb(7,254,213)',
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
            disabled={user.trailId == trail.id}>
            <Text
              style={{
                color: 'rgb(31,33,35)',
                fontWeight: 'bold',
                fontSize: 16,
                textAlign: 'center',
              }}>
              {user.trailId == trail.id ? 'In Progress' : 'Start Now'}
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
  ({user, trail}) => ({
    user: user.observe(),
    completedHikes: user.completedHikes.observe(),
    trail: trail.observe(),
    park: trail.park.observe(),

    // Shortcut syntax for `post.comments.observe()`
  })
);

const EnhancedFreeTrailCard = enhance(FreeTrailCard);
export default EnhancedFreeTrailCard;

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
