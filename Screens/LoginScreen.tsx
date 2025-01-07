import { Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import LoginForm from '../components/Auth/LoginForm';
import React from 'react';
import NationalParksInfiniteScroll from "../components/NationalParksInfiniteScroll";
import {useDatabase} from '@nozbe/watermelondb/react';
import {withObservables} from '@nozbe/watermelondb/react';
import {useAuthContext} from '../services/AuthContext';
interface Props {
  onChangeForm: () => void;
}

const LoginScreen = ({ handleFormChange }: Props) => {
  const watermelonDatabase = useDatabase();
  const {login, error}  = useAuthContext();
  //state
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleLogin = async () => {
    await login(email, password);
  }

  return (
      <SafeAreaView testID="login-screen" style={styles.container}>
        <View style={styles.imageContainer}>
          <Image source={require('../assets/LOGO.png')} style={styles.image} />
          <Text style={styles.title}>Trail Tasks</Text>
        </View>
        <NationalParksInfiniteScroll />
        <View style={styles.loginContainer}>
          <LoginForm
          email={email}
          password={password}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onFormChange={handleFormChange}
          error={error}
          onLoginPress={handleLogin}          
        />
        </View>
      </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'black', // Ensure the background color matches the login component
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 5,
    borderColor: 'grey', // Adjusted to ensure circular shape with the new size
  },
  title: {
    fontSize: 32, // Big font size
    fontWeight: 'bold', // Bold text
    color: 'white', // White color
    marginTop: 30, // Add some space between the image and the title
  },
  loginContainer: {
    width: '100%', // Make sure the login form takes the full width
    alignItems: 'center', // Center the login form
  },
});
