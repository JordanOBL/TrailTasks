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
interface Props {
  setUser: React.Dispatch<React.SetStateAction<any>>;
}
const Login = ({setUser}: Props) => {

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
      />
      <TextInput
        value={password}
        onChangeText={(value) => setPassword(value)}
        placeholder="Password"
        secureTextEntry={true}
        textContentType="password"
      />

      <Pressable onPress={() => handleLogin()}>
        <Text>Login</Text>
      </Pressable>
      <Text style={styles.error}>{error || ''}</Text>
    </SafeAreaView>
  );
};

export default Login;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  error: {
    color: 'red',
  },
});
