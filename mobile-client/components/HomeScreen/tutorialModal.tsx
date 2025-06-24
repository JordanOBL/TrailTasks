import React, { useState } from 'react';
import {
  Button,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeProvider';

const TutorialModal = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { theme } = useTheme();

  const tutorialSteps = [
    {
      title: 'Welcome to Trail Tasks',
      description: 'The app that empowers you to be productive while enjoying the outdoors.',
    },
    {
      title: 'Basecamp Homescreen',
      description: 'View your current rank, current trail, and events. Everything offered can be reached from this screen!',
    },
    {
      title: 'Explore Screen',
      description: 'Explore, Start, Unlock, and Add new trails to your trail queue.',
    },
    {
      title: 'Session Timer',
      description: 'Plan and Begin your Pomodoro Sessions to gain Trail Tokens, Miles, and Achievements all while staying focused and productive.',
    },
    {
      title: 'Achievements',
      description: 'Earn rewards and recognition for exploring new trails, gaining more miles, completing hiking session, and much more!',
    },
    {
      title: 'Rank Up',
      description: 'Climb the leaderboard by accumulating more miles and achieving new hiking milestones.',
    },
    {
      title: 'Stats Screen',
      description: 'Monitor your progress and performance with insightful metrics and analytics.',
    },
    {
      title: 'Leaderboards',
      description: 'Compete with fellow hikers and see where you stand among the trail community.',
    },
  ];

  const handleNextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const styles = getStyles(theme);

  return (
    <SafeAreaProvider testID="tutorial-modal">
      <SafeAreaView style={styles.modalContainer}>
        <Modal animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.stepText}>
                {tutorialSteps[currentStep].title}
              </Text>
              <Text style={styles.stepText}>
                {currentStep + 1} / {tutorialSteps.length}
              </Text>
              <Text style={styles.stepText}>
                {tutorialSteps[currentStep].description}
              </Text>
              <Button
                title={currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
                onPress={handleNextStep}
                color={theme.button}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default TutorialModal;

const getStyles = (theme) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.modalBackground,
    },
    modalContent: {
      backgroundColor: theme.modalCard,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.button,
      padding: 20,
      width: '80%',
      alignItems: 'center',
    },
    stepText: {
      fontSize: 18,
      textAlign: 'center',
      marginBottom: 20,
      color: theme.modalCardText,
      fontWeight: 'bold',
    },
  });

