import * as React from 'react';

import {Pressable, StyleSheet, Text, View} from 'react-native';
import {
  Queued_Trail,
  Session_Category,
  Trail,
  User,
  User_Achievement,
} from '../watermelon/models';

import {AchievementsWithCompletion} from '../types/achievements';
import EnhancedActiveSession from '../components/Session/ActiveSession';
import EnhancedNewSessionOptions from '../components/Session/NewSessionOptions';
import {Q} from '@nozbe/watermelondb';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SessionDetails} from '../types/session';
import Timer from '../types/timer';
import handleError from "../helpers/ErrorHandler";
import {useDatabase} from '@nozbe/watermelondb/react';
import { useKeepAwake } from '@sayem314/react-native-keep-awake';
import {useNavigation} from '@react-navigation/native';
import {withObservables} from '@nozbe/watermelondb/react';

interface Props {
  user: User;
  setUser: any;
  currentTrail: Trail;
  userAchievements: User_Achievement[];
}
const SessionScreen = ({
  user,
  setUser,
  currentTrail,
  userAchievements,
}:
  Props) =>
{

  useKeepAwake();
  //@ts-ignore
  const navigation = useNavigation();
  const watermelonDatabase = useDatabase();
  const [achievementsWithCompletion, setAchievementsWithCompletion] =
    React.useState<AchievementsWithCompletion[]>();
  const [userSession, setUserSession] = React.useState<any>();
  const [currentSessionCategory, setCurrentSessionCategory] =
    React.useState('');
  const [sessionCategories, setSessionCategories] = React.useState<
    Session_Category[] | []
  >([]);
  const [sessionDetails, setSessionDetails] = React.useState<SessionDetails>({
    startTime: null,
    sessionName: '',
    sessionDescription: '',
    sessionCategoryId: null,
    breakTimeReduction:0,
    minimumPace: 2,
    maximumPace: 5.5,
    paceIncreaseValue: .25,
    paceIncreaseInterval: 900, //15 minutes,
    increasePaceOnBreakValue: 0, //TODO: possible addon sleeping bag increases pace by this interval on breaks
    completedHike: false,
    strikes: 0,
    penaltyValue: 1,
    endSessionModal: false,
    totalDistanceHiked: 0.0,
    totalTokenBonus: 0,
    trailTokensEarned:0,
    sessionTokensEarned:0,
    isLoading: false,
    isError: false,
    backpack: [{addon: null, minimumTotalMiles:0.0}, {addon: null, minimumTotalMiles:75.0}, {addon: null, minimumTotalMiles:175.0}, {addon: null, minimumTotalMiles:375.0}]
  });

  const [timer, setTimer] = React.useState<Timer>({
    startTime: null,
    isCompleted: false,
    time: 1500,
    isRunning: false,
    isPaused: false,
    isBreak: false,
    focusTime: 1500,
    shortBreakTime: 300,
    longBreakTime: 2700,
    sets: 3,
    completedSets: 0,
    pace: 2,
    autoContinue: false

  })

  async function getAchievementsWithCompletion() {
    const query = `SELECT achievements.*, 
               CASE WHEN users_achievements.achievement_id IS NOT NULL THEN 1 ELSE 0 END AS completed 
               FROM achievements 
               LEFT JOIN users_achievements ON achievements.id = users_achievements.achievement_id 
               AND users_achievements.user_id = ?`;

    try {
      const results = (await watermelonDatabase
        .get('achievements')
        .query(Q.unsafeSqlQuery(query, [user.id]))
        .unsafeFetchRaw()) as AchievementsWithCompletion[];
      if (results.length > 0) {
        setAchievementsWithCompletion(results);
      }
      return;
    } catch (err) {
      handleError( err, 'getAchievementsWithCompletion',);
      return null;
    }
  }

  async function getSessionCategories() {
    try {
      const sessionCategories = (await watermelonDatabase
        .get('session_categories')
        .query()
        .fetch()) as Session_Category[]

      if (sessionCategories) {
        setSessionCategories(sessionCategories);
        return;
      }
      throw new Error('Error getting session Categories, fetch empty');
    } catch (err) {
      handleError( err, 'getSessionCategories() timerScreen',);
    }
  }

  async function getCurrentSessionCategory() {
    try {
      const sessionCategory = (await watermelonDatabase
        .get('session_categories')
        .query(Q.where('id', sessionDetails.sessionCategoryId))) as Session_Category[];

      if (sessionCategory) {
        setCurrentSessionCategory(sessionCategory[0].sessionCategoryName);
      }
    } catch (err) {
      console.error(
        'Failed to get session Categories from wdb, getSessionCategories()'
      );
    }
  }

  // Hide the bottom tab bar when the session is active
  React.useEffect(() => {
    if (sessionDetails.startTime) {
      navigation.setOptions({
        tabBarVisible: false,
      });
    } else {
      navigation.setOptions({
        tabBarVisible: true,
      });
    }
  }, [navigation, sessionDetails.startTime]);

  //Get usersAchievements table with completion joined on table
  React.useEffect(() => {
    getAchievementsWithCompletion();
  }, [userAchievements]);
  //Get session Categories
  React.useEffect(() => {
    getSessionCategories();
  }, []);
  //Get current sessionCategoryId for achievement checking
  React.useEffect(() => {
    if (sessionDetails.sessionCategoryId) {
      getCurrentSessionCategory();
    }
  }, [sessionDetails.sessionCategoryId]);

  return (
    <SafeAreaView style={styles.container}>
      {sessionDetails.isLoading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : !sessionDetails.startTime && !timer.isRunning ? (
        <EnhancedNewSessionOptions
          sessionDetails={sessionDetails}
          setSessionDetails={setSessionDetails}
          timer={timer}
          setTimer={setTimer}
          setUserSession={setUserSession}
          sessionCategories={sessionCategories}
          user={user}
        />
      ) : (
        <EnhancedActiveSession
          sessionDetails={sessionDetails}
          setSessionDetails={setSessionDetails}
          timer={timer}
          setTimer={setTimer}
          achievementsWithCompletion={achievementsWithCompletion}
          userSession={userSession}
          currentSessionCategory={currentSessionCategory}
          user={user}
        />
      )}
    </SafeAreaView>
  );
};

const enhance = withObservables(['user', 'userAchievements'], ({user}) => ({
  user: user.observe(),
  userAchievements: user.usersAchievements.observe(),

}));

const EnhancedSessionScreen = enhance(SessionScreen);
export default EnhancedSessionScreen;

const styles = StyleSheet.create({
  container: {flex: 1},
  loading: {color: 'white', alignSelf: 'center', marginTop: 20},
  returnButton: {
    width: '80%',
    height: 40,
    borderRadius: 10,
    marginVertical: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  returnButtonText: {
    color: '#13B3AC',
    fontSize: 18,
    fontWeight: '800',
  },
});
