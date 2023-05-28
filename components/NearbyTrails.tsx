import {
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  ImageBackground,
} from 'react-native';
import * as React from 'react';
import {useDatabase} from '@nozbe/watermelondb/hooks';

import {
  onAddToQueueClick,
  onDeleteFromQueueClick,
  replaceCurrentTrail,
  startNowClick,
} from '../helpers/HikingQueue/QueueHelpers';
import getTrails from '../helpers/Trails/getTrails';
import { UserContext } from '../App';
import TrailCard from './Trails/TrailCard';
interface Props {
  trails: any
  user: any
}
const NearbyTrails = ({trails, user}: Props) => {
  const watermelonDatabase = useDatabase();
  const {userId, setUserId} = React.useContext(UserContext);
  const [showReplaceCurrentTrailModal, setShowReplaceCurrentTrailModal] =
    React.useState<boolean>(false);
  const [replacementCurrentTrailId, setReplacementCurrentTrailId] =
    React.useState<number | string | null>(null);
  
  const filterTrails = (title: string, trailsArr: any): any => {
    if (title === 'Short Trails') {
      return trailsArr.filter(
        (trail: any) => trail.trail_difficulty === 'short'
      );
    } else if (title === 'Moderate Trails') {
      return trailsArr.filter(
        (trail: any) => trail.trail_difficulty === 'moderate'
      );
    } else if (title === 'Long Trails') {
      return trailsArr.filter(
        (trail: any) => trail.trail_difficulty === 'long'
      );
    } else return trails;
  };
  
  
  return showReplaceCurrentTrailModal ? (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showReplaceCurrentTrailModal}
      onRequestClose={() => {
        setShowReplaceCurrentTrailModal(!showReplaceCurrentTrailModal);
      }}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>
            Are you sure you want to replace your current trail? (Current Trail
            progress will be RESET, but total user miles hiked will be saved.)
          </Text>
          <Pressable
            style={[styles.button, styles.buttonCancel]}
            onPress={() => {
              setShowReplaceCurrentTrailModal((prev) => !prev);
              setReplacementCurrentTrailId(null);
            }}>
            <Text style={styles.textStyle}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.buttonExit]}
            onPress={() =>
              replaceCurrentTrail({
                watermelonDatabase,
                user,
                replacementCurrentTrailId,
                setReplacementCurrentTrailId,
                setShowReplaceCurrentTrailModal,
              })
            }>
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
        <Text style={styles.H2}>All Trails</Text>
        <ScrollView horizontal>
          {trails && user ? (
            trails.map((trail: any) => (
              <TrailCard
                user={user}
                key={trail.id}
                setReplacementCurrentTrailId={setReplacementCurrentTrailId}
                setShowReplaceCurrentTrailModal={
                  setShowReplaceCurrentTrailModal
                }
                trail={trail}
              />
            ))
          ) : (
            <Text>Loading...</Text>
          )}
        </ScrollView>
        <Text style={styles.H2}>Short Trails</Text>
        <ScrollView horizontal>
          {trails && user ? (
            filterTrails('Short Trails', trails).map((trail: any) => (
              <TrailCard
                user={user}
                key={trail.id}
                setReplacementCurrentTrailId={setReplacementCurrentTrailId}
                setShowReplaceCurrentTrailModal={
                  setShowReplaceCurrentTrailModal
                }
                trail={trail}
              />
            ))
          ) : (
            <Text>Loading...</Text>
          )}
        </ScrollView>
        <Text style={styles.H2}>Moderate Trails</Text>
        <ScrollView horizontal>
          {trails && user ? (
            filterTrails('Moderate Trails', trails).map((trail: any) => (
              <TrailCard
                user={user}
                key={trail.id}
                setReplacementCurrentTrailId={setReplacementCurrentTrailId}
                setShowReplaceCurrentTrailModal={
                  setShowReplaceCurrentTrailModal
                }
                trail={trail}
              />
            ))
          ) : (
            <Text>Loading...</Text>
          )}
        </ScrollView>
        <Text style={styles.H2}>Long Trails</Text>
        <ScrollView horizontal>
          {trails && user ? (
            filterTrails('Long Trails', trails).map((trail: any) => (
              <TrailCard
                user={user}
                key={trail.id}
                setReplacementCurrentTrailId={setReplacementCurrentTrailId}
                setShowReplaceCurrentTrailModal={
                  setShowReplaceCurrentTrailModal
                }
                trail={trail}
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

export default NearbyTrails;

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
