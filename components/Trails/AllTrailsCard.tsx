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
import {useEffect, useState} from 'react';

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
  subscriptionTrailsCache: any;
  onBuyTrail: (trail: any) => void;
}
const AllTrailsCard = ({
  user,
  trail,
  completedCache,
  setReplacementTrailId,
  setShowReplaceTrailModal,
  park,
  freeTrailsCache,
  userSubscription,
  userPurchasedTrailsCache,
  subscriptionTrailsCache,
  onBuyTrail,
}: Props) => {
  const [isFreeTrail, setIsFreeTrail] = useState(false);
  const [isActiveSubscription, setIsActiveSubscription] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isSubscribersOnly, setIsSubscribersOnly] = useState(false);
  const [trailDifficulty, setTrailDifficulty] = useState('');

  useEffect(() => {
    setIsFreeTrail(freeTrailsCache[trail.id] ?? false);
    setIsActiveSubscription(userSubscription.isActive === true);
    setIsCompleted(completedCache[trail.id] ?? false);
    setIsPurchased(userPurchasedTrailsCache[trail.id] ?? false);
    if (Object.keys(subscriptionTrailsCache).length > 0) {
      setIsSubscribersOnly(trail.isSubscribersOnly);
    }

    const calculateTrailDifficulty = () => {
      if (trail.trailDistance > 20) {
        setTrailDifficulty('Insane');
      } else if (trail.trailDistance > 10) {
        setTrailDifficulty('Long');
      } else if (trail.trailDistance > 5) {
        setTrailDifficulty('Moderate');
      } else {
        setTrailDifficulty('Short');
      }
    };

    calculateTrailDifficulty();
  }, [
    freeTrailsCache,
    trail.id,
    userSubscription.isActive,
    completedCache,
    userPurchasedTrailsCache,
    subscriptionTrailsCache,
    trail.trailDistance,
  ]);

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

  const handleBuyTrail = async () => {
    try {
      // Call the onBuyTrail function
      await onBuyTrail(trail);
    } catch (error) {
      console.log('Error buying trail:', error);
    }
  };

  const handleStartTrail = async () => {
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
  };

  const handleTrailActionButton = async () => {
    try {
      if (user.trailId == trail.id) return;
      else if (isFreeTrail || isPurchased) {
        console.debug('clicking', trail);
        await handleStartTrail();
        return;
      } else if (!isActiveSubscription && isSubscribersOnly) return;
      else {
        await handleBuyTrail();
        return;
      }
    } catch (err) {
      console.log('error in handle trail action click ', err);
    }
  };

  let buttonText;

  if (user.trailId === trail.id) {
    buttonText = 'In Progress';
  } else if (isFreeTrail || isPurchased) {
    buttonText = 'Start Now';
  } else if (isSubscribersOnly && !isActiveSubscription) {
    buttonText = 'Unlock With Subscription';
  } else {
    if (trail.trailDistance < 5) {
      buttonText = 'Buy 5';
    } else if (trail.trailDistance < 10) {
      buttonText = 'Buy 35';
    } else if (trail.trailDistance < 20) {
      buttonText = 'Buy 50';
    } else {
      buttonText = 'Buy 100';
    }
  }
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
        }}>
        <Text
          style={
            completedCache && isCompleted
              ? {
                  position: 'absolute',
                  backgroundColor: 'rgb(41,184,169)',
                  top: 20,
                  width: 80,
                  textAlign: 'center',
                }
              : {}
          }>
          {completedCache && isCompleted ? (
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
                user.trailId === trail.id
                  ? 'grey'
                  : isFreeTrail || isPurchased
                  ? 'rgb(7,254,213)'
                  : isActiveSubscription
                  ? 'rgb(7,254,13)'
                  : isSubscribersOnly
                  ? 'grey'
                  : 'rgb(7,254,13)',
              width: '50%',
              borderRadius: 10,
              paddingVertical: 5,
              marginTop: 10,
            }}
            onPress={() => {
              handleTrailActionButton();
            }}
            disabled={user.trailId == trail.id}>
            <Text
              style={{
                color: 'rgb(31,33,35)',
                fontWeight: 'bold',
                fontSize: 16,
                textAlign: 'center',
              }}>
              {buttonText}
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

const EnhancedAllTrailsCard = enhance(AllTrailsCard);
export default EnhancedAllTrailsCard;

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
