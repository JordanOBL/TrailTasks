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
import { useDatabase } from '@nozbe/watermelondb/hooks';
import checkInternetConnection from '../helpers/InternetConnection/checkInternetConnection';
import handleError from '../helpers/ErrorHandler';
import RefreshConnection from "./RefreshConnection";

const logger = new SyncLogger(10 /* limit of sync logs to keep in memory */);

interface Props {
    setUser: React.Dispatch<React.SetStateAction<any>>;
    setisRegistering: React.Dispatch<React.SetStateAction<any>>;
    isRegistering: boolean;
}

const Register = ({ setUser, setisRegistering, isRegistering }: Props) => {
    const watermelonDatabase = useDatabase();
    const [isConnectedToInternet, setIsConnectedToInternet] = useState<boolean | null>(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [username, setUsername] = useState('');

    const [refreshing, setRefreshing] = useState(true); // State to manage refreshing

    // Memoize the internet check function
    const checkConnection = useCallback(() => {
        if (isConnectedToInternet === null) { // Only check connection if it hasn't been checked yet
            checkInternetConnection()
                .then(({ isConnected }) => {
                    setIsConnectedToInternet(isConnected);
                })
                .catch((err) => {
                    handleError(err, 'Register Component UseEffect');
                    setIsConnectedToInternet(false);
                });
        }
    }, [isConnectedToInternet]);

    useEffect(() => {
        if (refreshing) {
            checkConnection();
            setRefreshing(false);
        }
    }, [refreshing, checkConnection]);

    return isConnectedToInternet ? (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <Text style={styles.error}>{error || ''}</Text>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.formContainer}>
                    <TextInput
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="First Name"
                        placeholderTextColor={'rgba(255, 255, 255, .5)'}
                        style={styles.input}
                    />
                    <TextInput
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Last Name"
                        placeholderTextColor={'rgba(255, 255, 255, .5)'}
                        style={styles.input}
                    />
                    <TextInput
                        value={email.toLowerCase()}
                        onChangeText={setEmail}
                        placeholder="Email"
                        placeholderTextColor={'rgba(255, 255, 255, .5)'}
                        keyboardType="email-address"
                        style={styles.input}
                    />
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Password"
                        placeholderTextColor={'rgba(255, 255, 255, .5)'}
                        secureTextEntry={true}
                        style={styles.input}
                    />
                    <TextInput
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirm Password"
                        placeholderTextColor={'rgba(255, 255, 255, .5)'}
                        secureTextEntry={true}
                        style={styles.input}
                    />
                    <TextInput
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Username"
                        placeholderTextColor={'rgba(255, 255, 255, .5)'}
                        style={styles.input}
                    />
                    <Pressable
                        disabled={
                            !email ||
                            !password ||
                            !confirmPassword ||
                            !firstName ||
                            !lastName ||
                            !username
                        }
                        onPress={() =>
                            handleRegister({
                                firstName,
                                lastName,
                                email,
                                password,
                                confirmPassword,
                                username,
                                setUser,
                                setError,
                                watermelonDatabase,
                            }).then(() =>
                                sync(watermelonDatabase)
                                    .then((res) => console.log(res))
                                    .catch((err) => console.error(err))
                            )
                        }
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
                        onPress={() => setisRegistering((prev: boolean) => !prev)}
                        style={[
                            styles.button,
                            styles.loginButton,
                            { backgroundColor: 'rgb(61,63,65)' },
                        ]}>
                        <Text style={styles.buttonText}>
                            {isRegistering ? 'Login' : 'Create an Account'}
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    ) : (
       <View>
           {/*@ts-ignore*/}
       <RefreshConnection setRefreshing={setRefreshing} >
           You neeed internet connection to register
       </RefreshConnection>
    <Pressable
        onPress={() => setisRegistering((prev: boolean) => !prev)}
        style={[
            styles.button,
            {backgroundColor: 'rgb(7,254,213)'},
        ]}>
        <Text style={styles.buttonText}>{'Login'}</Text>
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
