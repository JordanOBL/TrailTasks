import {
  Achievement,
  Completed_Hike,
  Queued_Trail,
  Trail,
  User,
  User_Session,
} from '../../watermelon/models';
import {
  updateSession,
  endSession,
  pauseSession,
  resumeSession,
  shortBreak,
  skipBreak,
} from '../../helpers/Timer/timerFlow';
import {Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import ActiveSessionBackpack from './ActiveSessionBackpack';
import {achievementManagerInstance} from '../../helpers/Achievements/AchievementManager';
import {AchievementsWithCompletion} from '../../types/achievements';
import EnhancedDistanceProgressBar from '../DistanceProgressBar';
import {SessionDetails} from '../../types/session';
import formatTime from '../../helpers/formatTime';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import withObservables from '@nozbe/with-observables';
import SessionTimer from "../Timer/SessionTimer";
import NextHundredthMileSeconds from '../../helpers/Timer/nextHundredthMileSeconds.ts';

interface Props {
  sessionDetails: SessionDetails;
  setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
  timer: Timer;
  setTimer: React.Dispatch<React.SetStateAction<Timer>>;
  userSession: User_Session;
  user: User;
  currentTrail: Trail;
  queuedTrails: Queued_Trail[];
  completedHikes: Completed_Hike[];
  achievementsWithCompletion: AchievementsWithCompletion[];
  currentSessionCategory: string;
}
const ActiveSession = ({
  setSessionDetails,
  sessionDetails,
  timer, 
  setTimer,
  userSession,
  user,
  currentTrail,
  queuedTrails,
  completedHikes,
  achievementsWithCompletion,
  currentSessionCategory,
}: Props) => {

  const watermelonDatabase = useDatabase();
  
  const [earnedAchievements, setEarnedAchievements] = useState<Achievement[]>(
    []
  );
  const [completedTrails, setCompletedTrails] = useState<Trail[]>([]);

  const onAchievementEarned = useCallback((achievements: Achievement[]) => {
    setEarnedAchievements((prevAchievements) => [
      ...prevAchievements,
      ...achievements,
    ]);
  }, []);

  const onCompletedTrail = useCallback((trail: Trail, reward: number) => {
    setCompletedTrails((prevCompletedTrails) => [
      ...prevCompletedTrails,
      trail,
    ]);
    setSessionDetails((prevSessionDetails) => ({
      ...prevSessionDetails,
      trailTokensEarned: prevSessionDetails.trailTokensEarned + reward,
    }))
  }, []);


const sessionUpdateFrequency = useMemo(() => {
  return NextHundredthMileSeconds(timer.pace);
}, [timer.pace]);

const notJustStarted = useMemo(() => {
  return (
    (timer.time < timer.initialPomodoroTime)
    
  );
}, [timer.time, timer.isBreak, timer.initialPomodoroTime, timer.initialShortBreakTime, timer.initialLongBreakTime]);

const canIncreaseDistance = useMemo(() => {
  return notJustStarted && timer.startTime !== null && !timer.isPaused && !timer.isBreak;
}, [notJustStarted, timer.startTime, timer.isPaused, timer.isBreak]);

useEffect(() => {
  let intervalId: NodeJS.Timeout | null = null;

  if (canIncreaseDistance) {
    intervalId = setInterval(() => {
      updateSession({
        watermelonDatabase,
        user,
        userSession,
        completedHikes,
        queuedTrails,
        currentTrail,
        setSessionDetails,
        sessionDetails,
        timer,
        setTimer,
        achievementsWithCompletion,
        onAchievementEarned,
        onCompletedTrail,
      });
    }, sessionUpdateFrequency * 1000);
  }

  // Cleanup on component unmount or dependencies change
  return () => {
    if (intervalId !== null) {
      clearInterval(intervalId);
    }
  };
}, [
  canIncreaseDistance,
  sessionUpdateFrequency,
]);
  const checkUserSessionAchievements = async () => {
    const results = await achievementManagerInstance.checkUserSessionAchievements(
      user,
      sessionDetails,
      currentSessionCategory,
      achievementsWithCompletion
    );
    if (results) {
      onAchievementEarned(results);
    }
  };

  useEffect(() => {
    if (
      user &&
        sessionDetails &&
        currentSessionCategory &&
        achievementsWithCompletion
    ) {
      checkUserSessionAchievements();
    }
  }, [achievementsWithCompletion]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ paddingBottom: 80 }}>
        <SessionTimer
          timer={timer}
          setTimer={setTimer}
          minimumPace={sessionDetails.minimumPace}
          maximumPace={sessionDetails.maximumPace}
          paceIncreaseInterval={sessionDetails.paceIncreaseInterval}
          paceIncreaseValue={sessionDetails.paceIncreaseValue}
        /> 
          <View style={styles.trailNameContainer}>
            <Text style={styles.trailName}>{currentTrail.trailName}</Text>
            <EnhancedDistanceProgressBar
            timer={timer}
              sessionDetails={sessionDetails}
              pace={sessionDetails.pace}
              user={user}
              trail={currentTrail}
            />
          </View>
        <ActiveSessionBackpack sessionDetails={sessionDetails} user={user}/>
          {/* Unified background for the entire stats section */}
          <View style={styles.statsContainer}>
            <View style={styles.statsGrid}>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Sets</Text>
                <Text style={styles.infoValue}>
                  {timer.currentSet} / {timer.sets}
                </Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Strikes</Text>
                <Text style={[styles.infoValue]}>
                  {sessionDetails.strikes}
                </Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Pace</Text>
                <Text style={styles.infoValue}>{timer.pace} mph</Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Tokens</Text>
                <Text style={styles.infoValue}>
                  {sessionDetails.trailTokensEarned}
                </Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Achievements</Text>
                <Text style={[styles.infoValue]}>
                  {earnedAchievements.length}
                </Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Completed</Text>
                <Text style={styles.infoValue}>{completedTrails.length}</Text>
              </View>
            </View>
          </View>
      </ScrollView>
      <View style={styles.buttonsContainer}>
        <Pressable
          onPress={() => endSession({user,timer, setTimer, setSessionDetails, sessionDetails})}
          style={[styles.button, styles.endSessionButton]}>
          <Text style={styles.buttonText}>End Session</Text>
        </Pressable>
        {timer.isBreak && (
            <Pressable
              onPress={() => skipBreak({ timer, setTimer })}
              style={[styles.button, styles.skipBreakButton]}>
              <Text style={styles.buttonText}>Skip Break</Text>
            </Pressable>
          )}
        <Pressable
          onPress={() =>
            timer.isPaused
              ? resumeSession(setTimer)
              : pauseSession(timer,setTimer, sessionDetails, setSessionDetails)
          }
          style={[styles.button, styles.pauseResumeButton]}>
          <Text style={styles.buttonText}>
            {timer.isPaused ? 'Resume' : 'Pause'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 20,
  },

  trailNameContainer: {
    marginBottom: 10,
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
  },
  trailName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  statsTitle: {
    alignSelf: 'center',
  },
  statsContainer: {
    backgroundColor: 'rgba(255,255,255,.1)', // Dark background for the whole stats section
    padding: 15,
    borderRadius: 15, // Rounded corners for a modern look
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoBox: {
    width: '30%', // Adjust to fit 3 columns
    marginBottom: 20,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#aaa', // Light gray for label text
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff', // White for value text
  },
  completedTrailsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Semi-transparent white background
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
  },
  title: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  achievementItem: {
    color: 'white',
    marginBottom: 5,
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyAchievements: {
    color: 'white',
    fontSize: 14,
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding:0,
    alignSelf: 'center',
  },
  button: {
    flex: 1, // Equal flex to ensure same size buttons
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
  },
  endSessionButton: {
    backgroundColor: 'red',
    marginRight: 5, // Add margin between buttons
  },
  skipBreakButton: {
    backgroundColor: 'blue',
    marginHorizontal: 5, // Add margin between buttons
  },
  pauseResumeButton: {
    backgroundColor: 'green',
    marginLeft: 5, // Add margin between buttons
  },
});

const enhance = withObservables(
  [
    'user',
    'currentTrail',
    'completedHikes',
    'queuedTrails',

    'userSession',
    'usersAchievements',
  ],
  ({user, userSession}) => ({
    user: user.observe(),
    currentTrail: user.trail.observe(),
    completedHikes: user.completedHikes.observe(),
    queuedTrails: user.queuedTrails.observe(),

    userSession,
    userAchievements: user.usersAchievements.observe(),
  })
);

const EnhancedActiveSession = enhance(ActiveSession);
export default EnhancedActiveSession;
