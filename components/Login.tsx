import {
  StyleSheet,
  Text,
  SafeAreaView,
  Pressable,
  TextInput,
} from 'react-native';
import * as React from 'react';
import {handleLogin} from '../helpers/loginHelpers';
import {useDatabase} from '@nozbe/watermelondb/hooks';

interface Props {
  setUser: React.Dispatch<React.SetStateAction<any>>;
  setisRegistering: React.Dispatch<React.SetStateAction<any>>;
  isRegistering: boolean;
}

const Login = ({ setUser, setisRegistering, isRegistering }: Props) =>
{
  const watermelonDatabase = useDatabase();

  const [email, setEmail] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [error, setError] = React.useState<any>(null);

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

      <Pressable
        onPress={() =>
          handleLogin({email, password, setUser, setError, watermelonDatabase})
        }
        disabled={!email || !password}
        style={[
          styles.button,
          {
            backgroundColor: !email || !password ? 'grey' : 'rgb(7,254,213)',
          },
        ]}>
        <Text style={{fontSize: 20, color: 'black', fontWeight: 'bold'}}>
          Login
        </Text>
      </Pressable>
      <Pressable
        onPress={() => setisRegistering((prev: boolean) => !prev)}
        style={[
          styles.button,
          {backgroundColor: 'rgb(61,63,65)', borderWidth: 0},
        ]}>
        <Text style={{color: 'black', fontWeight: 'bold'}}>
          {isRegistering ? 'Login' : 'Create Account'}
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
    color: 'rgb(7,254,213)'
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
