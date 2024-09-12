import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import React from 'react';
import {User, User_Session} from '../../watermelon/models';
import withObservables from '@nozbe/with-observables';
import { achievementManagerInstance } from '../../helpers/Achievements/AchievementManager';
import NewSessionHandlers from '../../helpers/Session/newSessionHandlers';
import SelectDropdown from 'react-native-select-dropdown';
import {Session_Category} from '../../watermelon/models';
import EnhancedSessionBackpack from './SessionBackpack';
import timeOptions from '../../helpers/Session/timeOptions';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import {useNavigation} from '@react-navigation/native';

interface Props {
  sessionDetails: any;
  setSessionDetails: React.Dispatch<React.SetStateAction<any>>;
  setUserSession: React.Dispatch<React.SetStateAction<any>>;
  sessionCategories: Session_Category[];
  user: User;
  usersAddons: User_Addon[];
}

const NewSessionOptions = ({
  sessionDetails,
  setSessionDetails,
  setUserSession,
  sessionCategories,
  user,
  usersAddons,
}: Props) => {
  //@ts-ignore
  const watermelonDatabase = useDatabase();
  const navigation = useNavigation();


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
            NewSessionHandlers.SessionNameChange(setSessionDetails, value)
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
                setSessionDetails,
                selectedItem.id,
                watermelonDatabase
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
              setSessionDetails,
              selectedItem.value
            );
            console.log(sessionDetails);
          }}
          buttonTextAfterSelection={(selectedItem, index) => {
            return selectedItem.label;
          }}
          rowTextForSelection={(item, index) => {
            return item.label;
          }}
          defaultButtonText={
            sessionDetails.initialPomodoroTime
              ? `${sessionDetails.initialPomodoroTime / 60} minutes`
              : '25 minutes'
          }
          defaultValue={
            sessionDetails.initialPomodoroTime
              ? sessionDetails.initialPomodoroTime
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
            NewSessionHandlers.InitailShortBreakChange(
              setSessionDetails,
              selectedItem.value
            );
          }}
          buttonTextAfterSelection={(selectedItem, index) => {
            return selectedItem.label;
          }}
          rowTextForSelection={(item, index) => {
            return item.label;
          }}
          defaultButtonText={
            sessionDetails.initialShortBreakTime
              ? `${sessionDetails.initialShortBreakTime / 60} minutes`
              : '5 minutes'
          }
          defaultValue={
            sessionDetails.initialShortBreakTime
              ? sessionDetails.initialShortBreakTime
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
              setSessionDetails,
              selectedItem.value
            );
          }}
          buttonTextAfterSelection={(selectedItem, index) => {
            return selectedItem.label;
          }}
          rowTextForSelection={(item, index) => {
            return item.label;
          }}
          defaultButtonText={
            sessionDetails.initialLongBreakTime
              ? `${sessionDetails.initialLongBreakTime / 60} minutes`
              : '45 minutes'
          }
          defaultValue={
            sessionDetails.initialLongBreak
              ? sessionDetails.initialLongBreakTime
              : 2700
          }
          buttonStyle={styles.dropdownButtonStyle}
          buttonTextStyle={styles.dropdownButtonText}
          rowStyle={{backgroundColor: 'rgba(255,255,255,0.1'}}
        />
      </View>
      <EnhancedSessionBackpack sessionDetails={sessionDetails} setSessionDetails={setSessionDetails} user={user} usersAddons={usersAddons}/>
      <Pressable
        onPress={() => {
          if (sessionDetails.isSessionStarted === false) {
            console.debug('Clikced start session, sessionDetails', sessionDetails);
            NewSessionHandlers.StartSessionClick(
              setSessionDetails,
              sessionDetails,
              user,
              watermelonDatabase
            ).then((newSession: any) => {
                if (newSession) {
                  console.debug('New session created', newSession);
                    const sessionDetailsWithAddons = {...sessionDetails};
                  console.debug('sessionDetailsWithAddons', sessionDetailsWithAddons);
                    sessionDetailsWithAddons.backpack.forEach((slot) => {
                    if(slot.addon){
                      const effect = slot.addon.effectType;

                      switch (effect) {
                        case "min_pace_increase":
                          sessionDetailsWithAddons.minimumPace = slot.addon.effectValue;
                          sessionDetailsWithAddons.pace = slot.addon.effectValue;
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
                          sessionDetailsWithAddons.pace += slot.addon.effectValue; // Accumulate pace increases
                          console.debug('Addon Applied:', slot.addon.name);
                          break;
                        case "penalty_reduction":
                          sessionDetailsWithAddons.penaltyValue -= slot.addon.effectValue; // Subtracting to reduce penalty
                          console.debug('Addon Applied', slot.addon.name);
                          break;
                        case "trail_token_bonus":
                          sessionDetailsWithAddons.extraTokens += slot.addon.effectValue; // Adding extra tokens
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
                  setSessionDetails((prev: any) => ({...sessionDetailsWithAddons, isSessionStarted: true, isLoading: false}
                  ));
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
        style={[styles.startBtn, {backgroundColor: 'green'}]}>
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

export default NewSessionOptions;

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
