import React, {useEffect} from "react";
//import type {PropsWithChildren} from 'react';
import RNFS from "react-native-fs";
import {
  SafeAreaView,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
} from "react-native";
import {Colors} from "react-native/Libraries/NewAppScreen";
//import {Platform} from 'react-native';
//import useWatermelonDb from './watermelon/getWatermelonDb';
import watermelonDatabase from "./watermelon/getWatermelonDb";
import LoginScreen from "./Screens/LoginScreen";
import RegisterScreen from "./Screens/RegisterScreen";
import SyncIndicator from "./components/SyncIndicator";
import { sync } from './watermelon/sync';
import User from './watermelon/models'
import {hasUnsyncedChanges} from '@nozbe/watermelondb/sync';


// type SectionProps = PropsWithChildren<{
//   title: string;
// }>;

// function Section({children, title}: SectionProps): JSX.Element {
//   const isDarkMode = useColorScheme() === 'dark';
//   return (
//     <View style={styles.sectionContainer}>
//       <Text
//         style={[
//           styles.sectionTitle,
//           {
//             color: isDarkMode ? Colors.white : Colors.black,
//           },
//         ]}>
//         {title}
//       </Text>
//       <Text
//         style={[
//           styles.sectionDescription,
//           {
//             color: isDarkMode ? Colors.light : Colors.dark,
//           },
//         ]}>
//         {children}
//       </Text>
//     </View>
//   );
// }

function App(): JSX.Element {
  const [user, setUser] = React.useState<any>(null);
  const [isRegistering, setisRegistering] = React.useState<boolean>(true);
  //const watermelonDatabase = useWatermelonDb();
  const isDarkMode = useColorScheme() === "dark";

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const checkForExistingUser = async () => {
    try {
      const userId = await watermelonDatabase.localStorage.get("user_id"); // string or undefined if no value for this key
      console.log("User info from local Storage", {userId});

      if (userId) {
        console.log("FOUND USER!");
        setUser({userId});
      }
      return;
    } catch (error) {
      console.error("Error in checkForUser function, app.tsx", error);
    }
  };

  // const getUserFirstName = async () => {
  //   const firstName = await watermelonDatabase
  //     .get('users')
  //     .query(Q.where('first_name', 'C'))
  //     .fetch();

  //   if (firstName.length > 0) {
  //     console.log(firstName);
  //   }
  // };
  const handleLogOut = async () => {
    try {
      await watermelonDatabase.localStorage.remove("user_id");
      await watermelonDatabase.localStorage.remove("username");
      setUser(null);
    } catch (error) {
      console.error("Error in handleLogOut function, app.tsx", error);
    }
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
async function checkUnsyncedChanges() {
  const database = watermelonDatabase;
  await hasUnsyncedChanges({database});
}

  useEffect(() =>
  {
    
    // Do something with the Watermelon database instance
    const onLoad = async () => {
      try {
        const dbFilePath = `${RNFS.DocumentDirectoryPath}/TrailTasks.db`;
        console.log(`The database file is located at: ${dbFilePath}`);
         //await seedPgTables();
        console.log("Watermelon database:", watermelonDatabase);
        //console.log(watermelonDatabase.withChangesForTables(["parks"]));
        //await checkForExistingUser();
        await sync();
        // await checkUnsyncedChanges()
        // await getUserFirstName();
        // Find the location of the database file

        // Log the location of the database file to the console
        
      } catch (err: any) {
        console.log("Error in onload in APP useEffect", err.message);
      }
    };
    if (!user && watermelonDatabase) {
      onLoad();
    }
  }, [user]);

  return (
    <SafeAreaView style={[backgroundStyle, styles.container]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      {/* <SyncIndicator /> */}
      {user && user.userId ? (
        <Text>LOGGED IN!</Text>
      ) : isRegistering ? (
        <RegisterScreen setUser={setUser} />
      ) : (
        <LoginScreen setUser={setUser} />
      )}
      <Pressable onPress={() => setisRegistering((prev: boolean) => !prev)}>
        <Text>{isRegistering ? 'Login' : 'Create an Account'}</Text>
      </Pressable>
      {user ? (
        <Pressable onPress={() => handleLogOut()}>
          <Text>Logout</Text>
        </Pressable>
      ) : (
        <></>
      )}
    </SafeAreaView>
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
    fontWeight: "600",
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "400",
  },
  highlight: {
    fontWeight: "700",
  },
});

export default App;
