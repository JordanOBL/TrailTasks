import {
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    View,
} from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';

import SyncLogger from '@nozbe/watermelondb/sync/SyncLogger';
import { handleRegister } from '../../helpers/registerHelpers';
import { sync } from '../../watermelon/sync';
import handleError from '../../helpers/ErrorHandler';
import RefreshConnection from "../RefreshConnection";

//const logger = new SyncLogger(10 /* limit of sync logs to keep in memory */);
const RegisterForm = ({email = '', password = '', confirmPassword = '', username = '', onFirstNameChange, onLastNameChange, onEmailChange, onPasswordChange, onConfirmPasswordChange, onUsernameChange, error = '', isConnected = false, onRegisterPress, onRefreshPress, onFormChange}) => {
    return isConnected ? (
        <KeyboardAvoidingView
            testID="register-form"
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <Text testID="register-error" style={styles.error}>{error || ''}</Text>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.formContainer}>
                                      <TextInput
                        testID="email-input"
                        value={email.toLowerCase()}
                        onChangeText={onEmailChange}
                        placeholder="Email"
                        placeholderTextColor={'rgba(255, 255, 255, .5)'}
                        keyboardType="email-address"
                        style={styles.input}
                    />
                    <TextInput
                        testID="password-input"
                        value={password}
                        onChangeText={onPasswordChange}	
                        placeholder="Password"
                        placeholderTextColor={'rgba(255, 255, 255, .5)'}
                        secureTextEntry={true}
                        style={styles.input}
                    />
                    <TextInput
                        testID="confirm-password-input"
                        value={confirmPassword}
                        onChangeText={onConfirmPasswordChange}
                        placeholder="Confirm Password"
                        placeholderTextColor={'rgba(255, 255, 255, .5)'}
                        secureTextEntry={true}
                        style={styles.input}
                    />
                    <TextInput
                        testID="username-input"
                        value={username}
                        onChangeText={onUsernameChange}
                        placeholder="Username"
                        placeholderTextColor={'rgba(255, 255, 255, .5)'}
                        style={styles.input}
                    />
                    <Pressable
                        testID="create-account-button"
                        disabled={

                            !email.trim() ||
                                !password.trim() ||
                                !confirmPassword.trim() ||
                                !username.trim()
                        }
                        onPress={onRegisterPress}
                        style={[
                            styles.button,
                            styles.createAccountButton,
                            {
                                backgroundColor:
                                !email ||
                                    !password ||
                                    !confirmPassword ||
                                    !username
                                        ? 'grey'
                                        : 'rgb(7,254,213)',
                            },
                        ]}>
                        <Text style={styles.buttonText}>Create Account</Text>
                    </Pressable>
                 <Pressable testID="login-form-button" onPress={onFormChange}>
  <Text style={styles.linkText}>Already have an account? Login</Text>
</Pressable>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    ) : (
       <View>
           {/*@ts-ignore*/}
       <RefreshConnection  >
           You're currently offline. Please connect to the internet to complete your registration.
       </RefreshConnection>
   <Pressable testID="login-form-button" onPress={onFormChange}>
  <Text style={styles.linkText}>Already have an account? Login</Text>
</Pressable></View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    formContainer: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
input: {
  width: '100%',
  padding: 14,
  fontSize: 16,
  color: 'white',
  backgroundColor: 'rgb(31,33,35)',
  borderRadius: 10,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.1)',
  marginBottom: 16,
}
,
    button: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8, // Adjusted for better spacing
        width: '100%', // Set consistent width for buttons
    },
    createAccountButton: {
        backgroundColor: 'rgb(7,254,213)', // Create Account button color
    },
    loginButton: {
        backgroundColor: 'rgb(61,63,65)', // Login button color
    },
  buttonText: {
  fontSize: 18,
  fontWeight: '600',
  color: 'black',
  letterSpacing: 0.3,
},
    error: {
        marginTop: 10, // Adjusted for better spacing
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
    },
    linkText: {
  color: 'rgb(7,254,213)',
  textAlign: 'center',
  fontSize: 16,
  marginTop: 10,
  textDecorationLine: 'underline',
},

});

export default RegisterForm;
