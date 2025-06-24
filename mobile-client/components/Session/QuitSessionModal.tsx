import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const QuitSessionModal = ({ isVisible, continueSession, sessionDetails, showResultsScreen}) => {
  const unfinishedSets = sessionDetails.sets - sessionDetails.completedSets
  
  return (
    <Modal transparent={true} visible={isVisible} animationType="fade" testID="quit-session-modal">
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.titleText}>Quit Session Early!?</Text>

          {( sessionDetails.completedSets < 3 ) && <View style={styles.messageContainer}>
            <Text style={styles.messageText}>You have {unfinishedSets} left to recieve session rewards. </Text>
                    </View> }
          <TouchableOpacity style={styles.buttonEndSession} testID="confirm-quit-button" onPress={showResultsScreen}>
            <Text style={styles.buttonText}>Quit Session</Text>
          </TouchableOpacity>

          <TouchableOpacity testID="confirm-cancel-button" style={styles.buttonNewSet} onPress={continueSession}>
            <Text  style={styles.buttonText}>Cancel (Resume)</Text>
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

export default QuitSessionModal;
