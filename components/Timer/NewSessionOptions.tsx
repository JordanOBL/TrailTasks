import {
  StyleSheet,
  Text,
  SafeAreaView,
  Pressable,
  View,
  TextInput,
} from 'react-native';

import React from 'react';
import SelectDropdown from 'react-native-select-dropdown';
import {User_Session} from '../../watermelon/models';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import {formatDateTime} from '../../helpers/formatDateTime';
import {UserContext} from '../../App';

const timeOptions = [
  {label: '5 minutes', value: 300},
  {label: '10 minutes', value: 600},
  {label: '15 minutes', value: 900},
  {label: '20 minutes', value: 1200},
  {label: '25 minutes', value: 1500},
  {label: '30 minutes', value: 1800},
  {label: '35 minutes', value: 2100},
  {label: '40 minutes', value: 2400},
  {label: '45 minutes', value: 2700},
  {label: '50 minutes', value: 3000},
  {label: '55 minutes', value: 3300},
  {label: '1 hour', value: 3600},
];

const sessionCategories = [
  {session_category_id: '1', session_category_name: 'Chores'},
  {session_category_id: '2', session_category_name: 'Cooking'},
  {session_category_id: '3', session_category_name: 'Drawing'},
  {session_category_id: '4', session_category_name: 'Driving'},
  {session_category_id: '5', session_category_name: 'Errands'},
  {session_category_id: '6', session_category_name: 'Family'},
  {session_category_id: '7', session_category_name: 'Meditating'},
  {session_category_id: '8', session_category_name: 'Other'},
  {session_category_id: '9', session_category_name: 'Outdoors'},
  {session_category_id: '10', session_category_name: 'Pets'},
  {session_category_id: '11', session_category_name: 'Reading'},
  {session_category_id: '12', session_category_name: 'Social'},
  {session_category_id: '13', session_category_name: 'Sports'},
  {session_category_id: '14', session_category_name: 'Study'},
  {session_category_id: '15', session_category_name: 'Work'},
  {session_category_id: '16', session_category_name: 'Workout'},
  {session_category_id: '17', session_category_name: 'Writing'},
  {session_category_id: '18', session_category_name: 'Yoga'},
];
interface Props {
  sessionDetails: any;
  setSessionDetails: React.Dispatch<React.SetStateAction<any>>;
}

