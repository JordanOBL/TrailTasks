import 'react-native-gesture-handler';
import 'react-native-reanimated';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';

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
import TabNavigator from './components/Navigation/TabNavigator';
import { sync } from './watermelon/sync';
import { useDatabase } from '@nozbe/watermelondb/react';
import handleError from './helpers/ErrorHandler'; // Import the hook
import {useAuthContext} from "./services/AuthContext";
import {useInternetConnection} from "./hooks/useInternetConnection";
import AuthScreen from "./Screens/AuthScreen";

// This is the default configuration
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Reanimated runs in strict mode by default
});

const App = () => {
  const watermelonDatabase = useDatabase();
  const { user, initUser} = useAuthContext()
  const {isConnected} = useInternetConnection()
  const isDarkMode = useColorScheme() === 'dark';
  const [form, setForm] = useState('login');
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
   const handleFormChange = () => {
    if (form === 'login') {
      setForm('register');
    } else {
      setForm('login');
    }
  };
  // @ts-ignore
  //const { currentOffering, customerInfo, isProMember, loading } = useRevenueCat({ userId: user?.id || '' });

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
          }

        }
        if (user) {
          await sync(watermelonDatabase, isConnected,user.id);
        } else {
          await sync(watermelonDatabase, isConnected);
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
            <TabNavigator  />
          ) : <AuthScreen form={form} handleFormChange={handleFormChange}   />}
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

