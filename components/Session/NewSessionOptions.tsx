import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {User, User_Addon} from '../../watermelon/models';

import EnhancedNewSessionBackpack from './NewSessionBackpack';
import NewSessionHandlers from '../../helpers/Session/newSessionHandlers';
import React from 'react';
import SelectDropdown from 'react-native-select-dropdown';
import {SessionDetails} from '../../types/session';
import {Session_Category} from '../../watermelon/models';
import Timer from '../../types/timer';
import { achievementManagerInstance } from '../../helpers/Achievements/AchievementManager';
import timeOptions from '../../helpers/Session/timeOptions';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import {useNavigation} from '@react-navigation/native';
import withObservables from '@nozbe/with-observables';

interface Props {
  timer: Timer,
  setTimer: React.Dispatch<React.SetStateAction<Timer>>,
  sessionDetails: SessionDetails;
  setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
  setUserSession: React.Dispatch<React.SetStateAction<any>>;
  sessionCategories: Session_Category[];
  user: User;
  usersAddons: User_Addon[];
}

const NewSessionOptions = ({
  sessionDetails,
  setSessionDetails,
  timer,
  setTimer,
  setUserSession,
  sessionCategories,
  user,
  usersAddons,
}: Props) => {
  //@ts-ignore
  const watermelonDatabase = useDatabase();
  const navigation = useNavigation();
  const toggleAutoContinue = () => setTimer(previousState => ({...previousState, autoContinue: !previousState.autoContinue}));


  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.dropdownContainer, {marginTop: 20}]}>
        <Text style={styles.label}>Session Title:</Text>
        <TextInput
          value={sessionDetails.sessionName}
          style={{
            backgroundColor: 'rgb(31,33,35)',
            color: 'rgb(7,254,213)',
            width: '80%',
            fontWeight: 'bold',
            fontSize: 18,
            padding: 5,
          }}
          onChangeText={(value) =>
            NewSessionHandlers.SessionNameChange({ setSessionDetails, value })
          }
          placeholder="New Session Name"
          placeholderTextColor={'rgba(211,211,211, .3)'}
        />
      </View>
      {/* SessionCategory */}
      <View style={styles.dropdownContainer}>
        <Text style={styles.label}>Category:</Text>
        <SelectDropdown
          data={sessionCategories}
          onSelect={(selectedItem, index) =>
          {
              NewSessionHandlers.SelectSessionCategoryId(
                {setTimer, setSessionDetails,
                  sessionCategoryId: selectedItem.id,
                  database: watermelonDatabase }
              );
            }}
          buttonTextAfterSelection={(selectedItem, index) => {
            // text represented after item is selected
            // if data array is an array of objects then return selectedItem.property to render after item is selected
            return selectedItem.sessionCategoryName;
          }}
          rowTextForSelection={(item, index) => {
            // text represented for each item in dropdown
            // if data array is an array of objects then return item.property to represent item in dropdown
            return item.sessionCategoryName;
          }}
          defaultButtonText={'Select a category'}
          defaultValue={null}
          buttonStyle={styles.dropdownButtonStyle}
          buttonTextStyle={[
            styles.dropdownButtonText,
            {
              color: !sessionDetails.sessionCategoryId
                ? 'rgba(211,211,211, .3)'
                : 'rgb(41,184,169)',
            },
          ]}
          search={true}
          searchPlaceHolder={'Search'}
        />
      </View>
      {/* PomodoroTime */}
      <View style={styles.dropdownContainer}>
        <Text style={styles.label}>Pomodoro:</Text>
        <SelectDropdown
          data={timeOptions}
          onSelect={(selectedItem, index) => {
            NewSessionHandlers.InitialPomodoroTimeChange(
              { setTimer,
                value: selectedItem.value }
            );
          }}
          buttonTextAfterSelection={(selectedItem, index) => {
            return selectedItem.label;
          }}
          rowTextForSelection={(item, index) => {
            return item.label;
          }}
          defaultButtonText={
            timer.initialPomodoroTime
              ? `${timer.initialPomodoroTime / 60} minutes`
              : '25 minutes'
          }
          defaultValue={
            timer.initialPomodoroTime
              ? timer.initialPomodoroTime
              : 1500
          }
          buttonStyle={styles.dropdownButtonStyle}
          buttonTextStyle={styles.dropdownButtonText}
          rowStyle={{backgroundColor: 'rgba(255,255,255,0.1'}}
        />
      </View>
      {/* Short Break Time */}
      <View style={styles.dropdownContainer}>
        <Text style={styles.label}>Short Break:</Text>
        <SelectDropdown
          data={timeOptions}
          onSelect={(selectedItem, index) => {
            NewSessionHandlers.InitialShortBreakChange(
              { setTimer,
                value: selectedItem.value }
            );
          }}
          buttonTextAfterSelection={(selectedItem, index) => {
            return selectedItem.label;
          }}
          rowTextForSelection={(item, index) => {
            return item.label;
          }}
          defaultButtonText={
            timer.initialShortBreakTime
              ? `${timer.initialShortBreakTime / 60} minutes`
              : '5 minutes'
          }
          defaultValue={
            timer.initialShortBreakTime
              ? timer.initialShortBreakTime
              : 300
          }
          buttonStyle={styles.dropdownButtonStyle}
          buttonTextStyle={styles.dropdownButtonText}
          rowStyle={{backgroundColor: 'rgba(255,255,255,0.1'}}
        />
      </View>
      {/* Long Break Time */}
      <View style={styles.dropdownContainer}>
        <Text style={styles.label}>Long Break:</Text>
        <SelectDropdown
          data={timeOptions}
          onSelect={(selectedItem, index) => {
            NewSessionHandlers.InitialLongBreakChange(
              { setTimer,
                value: selectedItem.value }
            );
          }}
          buttonTextAfterSelection={(selectedItem, index) => {
            return selectedItem.label;
          }}
          rowTextForSelection={(item, index) => {
            return item.label;
          }}
          defaultButtonText={
            timer.initialLongBreakTime
              ? `${timer.initialLongBreakTime / 60} minutes`
              : '45 minutes'
          }
          defaultValue={
            timer.initialLongBreakTime
              ? timer.initialLongBreakTime
              : 2700
          }
          buttonStyle={styles.dropdownButtonStyle}
          buttonTextStyle={styles.dropdownButtonText}
          rowStyle={{backgroundColor: 'rgba(255,255,255,0.1'}}
        />
      </View>
      <View style={[ styles.dropdownContainer ]}>
        <Text style={styles.label}>Auto Continue:</Text>
        <View style={{flexDirection: 'row', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Switch
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={timer?.autoContinue ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleAutoContinue}
            value={timer.autoContinue}
          />
        </View>
      </View>
      
      <EnhancedNewSessionBackpack sessionDetails={sessionDetails} setSessionDetails={setSessionDetails} user={user} usersAddons={usersAddons}/>
      <Pressable
        onPress={() => {
          if (!sessionDetails.startTime) {
            console.debug('Clikced start session, sessionDetails', sessionDetails);
            NewSessionHandlers.StartSessionClick(
              { timer, setTimer, setSessionDetails,
                sessionDetails,
                user,
                database: watermelonDatabase }
            ).then((newSession: any) => {
                if (newSession) {
                  console.debug('New session created', newSession);
                    const sessionDetailsWithAddons = {...sessionDetails};
                    const timerWithAddons = {...timer};
                  console.debug('sessionDetailsWithAddons', sessionDetailsWithAddons);
                    sessionDetailsWithAddons.backpack.forEach((slot) => {
                    if(slot.addon){
                      const effect = slot.addon.effectType;

                      switch (effect) {
                        case "min_pace_increase":
                          sessionDetailsWithAddons.minimumPace = slot.addon.effectValue;
                          timerWithAddons.pace = slot.addon.effectValue;
                          console.debug('Addon Applied:', slot.addon.name);
                          break;
                        case "max_pace_increase":
                          sessionDetailsWithAddons.maximumPace = slot.addon.effectValue;
                          console.debug('Addon Applied:', slot.addon.name);
                          break;
                        case "pace_increase_interval":
                          sessionDetailsWithAddons.paceIncreaseInterval = slot.addon.effectValue;
                          console.debug('Addon Applied:', slot.addon.name);
                          break;
                        case "pace_increase_value":
                          timerWithAddons.pace += slot.addon.effectValue; // Accumulate pace increases
                          console.debug('Addon Applied:', slot.addon.name);
                          break;
                        case "penalty_reduction":
                          sessionDetailsWithAddons.penaltyValue -= slot.addon.effectValue; // Subtracting to reduce penalty
                          console.debug('Addon Applied', slot.addon.name);
                          break;
                        case "trail_token_bonus":
                          sessionDetailsWithAddons.totalTokenBonus += slot.addon.effectValue; // Adding extra tokens
                          console.debug('Addon Applied', slot.addon.name);
                          break;
                        case "break_time_reduction":
                          sessionDetailsWithAddons.breakTimeReduction = slot.addon.effectValue;
                          console.debug('Addon Applied', slot.addon.name);
                          break;
                        default:
                          console.debug('Addon Not Applied', slot.addon.name);
                          break;
                      }
                    }
                    });
                  setUserSession(newSession);
                  setSessionDetails((prev: SessionDetails) => ({...sessionDetailsWithAddons, startTime: new Date().toISOString(), isLoading: false}));
                  setTimer((prev: Timer) => ({
                    ...timerWithAddons, isRunning: true, startTime: new Date().toISOString()
                  }))
                } else {
                  setSessionDetails((prev: any) => {
                    return {
                      ...prev,
                      isLoading: false,
                      isError:
                      'Error creating new Session in handleStartSession func',
                    };
                  });
                }
              });
          }
        }}
        style={[
          styles.startBtn,
          {
            backgroundColor:
            sessionDetails.sessionName == '' ||
              sessionDetails.sessionCategoryId == null
              ? 'grey'
              : 'rgb(7,254,213)',
            bottom: 60,
          },
        ]}
        disabled={
          sessionDetails.sessionName === '' ||
            sessionDetails.sessionCategoryId == null
        }>
        <Text
          style={{
            color: 'rgb(28,29,31)',
            fontSize: 18,
            fontWeight: '800',
          }}>
          Start Session
        </Text>
      </Pressable>
      <Pressable
        onPress={() => navigation.goBack()}
        style={[styles.startBtn, {backgroundColor: '#017371'}]}>
        <Text
          style={{
            color: 'rgb(28,29,31)',
            fontSize: 18,
            fontWeight: '800',
          }}>
          Return to Base Camp
        </Text>
      </Pressable>
    </SafeAreaView>
  );
};

const enhance = withObservables(['usersAddons', 'user'], ({usersAddons, user}) => ({
  user,
  usersAddons: user.usersAddons
}))

const EnhancedNewSessionOptions = enhance(NewSessionOptions);

export default EnhancedNewSessionOptions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: ' rgb(28, 29, 31)',
  },
  dropdownContainer: {
    display: 'flex',
    flexDirection: 'row',
    padding: 5,
    width: '80%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: 'rgb(249,253,255)',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 5,
  },
  dropdownButtonStyle: {
    width: '50%',
    backgroundColor: 'rgb(31,33,35)',
    height: 30,
  },
  dropdownButtonText: {
    color: 'rgb(41,184,169)',
    fontWeight: '600',
  },
  startBtn: {
    width: '80%',
    height: 50,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
  },
  });
