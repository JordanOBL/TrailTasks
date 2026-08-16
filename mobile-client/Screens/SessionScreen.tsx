import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import { EventBus, RewardsCalculatedPayload } from '../EventBus/EventBus';
import React, {useEffect, useRef, useState} from 'react';
import {
  Trail,
  User,
  User_Achievement,
} from '../watermelon/models';
import { darkTheme, lightTheme } from '../theme';

import {AchievementsWithCompletion} from '../types/achievements';
import EnhancedActiveSession from '../components/Session/ActiveSession';
import GroupResultsScreen from './GroupResultsScreen';
import NewSessionOptions from './NewSessionOptions';
import Rewards from '../helpers/Session/Rewards';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SessionDetails} from '../types/session';
import SessionEngineManager from '../sessionEngine/SessionEngineManager'
import { SessionSnapshot } from '../sessionEngine/sessionEngine';
import SoloResultsScreen from './SoloResultsScreen';
import {useAuthContext} from '../services/AuthContext';
import {useDatabase} from '@nozbe/watermelondb/react';
import useEventBus from '../EventBus/useBusEvent'
import { useInternetConnection } from "../contexts/InternetConnectionProvider";
import { useKeepAwake } from '@sayem314/react-native-keep-awake';
import {useNavigation} from '@react-navigation/native';
import { useServices } from '../contexts/ServiceProvider';
import {useTheme} from '../contexts/ThemeProvider';
import {withObservables} from '@nozbe/watermelondb/react';

interface Props {
  user: User;
  setUser: any;
  currentTrail: Trail;
  userAchievements: User_Achievement[];
  initialSessionDetails?: SessionDetails;
}

type UI_VIEWS = 'LOADING' | 'OPTIONS' | 'ACTIVE' | 'REWARDS_SOLO' | 'REWARDS_GROUP'

export type  Rewards = {
  trailRewards: number;
  wildXpRewards: number;
  timeRewards: number;
  totalTokenRewards: number;
}

const SessionScreen = () =>
{
  useKeepAwake();
   const {sessionEngineMgr} = useServices();
  const {user} = useAuthContext();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [view, setView] = useState<UI_VIEWS>('OPTIONS')
  const [rewards, setRewards] = useState<Rewards>({ trailRewards: 0, wildXpRewards: 0, timeRewards: 0, totalTokenRewards:0})
  const [finalSnapshot, setFinalSnapshot] = useState<null | SessionSnapshot>(null)


    //this sets the view when engine emits
    useEventBus('SESSION_STARTED', () => setView('ACTIVE'));
    useEventBus('SESSION_COMPLETED', () => setView('REWARDS_SOLO'))
    useEventBus('REWARDS_CALCULATED', (payload: RewardsCalculatedPayload) => {
      setRewards(prev => ({...prev, ...payload.rewards}))
      setFinalSnapshot({...payload.finalSnapshot})
      //setView('REWARDS_SOLO')
    })

    const resetSession = React.useCallback(() => {
      sessionEngineMgr?.resetCurrentSessionEngine();
      setView('OPTIONS')
      setRewards({ trailRewards: 0, wildXpRewards: 0, timeRewards: 0, totalTokenRewards:0})
      setFinalSnapshot(null)
    }, []);

  // })
// const handleEndSession = React.useCallback(async () => {
//   try {
//     setSessionDetails({ ...sessionDetails, isLoading: true });
//     await endSession({ user, setTimer, setSessionDetails, sessionDetails });
//     await sync(watermelonDatabase, isConnected, user.id);
//     setShowResultsScreen(false);
//   } catch (err) {
//     handleError(err, 'onEndSession');
//   }
// }, [sessionDetails, user, isConnected, watermelonDatabase]);


// const handleShowResultsScreen = React.useCallback(async () => {
//   const sessionTokensReward = Rewards.calculateSessionTokens({ setSessionDetails, sessionDetails, timer });
//   await Rewards.rewardFinalTokens({ sessionDetails, sessionTokensReward, user });
//   setShowResultsScreen(true);
// }, [sessionDetails, timer, user]);


  // async function getAchievementsWithCompletion() {
  //   const query = `SELECT achievements.*, 
  //              CASE WHEN users_achievements.achievement_id IS NOT NULL THEN 1 ELSE 0 END AS completed 
  //              FROM achievements 
  //              LEFT JOIN users_achievements ON achievements.id = users_achievements.achievement_id 
  //              AND users_achievements.user_id = ?`;

  //   try {
  //     const results = (await watermelonDatabase
  //       .get('achievements')
  //       .query(Q.unsafeSqlQuery(query, [user.id]))
  //       .unsafeFetchRaw()) as AchievementsWithCompletion[];
  //     if (results.length > 0) {
  //       setAchievementsWithCompletion(results);
  //     }
  //     return;
  //   } catch (err) {
  //     handleError( err, 'getAchievementsWithCompletion',);
  //     return null;
  //   }
  // }

  if(view == 'LOADING'){
    return (
      <View>
        <ActivityIndicator size="large" color={theme.button} />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} testID="session-screen">
      { view === 'OPTIONS' && <NewSessionOptions /> }
      { view === 'ACTIVE' && <EnhancedActiveSession user={user} /> }
      { view === 'REWARDS_SOLO' &&  <SoloResultsScreen resetSession={resetSession} snapshot={finalSnapshot} rewards={rewards}/> }
      {/* { view === 'REWARDS_GROUP' &&  <GroupResultsScreen /> }  */}
    </SafeAreaView>
  );
};

// const enhance = withObservables(['user', 'userAchievements', 'currentTrail'], ({user}) => ({
//   user: user.observe(),
//   userAchievements: user.usersAchievements.observe(),
//   currentTrail: user.trail,

// }));

// const EnhancedSessionScreen = enhance(SessionScreen);
export default SessionScreen;

const getStyles = (theme: typeof lightTheme | typeof darkTheme) => StyleSheet.create({
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
