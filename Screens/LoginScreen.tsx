import {SafeAreaView, StyleSheet, Text, View} from 'react-native';

import Login from '../components/Login';
import React from 'react';

interface Props
{
  setUser: React.Dispatch<React.SetStateAction<any>>;
  setisRegistering: React.Dispatch<React.SetStateAction<any>>;
  isRegistering: boolean;
}

const LoginScreen = ({setUser, setisRegistering, isRegistering}: Props) => {
  return (
    <SafeAreaView style={styles.container}>
      <Login
        setUser={setUser}
        setisRegistering={setisRegistering}
        isRegistering={isRegistering}
      />
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
