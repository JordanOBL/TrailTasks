import 'react-native-gesture-handler';
import React, {useEffect, useState, createContext} from 'react';
import {checkForLoggedInUser} from './helpers/loginHelpers';
import RNFS from 'react-native-fs';
import {
  SafeAreaView,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  Button,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import useRevenueCat from './helpers/RevenueCat/useRevenueCat';
import LoginScreen from './Screens/LoginScreen';
import RegisterScreen from './Screens/RegisterScreen';
import SyncIndicator from './components/SyncIndicator';
import {sync} from './watermelon/sync';
import {hasUnsyncedChanges} from '@nozbe/watermelondb/sync';
import {NavigationContainer, DarkTheme} from '@react-navigation/native';

import TabNavigator from './components/Navigation/TabNavigator';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {useDatabase} from '@nozbe/watermelondb/hooks';

export const UserContext = createContext<any>('');

function App(): JSX.Element {
  const watermelonDatabase = useDatabase();
  const [isRegistering, setisRegistering] = React.useState<boolean>(true);
  
  const [user, setUser] = useState<any>();

  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  
  //insert postgres tables
  const seedPgTables = async () => {
    try {
      console.log('seedingPgTables');
      const response = await fetch(`http://192.168.1.208:5500/api/seed`);
      const data = await response.json();
    } catch (error: any) {
      console.error(
        'Error in gettingPGTables function, app.tsx',
        error.message
      );
    }
  };

  useEffect(() => {
    // Do something with the Watermelon database instance
    const onLoad = async () => {
      try {
        //This finds and prints file path in the phones memory for the sqlite DB
        const dbFilePath = `${RNFS.DocumentDirectoryPath}/TrailTasks.db`;
        console.log(`The database file is located at: ${dbFilePath}`);
        if (Platform.OS === 'android') {
          PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS');
          PermissionsAndroid.request('android.permission.INTERNET');
          PermissionsAndroid.request(
            'android.permission.READ_EXTERNAL_STORAGE'
          );
          PermissionsAndroid.request(
            'android.permission.WRITE_EXTERNAL_STORAGE'
          );
        }

        //*uncomment next line to request the /seedPGTable API Route
        //await seedPgTables();

        //This checks to see if the mobile ldevices SQLITE DB
        //has a userID saved in the localstorage and sets the user if it does
        await checkForLoggedInUser(setUser, watermelonDatabase);
        console.log('sync in app');

        //SYNC call teh push and pull requests from mobile device to PG database
        await sync(watermelonDatabase);
      } catch (err) {
        console.log('Error in onload in APP useEffect', err);
      }
    };

    onLoad();
  }, []);

  return (
    <UserContext.Provider value={{user, setUser}}>
      <GestureHandlerRootView style={{flex: 1}}>
        <NavigationContainer theme={DarkTheme}>
          <SafeAreaView style={[backgroundStyle, styles.container]}>
            <StatusBar
              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
              backgroundColor={backgroundStyle.backgroundColor}
            />

            {/* <SyncIndicator delay={3000} />  */}
            <Text style={styles.title}>Trail Tasks</Text>
            {user != null ? (
              <TabNavigator user={user} setUser={setUser} />
            ) : isRegistering ? (
              <RegisterScreen
                setUser={setUser}
                setisRegistering={setisRegistering}
                isRegistering={isRegistering}
              />
            ) : (
              <LoginScreen
                setUser={setUser}
                setisRegistering={setisRegistering}
                isRegistering={isRegistering}
              />
            )}
          </SafeAreaView>
        </NavigationContainer>
      </GestureHandlerRootView>
    </UserContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(31,33,35)',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 40,
    textAlign: 'center',
    position: 'absolute',
    top: 100,
    left: 110,
    color: 'rgb(7,254,213)',
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
