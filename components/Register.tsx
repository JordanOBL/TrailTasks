import {
  StyleSheet,
  Text,
  SafeAreaView,
  Pressable,
  TextInput,
} from 'react-native';
import * as React from 'react';
import {sync} from '../watermelon/sync';
import SyncLogger from '@nozbe/watermelondb/sync/SyncLogger';
const logger = new SyncLogger(10 /* limit of sync logs to keep in memory */);
import {handleRegister} from '../helpers/registerHelpers';
interface Props {
  setUser: React.Dispatch<React.SetStateAction<any>>;
  setisRegistering: React.Dispatch<React.SetStateAction<any>>;
  isRegistering: boolean;
}
const Register = ({setUser, setisRegistering, isRegistering}: Props) => {

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
        style={styles.input}
      />
      <TextInput
        value={lastName}
        onChangeText={(text) => setLastName(text)}
        placeholder="Last Name"
        style={styles.input}
      />
      <TextInput
        value={email}
        onChangeText={(text) => setEmail(text)}
        placeholder="Email"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        value={password}
        onChangeText={(text) => setPassword(text)}
        placeholder="Password"
        secureTextEntry={true}
        style={styles.input}
      />
      <TextInput
        value={confirmPassword}
        onChangeText={(text) => setConfirmPassword(text)}
        placeholder="Confirm Password"
        secureTextEntry={true}
        style={styles.input}
      />
      <TextInput
        value={username}
        onChangeText={(text) => setUsername(text)}
        placeholder="Username"
        style={styles.input}
      />
      <Pressable
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
          }).then(() =>
            sync()
              .then((res) => console.log(res))
              .catch((err) => console.error(err))
          )
        }
        style={styles.button}>
        <Text style={{fontSize: 20, color: 'white'}}>Create Account</Text>
      </Pressable>
      <Pressable
        onPress={() => setisRegistering((prev: boolean) => !prev)}
        style={[styles.button, {backgroundColor: 'blue'}]}>
        <Text style={{color: 'white'}}>
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
  },
  button: {
    padding: 10,
    marginTop: 20,
    borderWidth: 2,
    borderColor: 'green',
    borderRadius: 10,
    backgroundColor: 'green',
  },
  error: {
    color: 'red',
  },
});
