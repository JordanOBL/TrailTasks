import {
  StyleSheet,
  Text,
  SafeAreaView,
  Pressable,
  TextInput,
} from 'react-native';
import * as React from 'react';
import {Q} from '@nozbe/watermelondb';

import watermelonDatabase from '../watermelon/getWatermelonDb';
interface Props
{
  setUser: React.Dispatch<React.SetStateAction<any>>;
  setisRegistering: React.Dispatch<React.SetStateAction<any>>;
  isRegistering: boolean;
}

const Login = ({setUser, setisRegistering, isRegistering}: Props) => {
  const [email, setEmail] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [error, setError] = React.useState<any>(null);
  // const [username, setUsername] = React.useState<string>('');

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
          existingUser[0].id
        );
        await watermelonDatabase.localStorage.set(
          'username',
          existingUser[0].username
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
      setUser({userId: existingUser._raw.id});
    } catch (err) {
      console.error('Error in handling Login', err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        value={email}
        onChangeText={(value) => setEmail(value)}
        placeholder="Email"
        keyboardType="email-address"
        textContentType="emailAddress"
        style={styles.input}
      />
      <TextInput
        value={password}
        onChangeText={(value) => setPassword(value)}
        placeholder="Password"
        secureTextEntry={true}
        textContentType="password"
        style={styles.input}
      />

      <Pressable onPress={() => handleLogin()} style={styles.button}>
        <Text style={{fontSize: 20, color: 'white'}}>Login</Text>
      </Pressable>
      <Pressable
        onPress={() => setisRegistering((prev: boolean) => !prev)}
        style={[styles.button, {backgroundColor: "blue"}]}>
        <Text style={{color: 'white'}}>
          {isRegistering ? 'Login' : 'Create an Account'}
        </Text>
      </Pressable>
      <Text style={styles.error}>{error || ''}</Text>
    </SafeAreaView>
  );
};

export default Login;
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
    backgroundColor: 'green'

  },
  error: {
    color: 'red',
  },
});
