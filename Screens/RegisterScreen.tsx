import {StyleSheet, Text, View} from 'react-native';
import Register from '../components/Register';
import React from 'react';

const RegisterScreen = () => {
  return (
    <View style={styles.container}>
      <Text>RegisterScreen</Text>
      <Register />
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {flex: 1},
});
