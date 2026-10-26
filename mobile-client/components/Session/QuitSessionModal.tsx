import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import React from "react";
import { SessionSnapshot } from "../../sessionEngine/sessionEngine";

interface Props {
  isVisible: boolean;
  sessionDetails: SessionSnapshot;
  cancel: () => void;
  quit: () => void;
}

const QuitSessionModal = ({ isVisible, sessionDetails, cancel, quit }: Props) => {
  const unfinishedSets = sessionDetails.totalSets - sessionDetails.completedSets;

  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={cancel}>
      <SafeAreaView style={styles.modalBackground} testID="quit-session-modal">
        <ScrollView style={styles.modalContainer} contentContainerStyle={styles.modalContent}>
        <Text style={styles.titleText}>Quit Session Early!?</Text>

        {sessionDetails.completedSets < 3 && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>
              You have {unfinishedSets} sets left to recieve session rewards.{" "}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.buttonEndSession}
          testID="confirm-quit-button"
          accessibilityRole="button"
          accessibilityLabel="Confirm quit session"
          onPress={() => quit()}>
          <Text style={styles.buttonText}>Quit Session</Text>
        </TouchableOpacity>

        <TouchableOpacity
          testID="confirm-cancel-button"
          accessibilityRole="button"
          accessibilityLabel="Cancel and resume session"
          style={styles.buttonNewSet}
          onPress={() => cancel()}>
          <Text style={styles.buttonText}>Cancel (Resume)</Text>
        </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    width: "100%",
    maxWidth: 420,
    maxHeight: "90%",
    flexGrow: 0,
  },
  modalContent: {
    padding: 20,
    alignItems: "center",
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00796B", // Teal color
    marginBottom: 20,
    textAlign: "center",
  },
  messageContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  messageText: {
    fontSize: 16,
    color: "black",
    textAlign: "center",
    marginBottom: 10,
  },
  buttonOneMore: {
    backgroundColor: "#009688", // Lighter teal color
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonNewSet: {
    backgroundColor: "#00796B", // Darker teal color
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonEndSession: {
    backgroundColor: "#004D40", // Darkest teal color
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonRewardText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default QuitSessionModal;
