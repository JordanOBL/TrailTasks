import 'react-native-gesture-handler';
import React, {useEffect} from 'react';
import {checkForLoggedInUser} from './helpers/loginHelpers';
import RNFS from 'react-native-fs';
import {
  SafeAreaView,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
//import {Platform} from 'react-native';

import watermelonDatabase from './watermelon/getWatermelonDb';
import LoginScreen from './Screens/LoginScreen';
import RegisterScreen from './Screens/RegisterScreen';
import SyncIndicator from './components/SyncIndicator';
import {sync} from './watermelon/sync';
// import User from './watermelon/models'
import {hasUnsyncedChanges} from '@nozbe/watermelondb/sync';
import {NavigationContainer, DarkTheme} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import TabNavigator from './components/Navigation/TabNavigator';
import {handleLogOut} from './helpers/logoutHelpers';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
function App(): JSX.Element {
  const [user, setUser] = React.useState<any>(null);
  const [isRegistering, setisRegistering] = React.useState<boolean>(true);

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const seedPgTables = async () => {
    try {
      console.log('seedingPgTables');
      const response = await fetch('http://localhost:5500/api/seed');
      const data = await response.json();
      console.log(data);
    } catch (error: any) {
      console.error(
        'Error in gettingPGTables function, app.tsx',
        error.message
      );
    }
  };
  // async function checkUnsyncedChanges() {
  //   const database = watermelonDatabase;
  //   await hasUnsyncedChanges({database});
  // }

  useEffect(() => {
    // Do something with the Watermelon database instance
    const onLoad = async () => {
      try {
        const dbFilePath = `${RNFS.DocumentDirectoryPath}/TrailTasks.db`;
        console.log(`The database file is located at: ${dbFilePath}`);
        //await seedPgTables();
        console.log('Watermelon database:', watermelonDatabase);
        await checkForLoggedInUser(setUser);
        // await sync();
        // await checkUnsyncedChanges()
      } catch (err: any) {
        console.log('Error in onload in APP useEffect', err.message);
      }
    };
    if (!user && watermelonDatabase) {
      onLoad();
    }
  }, [user]);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <NavigationContainer theme={DarkTheme}>
        <SafeAreaView style={[backgroundStyle, styles.container]}>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={backgroundStyle.backgroundColor}
          />
          {/* <SyncIndicator /> */}
          {user && user.userId ? (
            <TabNavigator />
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
          {user ? (
            <Pressable
              onPress={() => handleLogOut(setUser)}
              style={styles.button}>
              <Text>Logout</Text>
            </Pressable>
          ) : (
            <></>
          )}
        </SafeAreaView>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  button: {
    padding: 10,
    marginTop: 20,
    borderWidth: 2,
    borderColor: 'green',
    borderRadius: 10,
    backgroundColor: 'green',
  },
});

export default App;
