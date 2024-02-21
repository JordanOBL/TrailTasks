import {Pressable, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import formatCountdown from '../../helpers/Timer/formatCountdown';
import {
  Hike,
  endSession,
  pauseSession,
  resumeSession,
  shortBreak,
  skipBreak,
} from '../../helpers/Timer/timerFlow';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import EnhancedDistanceProgressBar from '../DistanceProgressBar';
import {
  Achievement,
  Completed_Hike,
  Queued_Trail,
  Trail,
  User,
  User_Miles,
  User_Session,
} from '../../watermelon/models';
import withObservables from '@nozbe/with-observables';
import formatTime from '../../helpers/formatTime';
import {SessionDetails} from '../../types/session';
import {AchievementsWithCompletion} from '../../types/achievements';
import {AchievementManager} from '../../helpers/Achievements/AchievementManager';

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
}: Props) => {
  const watermelonDatabase = useDatabase();

  const [earnedAchievements, setEarnedAchievements] = useState<Achievement[]>(
    []
  );

  const onAchievementEarned = useCallback((achievements: Achievement[]) => {
    setEarnedAchievements((prevAchievements) => [
      ...prevAchievements,
      ...achievements,
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
  // const totalFormattedSessionTime = useMemo(
  //   () => formatCountdown(sessionDetails.totalSessionTime, 0),
  //   [sessionDetails.totalSessionTime]
  // );
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
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [sessionDetails]);

  const checkUserSessionAchievements = async () => {
    const results = await AchievementManager.checkUserSessionAchievements(
      user,
      achievementsWithCompletion
    );
    if (results) {
      onAchievementEarned(results);
    }
  };

  useEffect(() => {
    checkUserSessionAchievements();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.timerContainer}>
        <Text
          style={[
            styles.timerText,
            {
              color: sessionDetails.isPaused
                ? 'rgb(81,83,85)'
                : sessionDetails.isSessionStarted && !canHike
                ? 'rgb(217,49,7)'
                : 'rgb(7,254,213)',
            },
          ]}>
          {sessionDetails.isPaused === true
            ? 'Paused'
            : canHike === true
            ? pomodoroCountdown
            : sessionDetails.currentSet < sessionDetails.sets
            ? shortBreakCountdown
            : longBreakCountdown}
        </Text>
        <Text style={styles.subtitle}>Strikes: {sessionDetails.strikes}</Text>
        <Text style={styles.subtitle}>
          Current set: {sessionDetails.currentSet}
        </Text>
        <Text style={styles.subtitle}>Total Sets: {sessionDetails.sets}</Text>
        <Text style={styles.subtitle}>
          Total Session Time: {formatTime(userSession.totalSessionTime)}
        </Text>
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
              {sessionDetails.isPaused ? 'Resume Session' : 'Pause Session'}
            </Text>
          </Pressable>
        </View>
      </View>
      <EnhancedDistanceProgressBar
        sessionDetails={sessionDetails}
        pace={sessionDetails.pace}
        user={user}
        trail={currentTrail}
      />
      <View style={styles.achievementsContainer}>
        <Text style={styles.title}>Achievements Earned</Text>
        {earnedAchievements.length > 0 ? (
          earnedAchievements.map((achievement, index) => (
            <Text key={index} style={styles.achievementItem}>
              {achievement.achievementName}
            </Text>
          ))
        ) : (
          <Text style={styles.emptyAchievements}>
            No achievements earned yet
          </Text>
        )}
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
  },
  subtitle: {
    color: 'white',
    marginBottom: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
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
  },
  skipBreakButton: {
    backgroundColor: 'blue',
  },
  pauseResumeButton: {
    backgroundColor: 'green',
  },
  achievementsContainer: {
    backgroundColor: 'gray',
    padding: 10,
    borderRadius: 8,
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
  },
  emptyAchievements: {
    color: 'white',
  },
});

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

// const styles = StyleSheet.create({});
