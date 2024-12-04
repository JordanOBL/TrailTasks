import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

const ResultsScreen = ({ session,user,timer,  hikers, handleReturnToLobby }) => {
  let totalDistance = 0;

  Object.values(hikers).forEach((hiker) => {
    totalDistance += hiker.distance
  })
  // Sort hikers by distance hiked in descending order
  const sortedHikers = Object.values(hikers).sort((a, b) => { 
    
    return b.distance - a.distance
  });
 console.log("Session", session);
  console.log("Timer", timer);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Session Results</Text>

      <View style={styles.sessionSummary}>
        <Text style={styles.summaryText}>Total Distance: <Text style={styles.value}>{totalDistance.toFixed(2)} miles</Text></Text>
        <Text style={styles.summaryText}>Penalty Distance: <Text style={styles.value}>{session.distance.toFixed(2)} miles</Text></Text>
        <Text style={styles.summaryText}>Highest Completed Level: <Text style={styles.value}>{session.highestCompletedLevel}</Text></Text>
        <Text style={styles.summaryText}>Sets Completed: <Text style={styles.value}>{timer.completedSets}</Text></Text>
      </View>

      <Text style={styles.subtitle}>Hiker Rankings</Text>
      <FlatList
        data={sortedHikers}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={[ styles.hikerRow, { backgroundColor: index == 0 ? 'rgba(255, 215, 0, 1)' : item.id == user.id ? 'rgba(0,255,255,.5)' : '' } ]}>
            <Text style={styles.rank}>{index + 1}.</Text>
            <Text style={styles.hikerName}>{item.username}</Text>
            <Text style={styles.hikerDistance}>{item.distance.toFixed(2)} miles</Text>
            <Text style={styles.hikerPauses}>{item.strikes} Pauses</Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.returnButton} onPress={handleReturnToLobby}>
        <Text style={styles.returnButtonText}>Return to Lobby</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ResultsScreen;

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
  hikerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff', // White for hiker rows
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
  },
  rank: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333', // Neutral dark color for rank
    flex: 0.5,
  },
  hikerName: {
    fontSize: 16,
    color: '#003333', // Dark teal
    flex: 1.5,
  },
  hikerDistance: {
    fontSize: 16,
    fontWeight: '500',
    color: '#006666', // Light teal for emphasis
    textAlign: 'right',
    flex: 1,
  },
  hikerPauses: {
    fontSize: 16,
    color: '#808080', // Grey for lesser emphasis
    textAlign: 'right',
    flex: 1,
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

