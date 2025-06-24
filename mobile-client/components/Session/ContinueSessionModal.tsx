import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ContinueSessionModal = ({ isVisible, showResultsScreen, onAddSession, onAddSet, focusTime }) => {
  const extraSetReward = Math.ceil( (focusTime/60) * .25 )
  const extraSessionReward = Math.ceil( ( ( focusTime/60 ) * 1.5  ) + (focusTime/60))
  return (
    <Modal transparent={true} visible={isVisible} animationType="fade">
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.titleText}>Great Job Finishing Your Sets!</Text>

          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>You've completed all sets.</Text>
            <Text style={styles.messageText}>What would you like to do next?</Text>
          </View>

          <TouchableOpacity style={styles.buttonOneMore} onPress={onAddSet}>
            <Text style={styles.buttonText}>{`Hike Extra Set: ${focusTime/60} Mintues`}</Text>
            <Text style={styles.buttonRewardText}>{` Extra Tokens: +${extraSetReward} `} </Text>
          </TouchableOpacity> 

          <TouchableOpacity style={styles.buttonNewSet} onPress={onAddSession}>
            <Text style={styles.buttonText}>{`Hike Extra Session: ${( focusTime/60 ) * 3} Mintues`}</Text>
            <Text style={styles.buttonRewardText}>{ `Extra Tokens: +${extraSessionReward}` } </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonEndSession} onPress={showResultsScreen}>
            <Text style={styles.buttonText}>End Session</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00796B', // Teal color
    marginBottom: 20,
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonOneMore: {
    backgroundColor: '#009688', // Lighter teal color
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonNewSet: {
    backgroundColor: '#00796B', // Darker teal color
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonEndSession: {
    backgroundColor: '#004D40', // Darkest teal color
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRewardText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

 
});

export default ContinueSessionModal;
