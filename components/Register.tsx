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
    const ExistingUser = await watermelonDatabase
      .get('users')
      .query(
        Q.or(
          Q.where('email', emailRef.current.value),
          Q.where('username', usernameRef.current.value),
        ),
      )
      .fetch();
    return ExistingUser;
  };
  const createNewUser = async () => {
    const current_trail_start = formatDateTime(new Date());
    //!BCYPT PASSWORD BEFORE ADDING TO DB
    const newUser = await watermelonDatabase.write(async () => {
      const createdUser = await watermelonDatabase.get('users').create(user => {
        //!crypto.randomUUID for user_id
        user.first_name = firstNameRef.current!.value;
        user.last_name = lastNameRef.current!.value;
        user.email = emailRef.current!.value;
        user.password = passwordRef.current!.value;
        user.username = usernameRef.current?.value;
        user.push_notifications_enabled.set(true);
        user.theme_preference.set('light');
        user.current_trail_id.set(1);
        user.current_trail_progress.set(0.0);
        user.current_trail_start.set(current_trail_start);
      });

      //const createdUser = user.createUser(user.user_id,
      // username,
      // firstName,
      // lastName,
      // email,
      // password,
      // current_trail_start)

      return createdUser;
    });
    console.log({newUser});
    // if (newUser) {
    //   await watermelonDatabase.localStorage.set('user_id', newUser.user_id);
    //   await watermelonDatabase.localStorage.set('username', newUser.username);
    // }
  };

  const handleRegister = async (): Promise<void> => {
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

    //create new user
    if (ExistingUser.length === 0) {
      const createdUser = await createNewUser();
      if (createdUser!) {
        console.log('user successfully registered');
        //? set user_id and name in watermelonDatabase.localStorage
        return;
      }
    } else if (ExistingUser && ExistingUser.email === emailRef.current.value) {
      setError('User Already Exists With Provided Email, Please Login');
      return;
    } else if (
      ExistingUser &&
      ExistingUser.username === usernameRef.current?.value
    ) {
      setError('User Already Exists With Username, Please Choose New Username');
      return;
    }
  };

  return (
    <View>
      <TextInput
        ref={firstNameRef}
        value={firstName}
        onChangeText={value => setFirstName(value)}
        placeholder="First Name"
      />
      <TextInput
        ref={lastNameRef}
        value={lastName}
        onChangeText={value => setLastName(value)}
        placeholder="Last Name"
      />
      <TextInput
        ref={emailRef}
        value={email}
        onChangeText={value => setEmail(value)}
        placeholder="Email"
        keyboardType="email-address"
      />
      <TextInput
        ref={passwordRef}
        value={password}
        onChangeText={value => setPassword(value)}
        placeholder="Password"
        secureTextEntry={true}
      />
      <TextInput
        ref={confirmPasswordRef}
        value={confirmPassword}
        onChangeText={value => setConfirmPassword(value)}
        placeholder="Confirm Password"
        secureTextEntry={true}
      />
      <TextInput
        ref={usernameRef}
        value={username}
        onChangeText={value => setUsername(value)}
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
