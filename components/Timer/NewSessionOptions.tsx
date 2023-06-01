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
import { UserContext } from '../../App';
import sessionCategories from '../../helpers/Session/sessionCategories';
import timeOptions from '../../helpers/Session/timeOptions';
import NewSessionHandlers from '../../helpers/Session/newSessionHandlers';

interface Props {
  sessionDetails: any;
  setSessionDetails: React.Dispatch<React.SetStateAction<any>>;
}

const NewSessionOptions = ({ sessionDetails, setSessionDetails }: Props) =>
{
  //@ts-ignore
  const {userId} = React.useContext(UserContext);
  const watermelonDatabase = useDatabase();
  

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
          onChangeText={(value) => NewSessionHandlers.SessionNameChange(setSessionDetails, value)}
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
            NewSessionHandlers.SelectSessionCategoryId(
              setSessionDetails, selectedItem.session_category_id
            );
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
            NewSessionHandlers.InitialPomodoroTimeChange(
              setSessionDetails, selectedItem.value
            );
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
            NewSessionHandlers.InitailShortBreakChange(setSessionDetails, selectedItem.value);
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
            NewSessionHandlers.InitialLongBreakChange(selectedItem.value);
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
            NewSessionHandlers.StartSessionClick(setSessionDetails, sessionDetails, userId, watermelonDatabase);
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