const NewSessionOptions = ({sessionDetails, setSessionDetails}: Props) => {
  const {userId} = React.useContext(UserContext);
  const watermelonDatabase = useDatabase();
  const handleSelectSessionCategoryId = (sessionCategoryId: string) => {
    setSessionDetails((prev: any) => {
      return {...prev, sessionCategoryId: sessionCategoryId};
    });
  };

  const handleSessionNameChange = (value: string) => {
    setSessionDetails((prev: any) => {
      return {...prev, sessionName: value};
    });
  };

  const handleInitialPomodoroTimeChange = (value: number) => {
    setSessionDetails((prev: any) => {
      return {...prev, initialPomodoroTime: value};
    });
  };

  const handleInitailShortBreakChange = (value: number) => {
    setSessionDetails((prev: any) => {
      return {...prev, initialShortBreak: value};
    });
  };

  const handleInitialLongBreakChange = (value: number) => {
    setSessionDetails((prev: any) => {
      return {...prev, initialLongBreak: value};
    });
  };

  async function handleStartSessionClick() {
    try {
      setSessionDetails((prev: any) => {
        return {...prev, isLoading: true};
      });
      let newSession = null;
      //@ts-ignore
      await watermelonDatabase.write(async () => {
        newSession = await watermelonDatabase
          .get('users_sessions')
          //@ts-ignore
          .create((userSession: User_Session) => {
            userSession.userId = userId;
            userSession.sessionName = sessionDetails.sessionName;
            userSession.sessionDescription = '';
            userSession.sessionCategoryId = sessionDetails.sessionCategoryId;
            userSession.totalSessionTime = '0';
            userSession.totalDistanceHiked = '0.00';
            userSession.dateAdded = formatDateTime(new Date());
          });
      });
      if (newSession !== null) {
        setSessionDetails((prev: any) => {
          return {...prev, isSessionStarted: true, isLoading: false};
        });
      } else {
        setSessionDetails((prev: any) => {
          return {
            ...prev,
            isLoading: false,
            isError: 'Error creating new Session in handleStartSession func',
          };
        });
      }
    } catch (err) {
      console.error(
        'Error creating new Session in handleStartSessionClick',
        err
      );
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.dropdownContainer, {width: '100%'}]}>
        <Text style={styles.label}>Session Title:</Text>
        <TextInput
          value={sessionDetails.sessionName}
          style={{
            backgroundColor: 'rgb(31,33,35)',
            color: 'rgb(7,254,213)',
            width: '100%',
            fontWeight: 'bold',
            fontSize: 18,
            padding: 10,
          }}
          onChangeText={(value) => handleSessionNameChange(value)}
          placeholder="New Session Name"
          placeholderTextColor={'rgb(131,33,35)'}
        />
      </View>
      {/* SessionCategory */}
      <View style={styles.dropdownContainer}>
        <Text style={styles.label}>Session Category:</Text>
        <SelectDropdown
          data={sessionCategories}
          onSelect={(selectedItem, index) => {
            console.log(selectedItem, index);
            handleSelectSessionCategoryId(selectedItem.session_category_id);
          }}
          buttonTextAfterSelection={(selectedItem, index) => {
            // text represented after item is selected
            // if data array is an array of objects then return selectedItem.property to render after item is selected
            return selectedItem.session_category_name;
          }}
          rowTextForSelection={(item, index) => {
            // text represented for each item in dropdown
            // if data array is an array of objects then return item.property to represent item in dropdown
            return item.session_category_name;
          }}
          defaultButtonText={'Select a category'}
          defaultValue={null}
          buttonStyle={styles.dropdownButtonStyle}
          buttonTextStyle={[
            styles.dropdownButtonText,
            {
              color: !sessionDetails.sessionCategoryId
                ? 'rgb(131,33,35)'
                : 'rgb(41,184,169)',
            },
          ]}
          search={true}
          searchPlaceHolder={'Search'}
        />
      </View>
      {/* PomodoroTime */}
      <View style={styles.dropdownContainer}>
        <Text style={styles.label}>Pomodoro Duration (working time):</Text>
        <SelectDropdown
          data={timeOptions}
          onSelect={(selectedItem, index) => {
            handleInitialPomodoroTimeChange(selectedItem.value);
          }}
          buttonTextAfterSelection={(selectedItem, index) => {
            return selectedItem.label;
          }}
          rowTextForSelection={(item, index) => {
            return item.label;
          }}
          defaultButtonText={'25 minutes'}
          defaultValue={'25 minutes'}
          buttonStyle={styles.dropdownButtonStyle}
          buttonTextStyle={styles.dropdownButtonText}
          rowStyle={{backgroundColor: 'rgba(255,255,255,0.1'}}
        />
      </View>
      <View style={styles.dropdownContainer}>
        {/* Short Break Time */}
        <Text style={styles.label}>Short Break Duration:</Text>
        <SelectDropdown
          data={timeOptions}
          onSelect={(selectedItem, index) => {
            handleInitailShortBreakChange(selectedItem.value);
          }}
          buttonTextAfterSelection={(selectedItem, index) => {
            return selectedItem.label;
          }}
          rowTextForSelection={(item, index) => {
            return item.label;
          }}
          defaultButtonText={'5 minutes'}
          defaultValue={'5 minutes'}
          buttonStyle={styles.dropdownButtonStyle}
          buttonTextStyle={styles.dropdownButtonText}
          rowStyle={{backgroundColor: 'rgba(255,255,255,0.1'}}
        />
        {/* Long Break Time */}
      </View>
      <View style={styles.dropdownContainer}>
        <Text style={styles.label}>Long Break Duration:</Text>
        <SelectDropdown
          data={timeOptions}
          onSelect={(selectedItem, index) => {
            handleInitialLongBreakChange(selectedItem.value);
          }}
          buttonTextAfterSelection={(selectedItem, index) => {
            return selectedItem.label;
          }}
          rowTextForSelection={(item, index) => {
            return item.label;
          }}
          defaultButtonText={'45 minutes'}
          defaultValue={'45 minutes'}
          buttonStyle={styles.dropdownButtonStyle}
          buttonTextStyle={styles.dropdownButtonText}
          rowStyle={{backgroundColor: 'rgba(255,255,255,0.1'}}
        />
      </View>
      <Pressable
        onPress={() => {
          if (sessionDetails.isSessionStarted === false) {
            handleStartSessionClick();
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
    </SafeAreaView>
  );
};

export default NewSessionOptions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: ' rgb(28, 29, 31)',
  },
  dropdownContainer: {
    padding: 5,
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
    marginVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
  },
});
