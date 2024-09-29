import {
  Achievement,
  Completed_Hike,
  Queued_Trail,
  Trail,
  User,
  User_Session,
} from '../../watermelon/models';
import {
  Hike,
  endSession,
  pauseSession,
  resumeSession,
  shortBreak,
  skipBreak,
} from '../../helpers/Timer/timerFlow';
import {Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import TimerBackpack from './TimerBackpack';
import {achievementManagerInstance} from '../../helpers/Achievements/AchievementManager';
import {AchievementsWithCompletion} from '../../types/achievements';
import EnhancedDistanceProgressBar from '../DistanceProgressBar';
import {SessionDetails} from '../../types/session';
import formatCountdown from '../../helpers/Timer/formatCountdown';
import formatTime from '../../helpers/formatTime';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import withObservables from '@nozbe/with-observables';

interface Props {
  sessionDetails: SessionDetails;
  setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
  userSession: User_Session;
  user: User;
  currentTrail: Trail;
  queuedTrails: Queued_Trail[];
  completedHikes: Completed_Hike[];
  achievementsWithCompletion: AchievementsWithCompletion[];
  currentSessionCategory: string;
}
const SessionInfo = ({
  setSessionDetails,
  sessionDetails,
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

  const pomodoroCountdown = useMemo(
    () =>
      formatCountdown(
        sessionDetails.initialPomodoroTime,
        sessionDetails.elapsedPomodoroTime
      ),
    [sessionDetails.initialPomodoroTime, sessionDetails.elapsedPomodoroTime]
  );
  const shortBreakCountdown = useMemo(
    () =>
      formatCountdown(
        sessionDetails.initialShortBreakTime,
        sessionDetails.elapsedShortBreakTime
      ),
    [sessionDetails.initialShortBreakTime, sessionDetails.elapsedShortBreakTime]
  );
  const longBreakCountdown = useMemo(
    () =>
      formatCountdown(
        sessionDetails.initialLongBreakTime,
        sessionDetails.elapsedLongBreakTime
      ),
    [sessionDetails.initialLongBreakTime, sessionDetails.elapsedLongBreakTime]
  );

  const canHike =
    sessionDetails.elapsedPomodoroTime < sessionDetails.initialPomodoroTime;

  useEffect(() => {
    let intervalId: any;
    if (!sessionDetails.isPaused) {
      intervalId = setInterval(() => {
        Hike({
          watermelonDatabase,
          user,
          userSession,
          completedHikes,
          queuedTrails,
          currentTrail,
          setSessionDetails,
          sessionDetails,
          canHike,
          achievementsWithCompletion,
          onAchievementEarned,
          onCompletedTrail,
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [sessionDetails]);

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
        <View style={styles.timerContainer}>
          <Text
            style={[
              styles.timerText,
              (sessionDetails.isPaused || !canHike) && styles.pausedText,
            ]}>
            {sessionDetails.isPaused
              ? 'Paused'
              : canHike
                ? pomodoroCountdown
                : sessionDetails.currentSet < sessionDetails.sets ? shortBreakCountdown: longBreakCountdown}
          </Text>
          <View style={styles.trailNameContainer}>
            <Text style={styles.trailName}>{currentTrail.trailName}</Text>
            <EnhancedDistanceProgressBar
              sessionDetails={sessionDetails}
              pace={sessionDetails.pace}
              user={user}
              trail={currentTrail}
            />
          </View>
        <TimerBackpack sessionDetails={sessionDetails} user={user}/>
          {/* Unified background for the entire stats section */}
          <View style={styles.statsContainer}>
            <View style={styles.statsGrid}>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Sets</Text>
                <Text style={styles.infoValue}>
                  {sessionDetails.currentSet} / {sessionDetails.sets}
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
                <Text style={styles.infoValue}>{sessionDetails.pace} mph</Text>
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
        </View> 
      </ScrollView>
      <View style={styles.buttonsContainer}>
        <Pressable
          onPress={() => endSession({user, setSessionDetails, sessionDetails})}
          style={[styles.button, styles.endSessionButton]}>
          <Text style={styles.buttonText}>End Session</Text>
        </Pressable>
        {sessionDetails.elapsedPomodoroTime >=
          sessionDetails.initialPomodoroTime && (
            <Pressable
              onPress={() => skipBreak(setSessionDetails, sessionDetails)}
              style={[styles.button, styles.skipBreakButton]}>
              <Text style={styles.buttonText}>Skip Break</Text>
            </Pressable>
          )}
        <Pressable
          onPress={() =>
            sessionDetails.isPaused
              ? resumeSession(setSessionDetails)
              : pauseSession(sessionDetails, setSessionDetails)
          }
          style={[styles.button, styles.pauseResumeButton]}>
          <Text style={styles.buttonText}>
            {sessionDetails.isPaused ? 'Resume' : 'Pause'}
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
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 60,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
    color: 'rgb(7,254,213)',
  },
  pausedText: {
    color: 'rgb(217,49,7)',
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

const EnhancedSessionInfo = enhance(SessionInfo);
export default EnhancedSessionInfo;
