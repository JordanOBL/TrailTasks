import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

const SoloResultsScreen = ({ sessionDetails, user,timer, endSession }) => {

  return (
    <View style={styles.container} testID="session-results-screen">
      <Text style={styles.title}>Session Results</Text>

      <View style={styles.sessionSummary}>
        <Text style={styles.summaryText}>Total Distance: <Text testID="total-distance-text" style={styles.value}>{sessionDetails.totalDistanceHiked.toFixed(2)} miles</Text></Text>
        <Text style={styles.summaryText}>Sets Completed: <Text testID="sets-completed-text" style={styles.value}>{timer.completedSets}</Text></Text>
      </View>

      <Text style={styles.title}>Rewards</Text>
      <View style={styles.sessionSummary}>
        <Text style={styles.summaryText}>Trail Tokens: <Text testID="trail-tokens-earned-text" style={styles.value}>{sessionDetails.trailTokensEarned}</Text></Text>
        <Text style={styles.summaryText} testID="session-tokens-earned-text">Session Tokens: <Text style={styles.value}>{sessionDetails.sessionTokensEarned}</Text></Text>
      </View>

      <TouchableOpacity style={styles.returnButton} testID="return-to-lobby-button" onPress={endSession}>
        <Text style={styles.returnButtonText}>Return to Lobby</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SoloResultsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa', // Light grey background for contrast
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#003333', // Dark teal color
    textAlign: 'center',
    marginBottom: 25,
  },
  sessionSummary: {
    backgroundColor: '#e6f2f0', // Light teal background
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  summaryText: {
    fontSize: 16,
    color: '#003333', // Dark teal color
    marginBottom: 5,
  },
  value: {
    fontWeight: 'bold',
    color: '#006666', // Slightly lighter teal for emphasis
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003333', // Dark teal color
    textAlign: 'center',
    marginBottom: 15,
  },

   returnButton: {
    backgroundColor: '#003333', // Dark teal button color
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 8,
  },
  returnButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff', // White text for contrast
  },
});

