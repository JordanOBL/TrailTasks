import {
  StyleSheet,
  Text,
  SafeAreaView,
  Pressable,
  TextInput,
} from 'react-native';
import * as React from 'react';
import {Q} from '@nozbe/watermelondb';
//import useWatermelonDb from '../watermelon/getWatermelonDb';
import watermelonDatabase from '../watermelon/getWatermelonDb';
import {formatDateTime} from './DateTime';
import {sync} from '../watermelon/sync';
import SyncLogger from '@nozbe/watermelondb/sync/SyncLogger';
const logger = new SyncLogger(10 /* limit of sync logs to keep in memory */);
interface Props {
  setUser: React.Dispatch<React.SetStateAction<any>>;
  setisRegistering: React.Dispatch<React.SetStateAction<any>>;
  isRegistering: boolean;
}
const Register = ({setUser, setisRegistering, isRegistering}: Props) => {
  //const watermelonDatabase: Database = useWatermelonDb();

  const [firstName, setFirstName] = React.useState<string>('');
  const [lastName, setLastName] = React.useState<string>('');
  const [email, setEmail] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [confirmPassword, setConfirmPassword] = React.useState<string>('');
  const [error, setError] = React.useState<any>(null);
  const [username, setUsername] = React.useState<string>('');

  const firstNameRef = React.useRef<any>();
  const lastNameRef = React.useRef<any>();
  const emailRef = React.useRef<any>();
  const passwordRef = React.useRef<any>();
  const confirmPasswordRef = React.useRef<any>();
  const usernameRef = React.useRef<any>();

  const checkExistingUser = async () => {
    try {
      const ExistingUser = await watermelonDatabase
        .get('users')
        .query(Q.or(Q.where('email', email), Q.where('username', username)))
        .fetch();
      return ExistingUser;
    } catch (err) {
      console.error(
        'Error in checking for existing user in user register',
        err
      );
    }
  };

  const createNewUser = async () => {
    try {
      const current_trail_start = new Date().toISOString();
      //!BCYPT PASSWORD BEFORE ADDING TO DB
      const newUser = await watermelonDatabase.write(async () => {
        const createdUser = await watermelonDatabase
          .get('users')
          .create((user) => {
            user.firstName = firstName;
            user.lastName = lastName;
            user.email = email;
            user.password = password;
            user.username = username;
            user.pushNotificationsEnabled = true;
            user.themePreference = 'light';
            user.trailId = '1';
            user.trailProgress = '0.0';
            user.trailStartedAt = current_trail_start;
            user.createdAt = current_trail_start;
            user.updatedAt = current_trail_start;
          });

        if (createdUser) {
          const userMiles = await watermelonDatabase
            .get('users_miles')
            .create((user_miles) => {
              user_miles.userId = createdUser._raw.id;
              user_miles.totalMiles = '0.00';
            });
        }

        return createdUser;
      });

      if (newUser.id.length > 0) {
        await watermelonDatabase.localStorage.set('user_id', newUser.id);
        await watermelonDatabase.localStorage.set('username', newUser.username);
        setUser({userId: newUser.id});
        return newUser;
      }
    } catch (err) {
      console.error('error creating new registered user', err);
    }
  };

  const handleRegister = async (): Promise<void> => {
    try {
      if (
        firstName.trim() === '' ||
        lastName.trim() === '' ||
        email.trim() === '' ||
        password.trim() === '' ||
        confirmPassword.trim() === ''
      ) {
        setError('All fields are required');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      //check for exitsing user
      const ExistingUser = await checkExistingUser();
      //create new user
      if (ExistingUser!.length === 0) {
        const createdUser = await createNewUser();

        if (createdUser!) {
          return;
        }
      } else if (ExistingUser && ExistingUser[0].email === email) {
        setError('User Already Exists With Provided Email, Please Login');
        return;
      } else if (ExistingUser && ExistingUser[0].username === username) {
        setError(
          'User Already Exists With Username, Please Choose New Username'
        );
        return;
      }
    } catch (err) {
      console.error('Error in handle Register', err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        ref={firstNameRef}
        value={firstName}
        onChangeText={(text) => setFirstName(text)}
        placeholder="First Name"
        style={styles.input}
      />
      <TextInput
        ref={lastNameRef}
        value={lastName}
        onChangeText={(text) => setLastName(text)}
        placeholder="Last Name"
        style={styles.input}
      />
      <TextInput
        ref={emailRef}
        value={email}
        onChangeText={(text) => setEmail(text)}
        placeholder="Email"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        ref={passwordRef}
        value={password}
        onChangeText={(text) => setPassword(text)}
        placeholder="Password"
        secureTextEntry={true}
        style={styles.input}
      />
      <TextInput
        ref={confirmPasswordRef}
        value={confirmPassword}
        onChangeText={(text) => setConfirmPassword(text)}
        placeholder="Confirm Password"
        secureTextEntry={true}
        style={styles.input}
      />
      <TextInput
        ref={usernameRef}
        value={username}
        onChangeText={(text) => setUsername(text)}
        placeholder="Username"
        style={styles.input}
      />
      <Pressable
        onPress={() =>
          handleRegister().then(() =>
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
