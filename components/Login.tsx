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

  const emailRef = React.useRef<any>(null);
  const passwordRef = React.useRef<any>(null);

  const checkExistingUser = async () => {
    const ExistingUser = await watermelonDatabase
      .get('users')
      .query(
        Q.or(
          Q.where('email', emailRef.current.value),
          Q.where('password', passwordRef.current.value),
        ),
      )
      .fetch();
    return ExistingUser;
  };

  const handleLogin = async (): Promise<void> => {
    if (email.trim() === '' || password.trim() === '') {
      setError('All fields are required');
      return;
    }
    // add your WatermelonDB logic here
    //check for exitsing user
    const ExistingUser = await checkExistingUser();

    //create new user
    if (ExistingUser.length === 0) {
      setError('Invalid Email or Password');
      return;
    }
    console.log('successful Login', {ExistingUser});
    //! SET WATERMELON LOCAL STORAGE
    //! NAVIGATE TO HOME SCREEN
  };

  return (
    <View>
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
