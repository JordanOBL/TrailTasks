import {
  Achievement,
  Completed_Hike,
  Queued_Trail,
  Trail,
  User,
  User_Miles,
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
import {Pressable, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {AchievementManager} from '../../helpers/Achievements/AchievementManager';
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
  userMiles: User_Miles;
  completedHikes: Completed_Hike[];
  achievementsWithCompletion: AchievementsWithCompletion[];
  currentSessionCategory: string;
}
const SessionTimer = ({
  setSessionDetails,
  sessionDetails,
  userSession,
  user,
  currentTrail,
  queuedTrails,
  userMiles,
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

  const onCompletedTrail = useCallback((trail: Trail) => {
    setCompletedTrails((prevCompletedTrails) => [
      ...prevCompletedTrails,
      trail,
    ]);
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
          userMiles,
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
    const results = await AchievementManager.checkUserSessionAchievements(
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
      <View style={styles.timerContainer}>
        <Text
          style={[
            styles.timerText,
            sessionDetails.isPaused && styles.pausedText,
          ]}>
          {sessionDetails.isPaused
            ? 'Paused'
            : canHike
            ? pomodoroCountdown
            : shortBreakCountdown}
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
        <View style={styles.infoContainer}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Current Set</Text>
            <Text style={styles.infoValue}>
              {sessionDetails.currentSet}/{sessionDetails.sets}
            </Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Strikes</Text>
            <Text style={styles.infoValue}>{sessionDetails.strikes}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Pace</Text>
            <Text style={styles.infoValue}>{sessionDetails.pace}</Text>
          </View>
        </View>
      </View>

      <View style={styles.achievementsContainer}>
        <Text style={styles.title}>Achievements Earned</Text>
        {earnedAchievements.length > 0 ? (
          earnedAchievements.map((achievement, index) => (
            <Text key={index} style={styles.achievementItem}>
              {achievement.achievementName}
            </Text>
          ))
        ) : (
          <></>
        )}
      </View>

      <View style={styles.completedTrailsContainer}>
        <Text style={styles.title}>Completed Trails</Text>
        {completedTrails.length > 0 ? (
          completedTrails.map((trail, index) => (
            <Text key={index} style={styles.achievementItem}>
              {trail.trailName}
            </Text>
          ))
        ) : (
          <></>
        )}
      </View>
      <View style={styles.buttonsContainer}>
        <Pressable
          onPress={() => endSession({setSessionDetails, sessionDetails})}
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
              : pauseSession(setSessionDetails)
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
    marginTop: 20,
    color: 'rgb(7,254,213)',
  },
  pausedText: {
    color: 'rgb(81,83,85)',
  },
  trailNameContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  trailName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 30,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  infoBox: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  infoValue: {
    color: 'white',
    fontSize: 16,
  },
  achievementsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Semi-transparent white background
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
  },
  completedTrailsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Semi-transparent white background
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  achievementItem: {
    color: 'white',
    marginBottom: 5,
    fontSize: 16,
  },
  emptyAchievements: {
    color: 'white',
    fontSize: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10, // Add padding between buttons and screen bottom
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
    'userMiles',
    'userSession',
    'usersAchievements',
  ],
  ({user, userSession}) => ({
    user: user.observe(),
    currentTrail: user.trail.observe(),
    completedHikes: user.completedHikes.observe(),
    queuedTrails: user.queuedTrails.observe(),
    userMiles: user.userMiles.observe(),
    userSession,
    userAchievements: user.usersAchievements.observe(),
  })
);

const EnhancedSessionTimer = enhance(SessionTimer);
export default EnhancedSessionTimer;

// import {Pressable, SafeAreaView, StyleSheet, Text, View} from 'react-native';
// import React, { useEffect, useState } from 'react';
// import formatCountdown from '../../helpers/Timer/formatCountdown';
// import {JoinedUserTrail, SessionDetails} from '../../types/session';
// import {
//   Hike,
//   endSession,
//   longBreak,
//   pauseSession,
//   resumeSession,
//   //save,
//   shortBreak,
//   skipBreak,
// } from '../../helpers/Timer/timerFlow';
// import {useDatabase} from '@nozbe/watermelondb/hooks';
// import EnhancedDistanceProgressBar from '../DistanceProgressBar';
// import {
//   Achievement,
//   Completed_Hike,
//   Queued_Trail,
//   Trail,
//   User,
//   User_Miles,
//   User_Session,
// } from '../../watermelon/models';
// import withObservables from '@nozbe/with-observables';
// import formatTime from '../../helpers/formatTime';
// import { AchievementsWithCompletion } from '../../types/achievements';
// import { AchievementManager } from '../../helpers/Achievements/AchievementManager'
// interface Props {
//   sessionDetails: SessionDetails;
//   setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
//   userSession: User_Session;
//   user: User;
//   currentTrail: Trail;
//   queuedTrails: Queued_Trail[];
//   userMiles: User_Miles;
//   completedHikes: Completed_Hike[];
//   achievementsWithCompletion: AchievementsWithCompletion[]
// }
// const SessionTimer = ({
//   setSessionDetails,
//   sessionDetails,
//   userSession,
//   user,
//   currentTrail,
//   queuedTrails,
//   userMiles,
//   completedHikes,
//   achievementsWithCompletion
// }: Props) =>
// {

//   const watermelonDatabase = useDatabase();

//   const [earnedAchievements, setEarnedAchievements] = useState<Achievement[]>([]);

//   const onAchievementEarned = (achievements: any[]) =>
//   {

//     setEarnedAchievements((prevAchievements) => [
//       ...prevAchievements,
//       ...achievements,
//     ]);
//   }

//   let pomodoroCountdown = formatCountdown(
//     sessionDetails.initialPomodoroTime,
//     sessionDetails.elapsedPomodoroTime
//   );
//   let shortBreakCountdown = formatCountdown(
//     sessionDetails.initialShortBreakTime,
//     sessionDetails.elapsedShortBreakTime
//   );
//   let longBreakCountdown = formatCountdown(
//     sessionDetails.initialLongBreakTime,
//     sessionDetails.elapsedLongBreakTime
//   );

//   let totalFormattedSessionTime = formatCountdown(
//     sessionDetails.totalSessionTime,
//     0
//   );

//   let canHike =
//     sessionDetails.elapsedPomodoroTime < sessionDetails.initialPomodoroTime;
//   React.useEffect(() => {
//     let intervalId: any;
//     if (!sessionDetails.isPaused)
//     {
//       intervalId = setInterval(() =>
//       {
//         Hike({
//           watermelonDatabase,
//           user,
//           userSession,
//           completedHikes,
//           queuedTrails,
//           currentTrail,
//           userMiles,
//           setSessionDetails,
//           sessionDetails,
//           canHike,
//           achievementsWithCompletion,
//           onAchievementEarned
//         });

//       }, 1000);
//     }
//     return () => clearInterval(intervalId);
//   }, [sessionDetails]);

//   return (
//     <SafeAreaView>
//       <Text
//         style={{
//           color: sessionDetails.isPaused
//             ? 'rgb(81,83,85)'
//             : sessionDetails.isSessionStarted && !canHike
//             ? 'rgb(217,49,7)'
//             : 'rgb(7,254,213)',
//           fontSize: 60,
//           fontWeight: 'bold',
//           marginTop: 20,
//           textAlign: 'center',
//         }}>
//         {sessionDetails.isPaused === true
//           ? 'Paused'
//           : canHike === true
//           ? pomodoroCountdown
//           : sessionDetails.currentSet < sessionDetails.sets
//           ? shortBreakCountdown
//           : longBreakCountdown}
//       </Text>
//       <Text style={{color: 'white'}}>Strikes: {sessionDetails.strikes}</Text>
//       <Text style={{color: 'white'}}>
//         Current set: {sessionDetails.currentSet}
//       </Text>
//       <Text style={{color: 'white'}}>Total Sets: {sessionDetails.sets}</Text>
//       <Text style={{color: 'white'}}>
//         Total Session Time {formatTime(userSession.totalSessionTime)}
//       </Text>
//       <Pressable
//         onPress={() =>
//           endSession({
//             setSessionDetails,
//             sessionDetails,
//           })
//         }>
//         <Text style={{color: 'white'}}>End Session</Text>
//       </Pressable>
//       {sessionDetails.elapsedPomodoroTime >=
//         sessionDetails.initialPomodoroTime && (
//         <Pressable onPress={() => skipBreak(setSessionDetails, sessionDetails)}>
//           <Text style={{color: 'white'}}>Skip Break</Text>
//         </Pressable>
//       )}
//       {
//         <Pressable
//           onPress={() => {
//             sessionDetails.isPaused === false
//               ? pauseSession(setSessionDetails)
//               : resumeSession(setSessionDetails);
//           }}>
//           <Text style={{color: 'white'}}>
//             {sessionDetails.isPaused === false
//               ? 'Pause Session'
//               : 'Resume Session'}
//           </Text>
//         </Pressable>
//       }
//       <EnhancedDistanceProgressBar
//         sessionDetails={sessionDetails}
//         pace={sessionDetails.pace}
//         user={user}
//         trail={currentTrail}
//       />
//       {earnedAchievements.length > 0 && (
//         <View>
//           <Text style={{color: 'white'}}>Achievements Earned:</Text>
//           {earnedAchievements.map((achievement, index) => (
//             <Text key={index} style={{color: 'white'}}>
//               {achievement.achievementName}
//             </Text>
//           ))}
//         </View>
//       )}
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({});
