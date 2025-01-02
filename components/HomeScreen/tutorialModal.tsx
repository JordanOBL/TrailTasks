import {Button, Modal, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';

// @ts-ignore
const TutorialModal = ({visible, onClose}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const tutorialSteps = [
    {
      title: 'Welcome to Trail Tasks',
      description:
        'The app that empowers you to be productive while enjoying the outdoors.',
    },
    {
      title: 'Basecamp Homescreen',
      description:
        'View your current rank, current trail, and events. Everything offered can be reached from this screen!'
    },
    {
      title: 'Explore Screen',
      description:
        'Explore, Start, Unlock, and Add new trails to your trail queue.',
    },
    {
      title: 'Session Timer',
      description:
        'Plan and Begin your Pomodoro Sessions to gain Trail Tokens, Miles, and Achievements all while staying focused and productive.',
    },
    {
      title: 'Achievements',
      description:
        'Earn rewards and recognition for exploring new trails, gaining more miles, completing hiking session, and much more!',
    },
    {
      title: 'Rank Up',
      description:
        'Climb the leaderboard by accumulating more miles and achieving new hiking milestones.',
    },
    {
      title: 'Stats Screen',
      description:
        'Monitor your progress and performance with insightful metrics and analytics.',
    },
    {
      title: 'Leaderboards',
      description:
        'Compete with fellow hikers and see where you stand among the trail community.',
    },
  ];

  const handleNextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose(); // Close the modal when the tutorial is completed
    }
  };

  return (
    <Modal testID="tutorial-modal" visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.stepText}>
            {tutorialSteps[currentStep].title}
          </Text><Text style={styles.stepText}>
            {currentStep + 1} / {tutorialSteps.length}
        </Text>
          <Text style={styles.stepText}>
            {tutorialSteps[currentStep].description}
          </Text>
          <Button
            title={currentStep === tutorialSteps.length - 1 ? "Finish" : "Next"}
            onPress={handleNextStep}
            color="rgb(41,184,169)"
          />
        </View>
        
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Sem', description:t'ransparent background
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1, // Border width
    borderColor: 'rgba(7, 254, 213, .8)', // Border color
    padding: 20,
    width: '80%',
    alignItems: 'center',
    
  },
  stepText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',// Dark text color
    fontWeight: 'bold',
  },
});


export default TutorialModal;
