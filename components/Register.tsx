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
import { handleRegister } from '../helpers/registerHelpers';
import { sync } from '../watermelon/sync';

import handleError from '../helpers/ErrorHandler';
import RefreshConnection from "./RefreshConnection";

const logger = new SyncLogger(10 /* limit of sync logs to keep in memory */);
const Register = ({firstName, lastName, email, password, confirmPassword, username, onFirstNameChange, onLastNameChange, onEmailChange, onPasswordChange, onConfirmPasswordChange, onUsernameChange, error, isConnected, onRegisterPress, onRefreshPress, onFormChange}) => {
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
                        testID="first-name-input"
                        value={firstName}
                        onChangeText={onFirstNameChange}
                        placeholder="First Name"
                        placeholderTextColor={'rgba(255, 255, 255, .5)'}
                        style={styles.input}
                    />
                    <TextInput
                        testID="last-name-input"
                        value={lastName}
                        onChangeText={onLastNameChange}
                        placeholder="Last Name"
                        placeholderTextColor={'rgba(255, 255, 255, .5)'}
                        style={styles.input}
                    />
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
                                !firstName.trim() ||
                                !lastName.trim() ||
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
                                    !firstName ||
                                    !lastName ||
                                    !username
                                        ? 'grey'
                                        : 'rgb(7,254,213)',
                            },
                        ]}>
                        <Text style={styles.buttonText}>Create Account</Text>
                    </Pressable>
                    <Pressable
                        testID="login-form-button"
                        onPress={onFormChange}
                        style={[
                            styles.button,
                            styles.loginButton,
                            { backgroundColor: 'rgb(61,63,65)' },
                        ]}>
                        <Text style={styles.buttonText}>
                            Login
                        </Text>
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
    <Pressable
        onPress={onFormChange}
        style={[
            styles.button,
            {backgroundColor: 'rgb(7,254,213)'},
        ]}>
        <Text style={styles.buttonText}>Login</Text>
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
        padding: 12, // Slightly reduced padding to create more space
        fontSize: 18,
        color: 'white',
        backgroundColor: 'rgba(31, 33, 35, 0.5)',
        borderRadius: 10,
        marginBottom: 15, // Slightly reduced margin to create more space
    },
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
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
    },
    error: {
        marginTop: 10, // Adjusted for better spacing
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default Register;
