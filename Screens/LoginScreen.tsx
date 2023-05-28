import {StyleSheet, Text, SafeAreaView, View} from 'react-native';
import Login from '../components/Login';
import React from 'react';
interface Props
{
  setUserId: React.Dispatch<React.SetStateAction<any>>;
  setisRegistering: React.Dispatch<React.SetStateAction<any>>;
  isRegistering: boolean;
}

const LoginScreen = ({setUserId, setisRegistering, isRegistering}: Props) => {
  return (
    <SafeAreaView style={styles.container}>
      <Login
        setUserId={setUserId}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
});
