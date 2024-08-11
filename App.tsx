
import 'react-native-gesture-handler';

import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import {
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import RNFS from 'react-native-fs';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LoginScreen from './Screens/LoginScreen';
import RegisterScreen from './Screens/RegisterScreen';
import SyncIndicator from './components/SyncIndicator';
import TabNavigator from './components/Navigation/TabNavigator';
import { checkForLoggedInUser } from './helpers/loginHelpers';
import { sync } from './watermelon/sync';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import useRevenueCat from './helpers/RevenueCat/useRevenueCat'; // Import the hook

const App = () => {
  const watermelonDatabase = useDatabase();
  const [isRegistering, setisRegistering] = useState<boolean>(true);
  const [user, setUser] = useState<any>();
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  // @ts-ignore
  //const { currentOffering, customerInfo, isProMember, loading } = useRevenueCat({ userId: user?.id || '' });


  useEffect(() => {
    const onLoad = async () => {
      try {
        // This finds and prints file path in the phones memory for the sqlite DB
        const dbFilePath = `${RNFS.DocumentDirectoryPath}/TrailTasks.db`;
        console.debug(`DATABASE LOCATION: ${dbFilePath}`);
        if (Platform.OS === 'android') {
          await PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS');
          await PermissionsAndroid.request('android.permission.READ_EXTERNAL_STORAGE');
          await PermissionsAndroid.request('android.permission.WRITE_EXTERNAL_STORAGE');
        }

        // This checks to see if the mobile device's SQLITE DB
        // has a userID saved in the local storage and sets the user if it does
        await checkForLoggedInUser(setUser, watermelonDatabase);
        // SYNC call the push and pull requests from the mobile device to PG database
        console.debug('calling sync');
        if (user) {
          await sync(watermelonDatabase, user.id);
        } else {
          await sync(watermelonDatabase);
        }
      } catch (err) {
        console.error('Error in onload in APP useEffect', err);
      }
    };


    onLoad().catch(e => console.error('onload function', e));
  }, [user]);

  // if (loading) {
  //   return (
  //     <GestureHandlerRootView style={{ flex: 1 }}>
  //       <SafeAreaView style={[backgroundStyle, styles.container]}>
  //         <Text style={styles.title}>Loading...</Text>
  //       </SafeAreaView>
  //     </GestureHandlerRootView>
  //   );
  // }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer theme={DarkTheme}>
        <SafeAreaView style={[backgroundStyle, styles.container]}>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={backgroundStyle.backgroundColor}
          />

          {/* <SyncIndicator delay={3000} />  */}
          <Text style={styles.title}>Trail Tasks</Text>
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

