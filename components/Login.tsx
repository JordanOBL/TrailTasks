import {StyleSheet, Text, View, Pressable, TextInput} from 'react-native';
import * as React from 'react';
import {Database, Q} from '@nozbe/watermelondb';
import useWatermelonDb from '../watermelon/getWatermelonDb';

const Login = () => {
  const watermelonDatabase: Database = useWatermelonDb();

  // const [firstName, setFirstName] = React.useState<string>('');
  // const [lastName, setLastName] = React.useState<string>('');
  const [email, setEmail] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [error, setError] = React.useState<any>(null);
  // const [username, setUsername] = React.useState<string>('');

  const emailRef = React.useRef<any>();
  const passwordRef = React.useRef<any>();

  const checkExistingUser = async () => {
    try {
      const existingUser = await watermelonDatabase
        .get('users')
        // .query(Q.and(Q.where('email', email), Q.where('password', password)))
        .query(Q.where('email', email))
        .fetch();
      if (existingUser.length > 0) {
        await watermelonDatabase.localStorage.set(
          'user_id',
          existingUser[0].id,
        );
        await watermelonDatabase.localStorage.set(
          'username',
          existingUser[0].username,
        );
        return existingUser[0];
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogin = async (): Promise<void> => {
    try {
      if (email.trim() === '' || password.trim() === '') {
        setError('All fields are required');
        return;
      }
      // add your WatermelonDB logic here
      //check for exitsing user
      const existingUser = await checkExistingUser();

      //create new user
      if (!existingUser) {
        setError('Invalid Email or Password');
        return;
      }
      console.log('successful Login', existingUser);
      //! SET WATERMELON LOCAL STORAGE
      //! NAVIGATE TO HOME SCREEN
    } catch (err) {
      console.error('Error in handling Login', err);
    }
  };

  return (
    <View>
      <TextInput
        ref={emailRef}
        value={email}
        onChangeText={value => setEmail(value)}
        placeholder="Email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <TextInput
        ref={passwordRef}
        value={password}
        onChangeText={value => setPassword(value)}
        placeholder="Password"
        secureTextEntry={true}
        textContentType="password"
      />

      <Pressable onPress={() => handleLogin()}>
        <Text>Login</Text>
      </Pressable>
      <Text style={styles.error}>{error || ''}</Text>
    </View>
  );
};

export default Login;
const styles = StyleSheet.create({
  error: {
    color: 'red',
  },
});
