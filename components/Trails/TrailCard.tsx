import {ImageBackground, Pressable, StyleSheet, Text, View} from 'react-native';
import React, {useContext} from 'react';
import {
  onDeleteFromQueueClick,
  onAddToQueueClick,
} from '../../helpers/HikingQueue/QueueHelpers';
import {formatDateTime} from '../../helpers/formatDateTime';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import withObservables from '@nozbe/with-observables';
import CapitalizeWord from '../../helpers/capitalizeWord';
interface Props {
  trail: any;
  setReplacementTrailId: any;
  setShowReplaceTrailModal: any;
  user: any;
  queuedCache: any,
  completedTrailsCache: any,
  park: any
}
const TrailCard = ({
  user,
  trail,
  completedTrailsCache,
  queuedCache,
  setReplacementTrailId,
  setShowReplaceTrailModal,
  park
}: Props) => {
 

  return user ? (
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
            completedTrailsCache.get(trail.id)
              ? {
                  position: 'absolute',
                  backgroundColor: 'rgb(41,184,169)',
                  top: 20,
                  width: 80,
                  textAlign: 'center',
                }
              : {}
          }>
          {completedTrailsCache.get(trail.id) ? (
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
            {queuedCache.get(trail.id) ? (
              <Pressable
                onPress={() =>
                  onDeleteFromQueueClick({
                    user_id: user.id,
                    selected_trailId: trail.id,
                    watermelonDatabase: watermelonDatabase,
                  })
                }>
                <Text
                  style={[
                    styles.QueueButtons,
                    {
                      color: !queuedCache.get(trail.id)
                        ? 'rgb(7,254,213)'
                        : 'red',
                    },
                  ]}>
                  -
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() =>
                  onAddToQueueClick({
                    user_id: user.id,
                    selected_trailId: trail.id,
                    date_added: formatDateTime(new Date()),
                    watermelonDatabase: watermelonDatabase,
                  })
                }>
                <Text
                  style={[
                    styles.QueueButtons,
                    {
                      color: !queuedCache.get(trail.id)
                        ? 'rgb(7,254,213)'
                        : 'red',
                    },
                  ]}>
                  +
                </Text>
              </Pressable>
            )}
          </Text>
          <Pressable
            style={{
              backgroundColor:
                user.trailId == trail.id ? 'gray' : 'rgb(7,254,213)',
              width: '50%',
              borderRadius: 10,
              paddingVertical: 5,
              marginTop: 10,
            }}
            onPress={async () => {
              try {
                if (user.trailId) {
                  setShowReplaceTrailModal(true);
                  setReplacementTrailId(trail.id)
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
  ['user', 'trail', 'park'],
  ({user, trail, park}) => ({
    user,
    completedHikes: user.completedHikes.observe(),
    hikingQueue: user.hikingQueue,
    trail,
    park: trail.park,

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
