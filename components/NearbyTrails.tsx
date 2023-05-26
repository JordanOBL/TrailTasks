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
  sectionTitle: string;
  trails: any
}
const NearbyTrails = ({sectionTitle, trails}: Props) => {
  const watermelonDatabase = useDatabase();
  const {user, setUser} = React.useContext(UserContext);
  const [showReplaceCurrentTrailModal, setShowReplaceCurrentTrailModal] =
    React.useState<boolean>(false);
  const [replacementCurrentTrailId, setReplacementCurrentTrailId] =
    React.useState<number | null>(null);
  
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
        <Text style={styles.H2}>{sectionTitle}</Text>
        <ScrollView horizontal>
          {trails ? (
            trails.map((trail: any) => (
             <TrailCard key={trail.id} setReplacementCurrentTrailId={setReplacementCurrentTrailId}
                setShowReplaceCurrentTrailModal={setShowReplaceCurrentTrailModal} trail={trail} />
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
