import React, { useState,useRef, useEffect } from 'react';
import { AppState, Dimensions, View, Text, FlatList, Pressable, Platform,  StyleSheet, SafeAreaView, TextInput, Switch, Modal, ScrollView } from 'react-native';
import GroupResultsScreen from './GroupResultsScreen';
import useWebSocket from 'react-use-websocket';
 import { Dropdown } from 'react-native-element-dropdown';
import timeOptions from '../helpers/Session/timeOptions';
import {handleResponse} from '../helpers/Websockets/HandleResponse';
import * as Progress from 'react-native-progress';
import formatCountdown from '../helpers/Timer/formatCountdown';
import Icon from 'react-native-vector-icons/Ionicons'; // You can choose any icon set like FontAwesome, MaterialIcons, etc.
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import ContinueSessionModal from '../components/Session/ContinueSessionModal';
import {useInternetConnection} from '../hooks/useInternetConnection';

const StatBox = ({ label, value }) => (
  <View style={styles.infoBox}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[ styles.infoValue, { color: label == 'Strikes' && value > 0 ? 'red' : 'white'}  ]}>{value}</Text>
  </View>
);

const GroupSessionComponent =  ({ user, debugRef=null }) => {
  const [appState, setAppState] = useState(AppState.currentState);
  const { isConnected, ipAddress } = useInternetConnection();
  //this will check is emulater or device
  ////!TODO:Remove fo or production
  const [serverUrl, setServerUrl] = useState(null);
  const { sendJsonMessage, lastJsonMessage, isReady } = useWebSocket(serverUrl);
  const width = Dimensions.get('window').width;
  const [view, setView] = useState('session'); // "session" for initial, "lobby" for room
  const [roomId, setRoomId] = useState('');
  //Hiers is and object [string] userInfo
  const [hikers, setHikers] = useState({});
  const [session, setSession] = useState({
    name: '',
    distance: 0.0,
    level: 1,
    strikes: 0,
    tokensEarned: 0,
    bonusTokens: 0,
  });
  const [messageQueue, setMessageQueue] = useState([]);
  const [error, setError] = useState('');
  const [usersAddons, setUsersAddons] = useState([]);
  const [timer, setTimer] = useState({
    startTime: '',
    isCompleted: false,
    duration: 1500,
    isRunning: false,
    isBreak: false,
    focusTime: 1500,
    shortBreakTime: 300,
    longBreakTime: 2700,
    sets: 3,
    completedSets: 0,
    pace: 2.0,
    autoContinue: false,
  });

  let targetDistance = 0.5 * session.level;
  useEffect(() => {
    const setupConnection = async () => {

        if (isConnected) {
          // Check if we're on the emulator or a physical device
          const isEmulator = ipAddress && ipAddress[1] == 0;  // Emulator IP
          if (isEmulator) {
            setServerUrl('ws://10.0.2.2:8080/groupsession'); // Use emulator IP
          } else if (Platform.OS === 'android') {
            // Use the actual IP for the physical device
            setServerUrl('ws://192.168.1.42:8080/groupsession');
          } else {
              // Use the actual IP for the physical device
              setServerUrl('ws://127.0.0.1:8080/groupsession');
              }

        } else {
          setError('No internet connection');
        }
    };

    setupConnection();
  }, [serverUrl]);

  const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);

  function reset() {

    const resetHikers = {...hikers};

    for (const [key, value] of Object.entries(resetHikers)) {
      resetHikers[key].isReady = false;
      resetHikers[key].isPaused = false;
      resetHikers[key].distance = 0.0;

    }

    setHikers(resetHikers);
    setTimer({
      startTime: null,
      isRunning: false,
      pace: 2.0,
      completedSets: 0,
      isCompleted: false,
      isBreak: false,
      duration: 1500,
      focusTime: 1500,
      shortBreakTime: 300,
      longBreakTime: 2700,
      sets: 3,
      autoContinue: false,
    });
    setSession({
      name: '',
      distance: 0.0,
      level: 1,
      highestCompletedLevel: 0,
      strikes: 0,
      tokensEarned: 0,
      bonusTokens: 0,
    });
  }


  // Handle WebSocket responses
  useEffect(() => {
    if (lastJsonMessage) {
      handleResponse(lastJsonMessage, setHikers, setRoomId, setView, user, setMessageQueue, setError, setTimer, setSession);
     }
  }, [lastJsonMessage]);

   // Create or Join Room
  function handleCreateRoom(){
    sendJsonMessage({
      header: { protocol: 'create', userId: user.id },
      message: { username: user.username },
    });
  }

  // Join Room
  function handleJoinRoom(){
    sendJsonMessage({
      header: { protocol: 'join', roomId, userId: user.id },
      message: { username: user.username },
    });
  }

 function handlePause() {
  setHikers(prev => ({
    ...prev,
    [user.id]: {
      ...prev[user.id],
      isPaused: true,
      strikes: prev[user.id].strikes + 1,
    },
  }));
    setSession(prev => ({...prev, strikes: prev.strikes + 1 }));
  sendJsonMessage({
    header: { protocol: 'pause', roomId, userId: user.id },
    message: {},
  });
}


  function handleLeaveActiveSession(){
    sendJsonMessage({
      header: { protocol: 'leave', roomId, userId: user.id },
      message: { },
    });

  }

  function handleEnd(){
    sendJsonMessage({
      header: { protocol: 'end', roomId, userId: user.id },
      message: { 'end': true},
    });
  }

  function handleResume(){
    setHikers(prev => ({...prev, [user.id]: {...prev[user.id], isPaused: false}}));
    sendJsonMessage({
      header: { protocol: 'resume', roomId, userId: user.id },
      message: {IsPaused: false },
    });
  }

  // Toggle ready state for the current user
  function toggleReadyState(){
   console.log(`toggle hiker ${user.username}`, hikers); 
    sendJsonMessage({
      header: { protocol: 'ready', userId: user.id, roomId },
      message: { },
    });
  }

  // Send initial timer config updates to the server
  function sendUpdatedConfig(){
    //close Modal
    setSettingsModalVisible(false);
    if(hikers[user.id].isHost){
      //send new timer and session details to server
      sendJsonMessage({
        header: { protocol: 'updateConfig', userId: user.id, roomId },
        message: { timerConfig: {...timer}, sessionConfig: {...session} },
      });

    }
  }

  function handleExtraSet(){
    sendJsonMessage({
      header: { protocol: 'extraSet', userId: user.id, roomId },
      message: { extraSet: true},
    });
  }

  function handleExtraSession(){
    sendJsonMessage({
      header: { protocol: 'extraSession', userId: user.id, roomId },
      message: { extraSession: true},
    });
  }
  function handleStart(){
       sendJsonMessage({
      header: { protocol: 'start', userId: user.id, roomId },
      message: { start: true},
    });
  }

  function handleReturnToLobby(){
    reset();
    setView('lobby');
  }
  const intervalRef = useRef(null);

  // Set up and manage the countdown interval
 useEffect(() => {
  if (!timer || !timer.isRunning) {
      return;
    }
  if (timer.duration > 0) {
       intervalRef.current = setInterval(() => {
      setTimer(prev => ({
        ...prev,
        duration: prev.duration > 0 ? prev.duration - 1 : 0,
      }));
    }, 1000);

  }


  return () => clearInterval(intervalRef.current);
}, [timer]);

  //auto end if moda
  const timeoutRef = useRef(null); //this is a timeout to make the modal visible and then not visible again after 5 seconds if the endModal appears
  useEffect(() => {
    if(view === 'endModal'){
      timeoutRef.current = setTimeout(() => {
        handleEnd();
      }, 15000);
    }
    if(timeoutRef.current){
      clearTimeout(timeoutRef.current);
    }

    return () => clearTimeout(timeoutRef.current);
  }, [view]);


  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
    if(timer.isRunning){
      if (appState.match(/active/) && nextAppState.match(/inactive|background/)) {
        console.log('App is in the background or inactive.');
        handlePause();
      } else if (nextAppState === 'active' && appState.match(/inactive|background/)) {
        console.log('App is back in the foreground.');
        handleResume();
      }
      setAppState(nextAppState);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [appState, timer]);

  useFocusEffect(
    React.useCallback(() => {
      // Screen is focused
      
      if(timer.isRunning){
        handleResume();
      }
      return () => {
        // Screen is unfocused
        if(timer.isRunning){
            handlePause();
        }
      };
    }, [timer.isRunning])
  );

  useEffect(() => {
  if (process.env.NODE_ENV !== 'production' && debugRef) {
    debugRef.current = {
      messageQueue,
      error,
      hikers,
      session,
      roomId,
      timer,
      view,
      isConnected,
      serverUrl,

    };
  }
}, [hikers, session, roomId, timer, view, isConnected, messageQueue, error, serverUrl]);


  return (
    <SafeAreaView testID="group-session-screen" style={styles.container}>
      {view === 'session' && isConnected ?  (
        <View style={styles.initialContainer}>
          <Text style={styles.title}>Group Session</Text>

          <Pressable testID="create-room-button" style={styles.createRoomButton} onPress={handleCreateRoom}>
            <Text style={styles.buttonText}>Create Room</Text>
          </Pressable>

          <TextInput
            placeholder="Enter Room ID"
            placeholderTextColor="rgba(211,211,211, .5)"
            value={roomId}
            onChangeText={setRoomId}
            style={styles.input}
            testID="join-room-input"
          />
          <Pressable testID="join-room-button" style={styles.joinRoomButton} onPress={handleJoinRoom}>
            <Text style={styles.buttonText}>Join Room</Text>
          </Pressable>
        </View>
      ) : <View><Text>No Internet Connection</Text></View> }

       <ContinueSessionModal isVisible={view === 'endModal'} focusTime={timer.focusTime} onShowResultsScreen={() => setView('results')} onAddSession={handleExtraSession} onAddSet={handleExtraSet}  />


      {view === 'lobby' && (
        <>
          {/* Settings Modal Drawer */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={isSettingsModalVisible}
            onRequestClose={() => setSettingsModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <ScrollView style={styles.modalContent}>
                <Text style={styles.sectionTitle}>Session Configuration</Text>

                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Session Title:</Text>
                  {hikers[user.id].isHost ? <TextInput
                    value={session.name}
                    style={styles.input}
                    onChangeText={(value) => setSession((prev) => ({ ...prev, name: value }))}
                    placeholder="New Session Name"
                    placeholderTextColor={'rgba(211,211,211, .3)'}
                    disabled={!hikers[user.id].isHost}
                  /> : <Text>{session.name}</Text>}
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Focus Time:</Text>
                        <Dropdown
                          style={styles.dropdown}
                          placeholderStyle={styles.placeholderStyle}
                          selectedTextStyle={styles.selectedTextStyle}
                          iconStyle={styles.iconStyle}
                          data={timeOptions}
                          maxHeight={300}
                          labelField="label"
                          valueField="value"
                          placeholder="Select item"
                          value={timer.focusTime}
                          onChange={(selectedItem) => setTimer(prev => ({...prev, focusTime: selectedItem.value }))}
                        />
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Short Break:</Text>
                    <Dropdown
                                        style={styles.dropdown}
                                        placeholderStyle={styles.placeholderStyle}
                                        selectedTextStyle={styles.selectedTextStyle}
                                        iconStyle={styles.iconStyle}
                                        data={timeOptions}
                                        maxHeight={300}
                                        labelField="label"
                                        valueField="value"
                                        placeholder="Select item"
                                        value={timer.shortBreakTime}
                                        onChange={(selectedItem) => setTimer(prev => ({...prev, shortBreakTime: selectedItem.value }))}
                                      />
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Long Break:</Text>
                        <Dropdown
                                            style={styles.dropdown}
                                            placeholderStyle={styles.placeholderStyle}
                                            selectedTextStyle={styles.selectedTextStyle}
                                            iconStyle={styles.iconStyle}
                                            data={timeOptions}
                                            maxHeight={300}
                                            labelField="label"
                                            valueField="value"
                                            placeholder="Select item"
                                            value={timer.longBreakTime}
                                            onChange={(selectedItem) => setTimer(prev => ({...prev, longBreakTime: selectedItem.value }))}
                                          />

                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Sets:</Text>
                  {hikers[user.id].isHost ? <TextInput
                    value={String(timer.sets)}
                    onChangeText={(value) => setTimer((prev) => ({ ...prev, sets: parseInt(value, 10) || 1 }))}
                    keyboardType="numeric"
                    style={styles.input}
                    disabled={!hikers[user.id].isHost}
                  /> : <Text>{timer.sets}</Text> }
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Auto Continue:</Text>
                  <Switch
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={timer.autoContinue ? '#f5dd4b' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => setTimer((prev) => ({ ...prev, autoContinue: !timer.autoContinue }))}
                    value={timer.autoContinue}
                    disabled={!hikers[user.id].isHost}
                  />
                </View>

                <Pressable
                  style={styles.closeButton}
                  onPress={() => sendUpdatedConfig()}
                >
                  <Text style={styles.buttonText}>{hikers[user.id].isHost ? 'Save & Close' : 'Close'}</Text>
                </Pressable>
              </ScrollView>
            </View>
          </Modal>

          {/* Lobby Controls */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={styles.settingsButton}
              onPress={() => setSettingsModalVisible(true)}
            >
              <Text style={styles.buttonText}>Configure Session</Text>
            </Pressable>

            <Pressable testID="toggle-ready-button" onPress={toggleReadyState} style={styles.toggleReadyButton}>
              <Text style={styles.buttonText}>{hikers[user.id]?.isReady ? 'Unready' : 'Ready Up'}</Text>
            </Pressable>

            {hikers[user.id]?.isHost && Object.values(hikers).every(hiker => hiker.isReady) && (
              <Pressable testID="start-group-session-button" onPress={handleStart} style={styles.startButton}>
                <Text style={styles.buttonText}>Start Session</Text>
              </Pressable>
            )}
          </View>

          {/* Hikers List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hikers</Text>
            <FlatList
              data={Object.entries(hikers)}
              keyExtractor={([userId]) => userId}
              renderItem={({ item }) => {
                const [userId, hiker] = item;
                return (
                  <View style={styles.hikerCard}>
                    <Text testID={`hiker-${userId}-name`} style={styles.hikerName}>{hiker.username}</Text>
                    <Text testID={`hiker-${userId}-status`} style={styles.hikerStatus}>{hiker.isReady ? 'Ready' : 'Not Ready'}</Text>
                  </View>
                );
              }}
            />
          </View>
        </>
      )}
      {view === 'timer' && (
        <>
          <Text style={{fontSize:32, color: timer.isBreak ? 'grey' : 'cyan', textAlign: 'center'}}>{
            timer ? formatCountdown(Number(timer.duration).toFixed(0)) : formatCountdown(0)
          }</Text>
          <View style={styles.buttonsContainer}>
            {/* Stop Button */}
            <Pressable onPress={handleEnd} style={[styles.button, styles.endSessionButton]}>
              <Icon name="square" size={28} color="white" />
            </Pressable>
            {/* Pause/Resume Button (conditionally rendered icon) */}
            <Pressable
              onPress={() =>
              {  hikers[user.id].isPaused
                  ? handleResume()
                  : handlePause(); }
              }
              style={[styles.button, styles.pauseResumeButton]}
            >
              <Icon
                name={hikers[user.id].isPaused ? 'play' : 'pause'}
                size={28}
                color={hikers[user.id].isPaused ? 'cyan' : 'grey'}
              />
            </Pressable>
            {/* Skip Break Button (conditionally rendered) */}
            {timer.isBreak && timer.isCompleted && hikers[user.id].isHost(
              <Pressable onPress={() => handleSkipBreak()} style={[styles.button, styles.skipBreakButton]}>
                <Icon name="play-skip-forward" size={28} color="white" />
              </Pressable>
            )}
          </View>

          <Text style={{fontSize:26, color: 'purple', textAlign: 'center'}}>Level: {session ? session.level : 0}</Text>

          <Progress.Bar
            width={width - 50}
            height={40}
            borderWidth={0}
            borderRadius={10}
            unfilledColor={'rgba(41,184,169, .2)'}
            progress={session ? session.distance / targetDistance : 0}
            animationType="timing"
            useNativeDriver={true}
            color={timer.isBreak ? 'rgb(255,0,0)' : 'rgb(7,254,213)'}
          />
           <View style={styles.statsContainer}>
            <View style={styles.statsGrid}>
              <StatBox label="Pace" value={`${timer.pace} mph`} />
              <StatBox label="Sets" value={`${timer.completedSets} / ${timer.sets}`} />
              <StatBox label="Strikes" value={session.strikes} />
              <StatBox label="Reward" value={session.tokensEarned} />
            </View>
          </View>

          <FlatList
            style={{display: 'flex', position:'absolute', bottom: 0, width: '100%', backgroundColor: 'red'}}
            data={Object.entries(hikers)}
            keyExtractor={([userId]) => userId}
            renderItem={({ item }) => {
              const [userId, hiker] = item;
              return (
                <View style={styles.testHikerCard}>
                  <Text style={styles.hikerName}>{hiker.username}</Text>
                  <Text style={styles.hikerDistance}>{Number(hiker.distance || 0).toFixed(2)}</Text>
                  <Text style={styles.hikerStatus}>{hiker.isPaused ? 'Paused' : 'Hiking'}</Text>
                </View>
              );
            }}
          />

        </>
      )}

      {view === 'results' && (
      <GroupResultsScreen
        session={session}
        hikers={hikers}
        user={user}
        handleReturnToLobby={handleReturnToLobby}
        timer={timer}
        />
      )}
    </SafeAreaView>
  );
};

export default GroupSessionComponent;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    paddingHorizontal: 20,
  },
      dropdown: {
        margin: 8,
        height: 40,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,

        elevation: 2,
      },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  initialContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createRoomButton: {
    backgroundColor: '#6A0DAD',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    width: '80%',
  },
  joinRoomButton: {
    backgroundColor: '#008080',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    width: '80%',
  },
  input: {
    backgroundColor: '#e6e6e6',
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
    marginVertical: 10,
    width: '80%',
    textAlign: 'center',
  },
  section: {
    marginVertical: 15,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  dropdownButtonStyle: {
    backgroundColor: '#e6e6e6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: 120,
  },
  dropdownButtonText: {
    fontSize: 14,
    color: '#333',
  },
  hikerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginVertical: 5,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  hikerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  hikerDistance: {
    fontSize: 14,
    color: '#777',
  },
  hikerStatus: {
    fontSize: 14,
    color: '#777',
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  settingsButton: {
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
  },
  toggleReadyButton: {
    backgroundColor: '#008080',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
  },
  startButton: {
    backgroundColor: '#6A0DAD',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
  },
  statsContainer: {
    backgroundColor: 'rgba(255,255,255,.1)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoBox: {
    width: '30%',
    marginBottom: 20,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#aaa',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  closeButton: {
    backgroundColor: '#6A0DAD',
    paddingVertical: 12,
    marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  testHikerCard: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: 5,
  },
  buttonsContainer: {
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
  },

});

