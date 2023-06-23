import {Pressable, StyleSheet, Text, View} from 'react-native';
import * as React from 'react';
import NewSessionOptions from '../components/Timer/NewSessionOptions';
import EnhancedSessionTimer from '../components/Timer/SessionTimer';
import {UserContext} from '../App';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import getJoinedUserTrail from '../helpers/Timer/getJoinedUserTrail';
import {JoinedUserTrail, SessionDetails} from '../types/session';
import {useFocusEffect} from '@react-navigation/native';

import {Q} from '@nozbe/watermelondb';
import withObservables from '@nozbe/with-observables';
import {Queued_Trail, Trail, User, User_Miles} from '../watermelon/models';
import {useNavigation} from '@react-navigation/native';
interface Props {
  user: User;
  setUser: any;
  currentTrail: Trail;
}
const TimerScreen = ({user, setUser, currentTrail}: Props) => {
  //@ts-ignore
  const navigation = useNavigation();

  //observable user session
  const [userSession, setUserSession] = React.useState<any>();

  const [sessionDetails, setSessionDetails] = React.useState<SessionDetails>({
    isSessionStarted: false,
    isPaused: false,
    sessionName: '',
    sessionDescription: '',
    sessionCategoryId: null,
    initialPomodoroTime: 1500,
    initialShortBreakTime: 300,
    initialLongBreakTime: 2700,
    elapsedPomodoroTime: 0,
    elapsedShortBreakTime: 0,
    elapsedLongBreakTime: 0,
    sets: 3,
    currentSet: 1,
    pace: 2,
    completedHike: false,
    strikes: 0,
    endSessionModal: false,
    totalSessionTime: 0,
    totalDistanceHiked: 0.0,
    isLoading: false,
    isError: false,
  });

  React.useEffect(() => {
    // Hide the bottom tab bar when the session is active
    if (sessionDetails.isSessionStarted) {
      navigation.setOptions({
        tabBarVisible: false,
      });
    } else {
      navigation.setOptions({
        tabBarVisible: true,
      });
    }
  }, [navigation, sessionDetails.isSessionStarted]);

  return (
    <SafeAreaView style={styles.container}>
      {sessionDetails.isLoading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : sessionDetails.isSessionStarted === false || !userSession ? (
        <NewSessionOptions
          sessionDetails={sessionDetails}
          setSessionDetails={setSessionDetails}
          setUserSession={setUserSession}
          user={user}
        />
      ) : (
        <EnhancedSessionTimer
          sessionDetails={sessionDetails}
          setSessionDetails={setSessionDetails}
          userSession={userSession}
          user={user}
        />
      )}
     
    </SafeAreaView>
  );
};

const enhance = withObservables(['user'], ({user}) => ({
  user: user.observe(),
}));

const EnhancedTimerScreen = enhance(TimerScreen);
export default EnhancedTimerScreen;

const styles = StyleSheet.create({
  container: {flex: 1},
  loading: {color: 'white'},
  returnButton: {
    width: '80%',
    height: 50,
    borderRadius: 10,
    marginVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
  },
});
