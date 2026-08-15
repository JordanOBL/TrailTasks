import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import { darkTheme, lightTheme } from '../theme';

import React from 'react';
import {Rewards} from '../Screens/SessionScreen'
import { SessionSnapshot } from '../sessionEngine/sessionEngine';
import formatTime from '../helpers/formatTime';
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '../contexts/ThemeProvider';

interface Props {
  rewards: Rewards
  snapshot: SessionSnapshot | null;
  resetSession: () => void;
}

const SoloResultsScreen = ({rewards, snapshot, resetSession}: Props ) => { 
  console.log("Rendering SoloResultsScreen with rewards:", rewards, "and snapshot:", snapshot); 
  const { theme } = useTheme();
  const styles = getStyles(theme);

  if(!rewards || !snapshot){
   return (
      <View>
        <Text> Loading Session Rewards...</Text>
      </View>
    ) 
  }
  
  return (
    <View style={styles.container} testID="session-results-screen">
      <Text style={styles.title}>Session Results</Text>

      <View style={styles.sessionSummary}>
       <Text style={styles.summaryText}>Total Time: <Text testID="total-distance-text" style={styles.value}>{formatTime(snapshot?.totalElapsedSec)}</Text></Text> 
        <Text style={styles.summaryText}>Total Distance: <Text testID="total-distance-text" style={styles.value}>{snapshot?.totalDistanceMiles} miles</Text></Text>
        <Text style={styles.summaryText}>Sets Completed: <Text testID="sets-completed-text" style={styles.value}>{snapshot?.completedSets}</Text></Text>
        
      </View>

      <Text style={styles.title}>Rewards</Text>
      <View style={styles.sessionSummary}>
        <Text style={styles.summaryText}>Trail Tokens: <Text testID="trail-tokens-earned-text" style={styles.value}>{rewards.trailRewards}</Text></Text>
        <Text style={styles.summaryText} testID="session-tokens-earned-text">Time Tokens: <Text style={styles.value}>{rewards.timeRewards}</Text></Text>
        <Text style={styles.summaryText}>Total Tokens Earned: <Text testID="total-tokens-earned-text" style={styles.value}>{rewards.totalTokenRewards}</Text></Text>
      </View>

      {/* Wild xp rewards */}

      <TouchableOpacity style={styles.returnButton} testID="return-to-lobby-button" onPress={() => resetSession()}>
        <Text style={styles.returnButtonText}>Return to Lobby</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SoloResultsScreen;

const getStyles = (theme: typeof lightTheme | typeof darkTheme) => { 
  return StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.background, // Light grey background for contrast
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.text, // Dark teal color
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
    backgroundColor: theme.button, // Dark teal button color
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
    color: theme.buttonText, // White text for contrast
  },
})
}

