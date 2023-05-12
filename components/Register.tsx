import {StyleSheet, Text, View, Pressable, TextInput} from 'react-native';
import * as React from 'react';
import {Database, Q} from '@nozbe/watermelondb';
import useWatermelonDb from '../watermelon/getWatermelonDb';
import {formatDateTime} from './DateTime';

const Register = () => {
  const watermelonDatabase: Database = useWatermelonDb();

  const [firstName, setFirstName] = React.useState<string>('');
  const [lastName, setLastName] = React.useState<string>('');
  const [email, setEmail] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [confirmPassword, setConfirmPassword] = React.useState<string>('');
  const [error, setError] = React.useState<any>(null);
  const [username, setUsername] = React.useState<string>('');

  const firstNameRef = React.useRef<any>(null);
  const lastNameRef = React.useRef<any>(null);
  const emailRef = React.useRef<any>(null);
  const passwordRef = React.useRef<any>(null);
  const confirmPasswordRef = React.useRef<any>(null);
  const usernameRef = React.useRef<any>(null);

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
        err,
      );
    }
  };
  const createNewUser = async () => {
    const current_trail_start = formatDateTime(new Date());
    //!BCYPT PASSWORD BEFORE ADDING TO DB
    const newUser = await watermelonDatabase.write(async () => {
      const createdUser = await watermelonDatabase.get('users').create(user => {
        //!crypto.randomUUID for user_id
        user.first_name = firstName;
        user.last_name = lastName;
        user.email = email;
        user.password = password;
        user.username = username;
        user.push_notifications_enabled = true;
        user.theme_preference = 'light';
        user.current_trail_id = 1;
        user.current_trail_progress = '0.0';
        user.current_trail_start = current_trail_start;
      });

      //const createdUser = user.createUser(user.user_id,
      // username,
      // firstName,
      // lastName,
      // email,
      // password,
      // current_trail_start)
      console.log(createdUser);
      return createdUser;
    });
    console.log({newUser});
    if (newUser.id.length > 0) {
      await watermelonDatabase.localStorage.set('user_id', newUser._id);
      await watermelonDatabase.localStorage.set('username', newUser._username);
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
      // add your WatermelonDB logic here
      //check for exitsing user
      const ExistingUser = await checkExistingUser();
      console.log({ExistingUser});
      //create new user
      if (ExistingUser.length === 0) {
        const createdUser = await createNewUser();
        if (createdUser!) {
          console.log('user successfully registered');
          //? set user_id and name in watermelonDatabase.localStorage
          return;
        }
      } else if (ExistingUser && ExistingUser.email === emailRef.current.text) {
        setError('User Already Exists With Provided Email, Please Login');
        return;
      } else if (ExistingUser && ExistingUser.username === username) {
        setError(
          'User Already Exists With Username, Please Choose New Username',
        );
        return;
      }
    } catch (err) {
      console.error('Error in handle Register', err);
    }
  };

  return (
    <View>
      <TextInput
        ref={firstNameRef}
        value={firstName}
        onChangeText={text => setFirstName(text)}
        placeholder="First Name"
      />
      <TextInput
        ref={lastNameRef}
        value={lastName}
        onChangeText={text => setLastName(text)}
        placeholder="Last Name"
      />
      <TextInput
        ref={emailRef}
        value={email}
        onChangeText={text => setEmail(text)}
        placeholder="Email"
        keyboardType="email-address"
      />
      <TextInput
        ref={passwordRef}
        value={password}
        onChangeText={text => setPassword(text)}
        placeholder="Password"
        secureTextEntry={true}
      />
      <TextInput
        ref={confirmPasswordRef}
        value={confirmPassword}
        onChangeText={text => setConfirmPassword(text)}
        placeholder="Confirm Password"
        secureTextEntry={true}
      />
      <TextInput
        ref={usernameRef}
        value={username}
        onChangeText={text => setUsername(text)}
        placeholder="Username"
      />
      <Pressable onPress={() => handleRegister()}>
        <Text>Create Account</Text>
      </Pressable>
      <Text style={styles.error}>{error || ''}</Text>
    </View>
  );
};

export default Register;

const styles = StyleSheet.create({
  error: {
    color: 'red',
  },
});
