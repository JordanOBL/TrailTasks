import { Image, SafeAreaView, StyleSheet, Text, View, ActivityIndicator} from 'react-native';
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
  const {login, error, loading}  = useAuthContext();
  //state
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
        <ActivityIndicator size="large" color='#13B3AC' />
      </View>
    );
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
          onLoginPress={() => login(email, password)}          
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
  width: 160,
  height: 160,
  borderRadius: 80,
  borderWidth: 3,
  borderColor: 'rgb(7,254,213)',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 6,
},
title: {
  fontSize: 28,
  fontWeight: 'bold',
  color: 'white',
  marginTop: 20,
  letterSpacing: 1.2,
},
loginContainer: {
  width: '90%',
  paddingTop: 10,
},});
