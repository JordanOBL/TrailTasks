import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import React, {useState} from 'react';

const Login = ({email, password, onEmailChange, onPasswordChange, onFormChange, error, onLoginPress}) => {
  return (
    <SafeAreaView testID="login-form" style={styles.container}>
      <TextInput
        testID="email-input"
        value={email}
        onChangeText={onEmailChange}
        placeholder="Email"
        keyboardType="email-address"
        textContentType="emailAddress"
        style={styles.input}
      />
      <TextInput
        testID="password-input"
        value={password}
        onChangeText={onPasswordChange}
        placeholder="Password"
        secureTextEntry={true}
        textContentType="password"
        style={styles.input}
      />
      <Pressable
        testID="login-button"
        onPress={onLoginPress}
        disabled={!email || !password}
        style={[
          styles.button,
          {backgroundColor: !email || !password ? 'grey' : 'rgb(7,254,213)', marginVertical: 10},
        ]}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>
      <Pressable
        testID="register-form-button"
        onPress={onFormChange}
        style={[
          styles.button,
          {backgroundColor: 'rgb(61,63,65)', borderWidth: 0},
        ]}>
        <Text style={styles.buttonText}>
          Create Account
        </Text>
      </Pressable>
      <Text testID="login-error" style={styles.error}>{error || ''}</Text>
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
