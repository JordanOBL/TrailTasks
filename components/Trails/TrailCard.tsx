import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native'
import React, {useContext} from 'react'
import { onDeleteFromQueueClick, onAddToQueueClick, startNowClick } from '../../helpers/HikingQueue/QueueHelpers';
import { formatDateTime } from '../../helpers/formatDateTime';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import { UserContext } from '../../App';
import CapitalizeWord from '../../helpers/capitalizeWord';
interface Props {
  trail: any;
  setReplacementCurrentTrailId: any,
  setShowReplaceCurrentTrailModal:any
}
const TrailCard = ({
  trail,
  setReplacementCurrentTrailId,
  setShowReplaceCurrentTrailModal,
}: Props) => {
  const watermelonDatabase = useDatabase();
  //@ts-expect-error
  const {user, setUser} = useContext(UserContext);
  return (
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
          trail.trail_image_url
            ? {uri: trail.trail_image_url}
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
            trail?.completed
              ? {
                  position: 'absolute',
                  backgroundColor: 'rgb(41,184,169)',
                  top: 20,
                  width: 80,
                  textAlign: 'center',
                }
              : {}
          }>
          {trail?.completed ? (
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
            trail.trail_difficulty === 'short'
              ? styles.TrailEasy
              : trail.trail_difficulty === 'moderate'
              ? styles.TrailModerate
              : styles.TrailHard
          }>
          {CapitalizeWord(trail.trail_difficulty)}
        </Text>
        <Text style={styles.TrailName}>{trail.trail_name}</Text>
        <Text style={styles.TrailPark}>{trail.park_name} Park</Text>
        <Text style={styles.TrailDistance}>
          Distance: {trail.trail_distance} mi - Est{' '}
          {(trail.trail_distance / 2).toFixed()} hr.
        </Text>
        <View style={{position: 'relative'}}>
          <Text
            style={{
              position: 'absolute',
              right: 10,
              bottom: 90,
            }}>
            {/* {trail._raw.queued == 1 ? (
              <Pressable
                onPress={() =>
                  onDeleteFromQueueClick({
                    user_id: user._raw.id,
                    selected_trail_id: trail.id,
                    watermelonDatabase: watermelonDatabase,
                  })
                }>
                <Text
                  style={[
                    styles.QueueButtons,
                    {
                      color: !trail._raw.queued ? 'rgb(7,254,213)' : 'red',
                    },
                  ]}>
                  -
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() =>
                  onAddToQueueClick({
                    user_id: user._raw.id,
                    selected_trail_id: trail.id,
                    date_added: formatDateTime(new Date()),
                    watermelonDatabase: watermelonDatabase,
                  })
                }>
                <Text
                  style={[
                    styles.QueueButtons,
                    {
                      color: !trail._raw.queued ? 'rgb(7,254,213)' : 'red',
                    },
                  ]}>
                  +
                </Text>
              </Pressable>
            )} */}
          </Text>
          <Pressable
            style={{
              backgroundColor:
              user._raw.trail_id == trail.id ? 'gray' : 'rgb(7,254,213)',
              width: '50%',
              borderRadius: 10,
              paddingVertical: 5,
              marginTop: 10,
            }}
            onPress={() =>
              startNowClick({
                selected_trail_id: trail.id,
                current_trail_id: user._raw.trail_id,
                setUser: setUser,
                watermelonDatabase,
                user,
                setReplacementCurrentTrailId,
                setShowReplaceCurrentTrailModal,
              })
            }
            disabled={user._raw.trail_id == trail.id}>
            <Text
              style={{
                color: 'rgb(31,33,35)',
                fontWeight: 'bold',
                fontSize: 16,
                textAlign: 'center',
              }}>
              {user._raw.trail_id == trail.id
                ? 'In Progress'
                : 'Start Now'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default TrailCard

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
