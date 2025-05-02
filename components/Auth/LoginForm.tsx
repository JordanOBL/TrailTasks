import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import React, {useState} from 'react';

const LoginForm = ({email, password, onEmailChange, onPasswordChange, onFormChange, error, onLoginPress}) => {
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
     <Pressable testID="register-form-button" onPress={onFormChange}>
  <Text style={styles.linkText}>Don’t have an account? Create one</Text>
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
  width: '100%',
  padding: 14,
  fontSize: 16,
  color: 'white',
  backgroundColor: 'rgb(28,29,31)',
  borderRadius: 10,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
  marginBottom: 16,
},
button: {
  padding: 14,
  borderRadius: 10,
  width: '100%',
  alignItems: 'center',
},
buttonText: {
  fontSize: 18,
  fontWeight: '600',
  color: 'black',
  letterSpacing: 0.5,
},
error: {
  marginTop: 16,
  color: 'rgb(255, 77, 77)',
  fontSize: 14,
  textAlign: 'center',
  fontWeight: '500',
},
  linkText: {
  color: 'rgb(7,254,213)',
  textAlign: 'center',
  fontSize: 16,
  marginTop: 10,
  textDecorationLine: 'underline',
},
});

export default LoginForm;
