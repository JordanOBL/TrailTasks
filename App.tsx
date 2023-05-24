import 'react-native-gesture-handler';
import DatabaseProvider from '@nozbe/watermelondb/DatabaseProvider';
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


import LoginScreen from './Screens/LoginScreen';
import RegisterScreen from './Screens/RegisterScreen';
import SyncIndicator from './components/SyncIndicator';
import {sync} from './watermelon/sync';
// import User from './watermelon/models'
import {hasUnsyncedChanges} from '@nozbe/watermelondb/sync';
import {NavigationContainer, DarkTheme} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import TabNavigator from './components/Navigation/TabNavigator';

import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Database} from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import schema from './watermelon/schema';
// import your Models here
import {
  Park,
  Trail,
  User,
  Park_State,
  Badge,
  Achievement,
  User_Achievement,
  Completed_Hike,
  Hiking_Queue,
  User_Miles,
  User_Badge,
  Session_Category,
  User_Session,
} from './watermelon/models';

function App(): JSX.Element {
  const [user, setUser] = React.useState<any>(null);
  const [isRegistering, setisRegistering] = React.useState<boolean>(true);

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const adapter = new SQLiteAdapter({
    schema,
    dbName: 'TrailTasks',
  });

  const watermelonDatabase = new Database({
    adapter,
    modelClasses: [
      Park,
      Trail,
      User,
      Park_State,
      Badge,
      Achievement,
      User_Achievement,
      Completed_Hike,
      Hiking_Queue,
      User_Miles,
      User_Badge,
      Session_Category,
      User_Session,
    ],
  });

  //insert postgres tables
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
        await checkForLoggedInUser(setUser, watermelonDatabase);
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
      <DatabaseProvider database={watermelonDatabase}>
        <NavigationContainer theme={DarkTheme}>
          <SafeAreaView style={[backgroundStyle, styles.container]}>
            <StatusBar
              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
              backgroundColor={backgroundStyle.backgroundColor}
            />
            {/* <SyncIndicator delay={0} />  */}
            <Text style={styles.title}>Trail Tasks</Text>
            {user && user.userId ? (
              <TabNavigator setUser={setUser} />
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
      </DatabaseProvider>
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
