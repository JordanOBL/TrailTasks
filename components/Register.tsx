import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import React, {useState, useEffect} from 'react';

import SyncLogger from '@nozbe/watermelondb/sync/SyncLogger';
import {handleRegister} from '../helpers/registerHelpers';
import {sync} from '../watermelon/sync';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import checkInternetConnection from '../helpers/InternetConnection/checkInternetConnection.ts'
const logger = new SyncLogger(10 /* limit of sync logs to keep in memory */);
interface Props {
  setUser: React.Dispatch<React.SetStateAction<any>>;
  setisRegistering: React.Dispatch<React.SetStateAction<any>>;
  isRegistering: boolean;
}
const Register = ({setUser, setisRegistering, isRegistering}: Props) => {
  const watermelonDatabase = useDatabase();
  const [isConnectedToInternet, setIsConnectedToInternet] = useState();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');

   const [refreshing, setRefreshing] = useState(true); // State to manage refreshing

useEffect(() => {
  // Check internet connection when component mounts
  if(refreshing){
  checkInternetConnection().then(({ connection }) => {
    if (connection) {
      setIsConnectedToInternet(connection.isConnected);
      console.debug(connection.isConnected);
    }
  }).catch(error => {
    console.error('Error checking internet connection:', error);
    setIsConnectedToInternet(false);
  });

    setRefreshing(false)
  }
  
  return () => {
    // Clean up when component unmounts
  };
}, [refreshing]);

  
// Function to refresh internet connection status
//  const refreshConnection = async () => {
//    const { connection } =  await checkInternetConnection();
//    if(connection){
//      setIsConnectedToInternet(connection.isConnected);
//    }
//    setRefreshing(false);
//  };


  return (
   isConnectedToInternet ? ( 
    <SafeAreaView style={styles.container}>
      <TextInput
        value={firstName}
        onChangeText={setFirstName}
        placeholder="First Name"
        placeholderTextColor={'rgba(255, 255, 255, .5)'}
        style={styles.input}
      />
      <TextInput
        value={lastName}
        onChangeText={setLastName}
        placeholder="Last Name"
        placeholderTextColor={'rgba(255, 255, 255, .5)'}
        style={styles.input}
      />
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor={'rgba(255, 255, 255, .5)'}
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor={'rgba(255, 255, 255, .5)'}
        secureTextEntry={true}
        style={styles.input}
      />
      <TextInput
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm Password"
        placeholderTextColor={'rgba(255, 255, 255, .5)'}
        secureTextEntry={true}
        style={styles.input}
      />
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        placeholderTextColor={'rgba(255, 255, 255, .5)'}
        style={styles.input}
      />
      <Pressable
        disabled={
          !email ||
          !password ||
          !confirmPassword ||
          !firstName ||
          !lastName ||
          !username
        }
        onPress={() =>
          handleRegister({
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            username,
            setUser,
            setError,
            watermelonDatabase,
          }).then(() =>
            sync(watermelonDatabase)
              .then((res) => console.log(res))
              .catch((err) => console.error(err))
          )
        }
        style={[
          styles.button,
          {
            backgroundColor:
              !email ||
              !password ||
              !confirmPassword ||
              !firstName ||
              !lastName ||
              !username
                ? 'grey'
                : 'rgb(7,254,213)',
          },
        ]}>
        <Text style={styles.buttonText}>Create Account</Text>
      </Pressable>
      <Pressable
        onPress={() => setisRegistering((prev:boolean) => !prev)}
        style={[
          styles.button,
          {backgroundColor: 'rgb(61,63,65)', borderWidth: 0},
        ]}>
        <Text style={styles.buttonText}>
          {isRegistering ? 'Login' : 'Create an Account'}
        </Text>
      </Pressable>
      <Text style={styles.error}>{error || ''}</Text>
    </SafeAreaView>
    ) :(
/* Render offline message if not connected */
        <SafeAreaView style={[styles.container, {display: 'flex', flexDirection: 'column', justifyContent: 'center'}]}>
          <Text style={{color: "white", fontSize: 20, padding: 8, margin: 12, textAlign: 'center'}}>You need an internet connection to register.</Text>
          <Pressable onPress={() => setRefreshing(prev => !refreshing)} style={[
          styles.button,
          {
            backgroundColor: 'rgba(30, 139, 195, .7)', marginVertical: 12
          },
        ]} >
            <Text style={styles.buttonText}>Refresh Connection</Text>
          
          </Pressable>
         <Pressable
            onPress={() => setisRegistering((prev:boolean) => !prev)}
            style={[
              styles.button,
              {backgroundColor: 'rgb(7,254,213)', borderWidth: 0},
            ]}>
            <Text style={styles.buttonText}>
              {'Login'}
          </Text>
        </Pressable>


          
        </SafeAreaView>
    )
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  input: {
    width: '80%',
    padding: 15,
    fontSize: 18,
    color: 'white',
    backgroundColor: 'rgba(31, 33, 35, 0.5)',
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  error: {
    marginTop: 20,
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Register;
