import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import React, {useState} from 'react';

import {handleLogin} from '../helpers/loginHelpers';
import {useDatabase} from '@nozbe/watermelondb/react';
interface Props {
  setUser: React.Dispatch<React.SetStateAction<any>>;
  setisRegistering: React.Dispatch<React.SetStateAction<any>>;
  isRegistering: boolean;
}
const Login = ({setUser, setisRegistering, isRegistering}: Props) => {
  const watermelonDatabase = useDatabase();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLoginPress = () => {
    handleLogin({email, password, setUser, setError, watermelonDatabase});
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        textContentType="emailAddress"
        style={styles.input}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry={true}
        textContentType="password"
        style={styles.input}
      />
      <Pressable
        onPress={handleLoginPress}
        disabled={!email || !password}
        style={[
          styles.button,
          {backgroundColor: !email || !password ? 'grey' : 'rgb(7,254,213)', marginVertical: 10},
        ]}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>
      <Pressable
        onPress={() => setisRegistering((prev:boolean) => !prev)}
        style={[
          styles.button,
          {backgroundColor: 'rgb(61,63,65)', borderWidth: 0},
        ]}>
        <Text style={styles.buttonText}>
          {isRegistering ? 'Login' : 'Create Account'}
        </Text>
      </Pressable>
      <Text style={styles.error}>{error || ''}</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%', // Full width to match parent
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black', // Match the background color
    paddingHorizontal: 20, // Add some padding to the sides
  },
  input: {
    width: '100%', // Full width to match container
    padding: 15,
    fontSize: 18,
    color: 'white',
    backgroundColor: 'rgb(31,33,35)',
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    width: '100%', // Full width to match container
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

export default Login;
