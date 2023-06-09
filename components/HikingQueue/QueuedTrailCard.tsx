import {Pressable, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import withObservables from '@nozbe/with-observables';
import {User, Queued_Trail, Trail, Park} from '../../watermelon/models';

interface Props {
  user: User;
  queuedTrail: Queued_Trail;
  trail: Trail;
}
const QueuedTrailCard = ({user, queuedTrail, trail}: Props) => {
  console.log(queuedTrail);
  return (
    <View style={styles.Container}>
      <View>
        <Text style={[styles.TrailName, {color: 'white'}]}>
          {trail.trailName}
        </Text>
        {/* <Text style={{color: 'white', fontSize: 18}}>
          {park.parkName} {park.parkType} Park
        </Text> */}
        <Text style={{color: 'white', fontSize: 16}}>
          {trail.trailDistance} miles
        </Text>
      </View>
      <Pressable
        onPress={async () => await queuedTrail.deleteTrailFromQueue()}
        style={{
          backgroundColor: 'red',
          padding: 10,
          borderRadius: 10,
          height: 45,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>
          Remove
        </Text>
      </Pressable>
    </View>
  );
};

const enhance = withObservables(
  ['user', 'queuedTrail'],
  ({user, queuedTrail}) => ({
    user: user.observe(),
    trail: queuedTrail.trail.observe(),

    // Shortcut syntax for `post.comments.observe()`
  })
);

const EnhancedQueuedTrailCard = enhance(QueuedTrailCard);
export default EnhancedQueuedTrailCard;
//export default TrailQueueCard

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
