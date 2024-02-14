import {Pressable, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import React, { useState } from 'react';
import formatCountdown from '../../helpers/Timer/formatCountdown';
import {JoinedUserTrail, SessionDetails} from '../../types/session';
import {
  Hike,
  endSession,
  longBreak,
  pauseSession,
  resumeSession,
  //save,
  shortBreak,
  skipBreak,
} from '../../helpers/Timer/timerFlow';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import EnhancedDistanceProgressBar from '../DistanceProgressBar';
import {
  Completed_Hike,
  Queued_Trail,
  Trail,
  User,
  User_Miles,
  User_Session,
} from '../../watermelon/models';
import withObservables from '@nozbe/with-observables';
import formatTime from '../../helpers/formatTime';
import { AchievementsWithCompletion } from '../../types/achievements';
interface Props {
  sessionDetails: SessionDetails;
  setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
  userSession: User_Session;
  user: User;
  currentTrail: Trail;
  queuedTrails: Queued_Trail[];
  userMiles: User_Miles;
  completedHikes: Completed_Hike[];
  achievementsWithCompletion: AchievementsWithCompletion[]
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
  achievementsWithCompletion
}: Props) => {

  const watermelonDatabase = useDatabase();
   const [unlockedAchievements, setUnlockedAchievements] = useState([]);

  let pomodoroCountdown = formatCountdown(
    sessionDetails.initialPomodoroTime,
    sessionDetails.elapsedPomodoroTime
  );
  let shortBreakCountdown = formatCountdown(
    sessionDetails.initialShortBreakTime,
    sessionDetails.elapsedShortBreakTime
  );
  let longBreakCountdown = formatCountdown(
    sessionDetails.initialLongBreakTime,
    sessionDetails.elapsedLongBreakTime
  );

  let totalFormattedSessionTime = formatCountdown(
    sessionDetails.totalSessionTime,
    0
  );

  let canHike =
    sessionDetails.elapsedPomodoroTime < sessionDetails.initialPomodoroTime;
  React.useEffect(() => {
    let intervalId: any;
    if (!sessionDetails.isPaused)
    {
      intervalId = setInterval(() =>
      {
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
          achievementsWithCompletion
        });
        
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [sessionDetails]);

  // useEffect(() => {
  //   const achievementsUnlocked = [];
  //   achievementsUnlocked.push(...checkTrailAchievements(user, completedTrail));
  //   achievementsUnlocked.push(...checkMileageAchievements(user, userMiles));
  //   achievementsUnlocked.push(...checkSessionAchievements(sessionDetails));
  //   setUnlockedAchievements(achievementsUnlocked);
  // }, [user, userMiles, completedTrail, sessionDetails]);

  return (
    <SafeAreaView>
      <Text
        style={{
          color: sessionDetails.isPaused
            ? 'rgb(81,83,85)'
            : sessionDetails.isSessionStarted && !canHike
            ? 'rgb(217,49,7)'
            : 'rgb(7,254,213)',
          fontSize: 60,
          fontWeight: 'bold',
          marginTop: 20,
          textAlign: 'center',
        }}>
        {sessionDetails.isPaused === true
          ? 'Paused'
          : canHike === true
          ? pomodoroCountdown
          : sessionDetails.currentSet < sessionDetails.sets
          ? shortBreakCountdown
          : longBreakCountdown}
      </Text>
      <Text style={{color: 'white'}}>Strikes: {sessionDetails.strikes}</Text>
      <Text style={{color: 'white'}}>
        Current set: {sessionDetails.currentSet}
      </Text>
      <Text style={{color: 'white'}}>Total Sets: {sessionDetails.sets}</Text>
      <Text style={{color: 'white'}}>
        Total Session Time {formatTime(userSession.totalSessionTime)}
      </Text>
      <Pressable
        onPress={() =>
          endSession({
            setSessionDetails,
            sessionDetails,
          })
        }>
        <Text style={{color: 'white'}}>End Session</Text>
      </Pressable>
      {sessionDetails.elapsedPomodoroTime >=
        sessionDetails.initialPomodoroTime && (
        <Pressable onPress={() => skipBreak(setSessionDetails, sessionDetails)}>
          <Text style={{color: 'white'}}>Skip Break</Text>
        </Pressable>
      )}
      {
        <Pressable
          onPress={() => {
            sessionDetails.isPaused === false
              ? pauseSession(setSessionDetails)
              : resumeSession(setSessionDetails);
          }}>
          <Text style={{color: 'white'}}>
            {sessionDetails.isPaused === false
              ? 'Pause Session'
              : 'Resume Session'}
          </Text>
        </Pressable>
      }
      <EnhancedDistanceProgressBar
        sessionDetails={sessionDetails}
        pace={sessionDetails.pace}
        user={user}
        trail={currentTrail}
      />
      {unlockedAchievements.length > 0 && (
        <Text>Unlocked Achievements: {unlockedAchievements.join(', ')}</Text>
      )}
    </SafeAreaView>
  );
};

const enhance = withObservables(
  ['user', 'currentTrail', 'completedHikes', 'queuedTrails', 'userMiles', 'userSession', 'usersAchievements'],
  ({user, userSession}) => ({
    user: user.observe(),
    currentTrail: user.trail.observe(),
    completedHikes: user.completedHikes.observe(),
    queuedTrails: user.queuedTrails.observe(),
    userMiles: user.userMiles.observe(),
    userSession,
    userAchievements: user.usersAchievements.observe()
  })
);

const EnhancedSessionTimer = enhance(SessionTimer);
export default EnhancedSessionTimer;

//export default SessionTimer;

const styles = StyleSheet.create({});
