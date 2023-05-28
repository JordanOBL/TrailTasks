import {
  StyleSheet,
  Text,
  SafeAreaView,
  Pressable,
  TextInput,
} from 'react-native';
import * as React from 'react';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import {sync} from '../watermelon/sync';
import SyncLogger from '@nozbe/watermelondb/sync/SyncLogger';
const logger = new SyncLogger(10 /* limit of sync logs to keep in memory */);
import {handleRegister} from '../helpers/registerHelpers';
interface Props {
  setUserId: React.Dispatch<React.SetStateAction<any>>;
  setisRegistering: React.Dispatch<React.SetStateAction<any>>;
  isRegistering: boolean;
}
const Register = ({setUserId, setisRegistering, isRegistering}: Props) => {
  const watermelonDatabase = useDatabase();
  const [firstName, setFirstName] = React.useState<string>('');
  const [lastName, setLastName] = React.useState<string>('');
  const [email, setEmail] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [confirmPassword, setConfirmPassword] = React.useState<string>('');
  const [error, setError] = React.useState<any>(null);
  const [username, setUsername] = React.useState<string>('');

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        value={firstName}
        onChangeText={(text) => setFirstName(text)}
        placeholder="First Name"
        placeholderTextColor={'rgba(255, 255, 255, .1)'}
        style={styles.input}
      />
      <TextInput
        value={lastName}
        onChangeText={(text) => setLastName(text)}
        placeholder="Last Name"
        placeholderTextColor={'rgba(255, 255, 255, .1)'}
        style={styles.input}
      />
      <TextInput
        value={email}
        onChangeText={(text) => setEmail(text)}
        placeholder="Email"
        placeholderTextColor={'rgba(255, 255, 255, .1)'}
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        value={password}
        onChangeText={(text) => setPassword(text)}
        placeholder="Password"
        placeholderTextColor={'rgba(255, 255, 255, .1)'}
        secureTextEntry={true}
        style={styles.input}
      />
      <TextInput
        value={confirmPassword}
        onChangeText={(text) => setConfirmPassword(text)}
        placeholder="Confirm Password"
        placeholderTextColor={'rgba(255, 255, 255, .1)'}
        secureTextEntry={true}
        style={styles.input}
      />
      <TextInput
        value={username}
        onChangeText={(text) => setUsername(text)}
        placeholder="Username"
        placeholderTextColor={'rgba(255, 255, 255, .1)'}
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
            setUserId,
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
        <Text style={{fontSize: 20, color: 'black', fontWeight: 'bold'}}>
          Create Account
        </Text>
      </Pressable>
      <Pressable
        onPress={() => setisRegistering((prev: boolean) => !prev)}
        style={[styles.button, {backgroundColor: 'rgb(61,63,65)',  borderWidth: 0}]}>
        <Text style={{color: 'black', fontWeight: 'bold'}}>
          {isRegistering ? 'Login' : 'Create an Account'}
        </Text>
      </Pressable>
      <Text style={styles.error}>{error || ''}</Text>
    </SafeAreaView>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    padding: 10,
    fontSize: 30,
    color: 'rgb(7,254,213)',
  },
  button: {
    padding: 10,
    marginTop: 20,
    fontWeight: 'bold',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgb(7,254,213)',
    backgroundColor: 'rgb(7,254,213)',
    width: 200,
    alignItems: 'center',
  },
  error: {
    color: 'red',
  },
});
