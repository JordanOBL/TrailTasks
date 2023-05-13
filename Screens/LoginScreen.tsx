import {StyleSheet, Text, View} from 'react-native';
import Login from '../components/Login';
import React from 'react';

const LoginScreen = () => {
  return (
    <View style={styles.container}>
      <Text>LoginScreen</Text>
      <Login />
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {flex: 1},
});
