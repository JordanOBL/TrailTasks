import 'react-native-gesture-handler';
import 'react-native-reanimated';

import BootSplash from 'react-native-bootsplash';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import {
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import RNFS from 'react-native-fs';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LoginScreen from './Screens/LoginScreen';
import RegisterScreen from './Screens/RegisterScreen';
import TabNavigator from './components/Navigation/TabNavigator';
import { checkForLoggedInUser } from './helpers/loginHelpers';
import { sync } from './watermelon/sync';
import { useDatabase } from '@nozbe/watermelondb/react';
import handleError from './helpers/ErrorHandler'; // Import the hook
const App = () => {
  const watermelonDatabase = useDatabase();
  const [isRegistering, setisRegistering] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  // @ts-ignore
  //const { currentOffering, customerInfo, isProMember, loading } = useRevenueCat({ userId: user?.id || '' });

  //insert postgres tables
  const seedPgTables = async () => {
    try {
      console.log('seedingPgTables');
      const response = await fetch(`http://expressjs-postgres-production-54e4.up.railway.app/api/seed`);
      const data = await response.json();
      console.log(data)
      if(data.ok){
        return
      }
    } catch (err: any) {
      handleError(err, 'seedPgTables');
    }
  };

  useEffect(() => {
    const onLoad = async () => {
      try {
        if(!user) {
          // This finds and prints file path in the phones memory for the sqlite DB
          const dbFilePath = `${RNFS.DocumentDirectoryPath}/TrailTasks.db`;
          console.debug(`DATABASE LOCATION: ${dbFilePath}`);
          if (Platform.OS === 'android') {
            await PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS');
            await PermissionsAndroid.request('android.permission.READ_EXTERNAL_STORAGE');
            await PermissionsAndroid.request('android.permission.WRITE_EXTERNAL_STORAGE');
            await PermissionsAndroid.request('android.permission.INTERNET');
            await PermissionsAndroid.request('android.permission.VIBRATE');
          }

          //*uncomment next line to request the /seedPGTable API Route
    // await seedPgTables();

          // This checks to see if the mobile device's SQLITE DB
          // has a userID saved in the local storage and sets the user if it does
          await checkForLoggedInUser(setUser, watermelonDatabase);
          // SYNC call the push and pull requests from the mobile device to PG databas
        }
        if (user) {
          await sync(watermelonDatabase, user.id);
        } else {
          await sync(watermelonDatabase);
        }

        return;
      } catch (err) {
        handleError(err, 'onLoad');
      }
    };


    onLoad().finally(async ()=>{
      await BootSplash.hide({ fade: true });
    }).catch(e => handleError(e, 'useEffect onLoad'));
  }, [user, watermelonDatabase]);


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer theme={DarkTheme}  onReady={() => {
        BootSplash.hide({ fade: true });
      }}>
        <SafeAreaView style={[backgroundStyle, styles.container]}>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={backgroundStyle.backgroundColor}
          />

          {/* <SyncIndicator delay={3000} />  */}
          {/*<Text style={styles.title}>Trail Tasks</Text>*/}
          {user != null ? (
            <TabNavigator user={user} setUser={setUser}  />
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
  );
};

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
    top: 80,
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

