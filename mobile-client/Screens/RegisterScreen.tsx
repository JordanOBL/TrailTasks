import { Image, StyleSheet, Text, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import RegisterForm from '../components/Auth/RegisterForm';
import React, {useState, useEffect, setTimeout}from 'react';
import {useAuthContext} from '../services/AuthContext';
import {useInternetConnection} from '../hooks/useInternetConnection';
interface Props {
    onChangeForm: () => void;
}

const RegisterScreen = ({handleFormChange}) => {
    const {register, error} = useAuthContext();
    const {isConnected, refreshConnectionStatus} = useInternetConnection();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');

    function handleRegister(){
        register({ email, password, confirmPassword, username });
    }

    return (
        <KeyboardAvoidingView
            testID="register-screen"
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.imageContainer}>
                    <Image source={require('../assets/StopwatchLogo.png')} style={styles.image} />
                    <Text style={styles.title}>New Hiker</Text>
                </View>
                <View style={styles.registerContainer}>
                    <RegisterForm
                        
                        email={email}
                        password={password}
                        confirmPassword={confirmPassword}
                        username={username}
                       
                        onEmailChange={setEmail}
                        onPasswordChange={setPassword}
                        onConfirmPasswordChange={setConfirmPassword}
                        onUsernameChange={setUsername}
                        error={error}
                        isConnected={isConnected}
                        onRegisterPress={handleRegister}
                        onRefreshPress={refreshConnectionStatus}
                        onFormChange={handleFormChange}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default RegisterScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        padding: 16,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    imageContainer: {
        alignItems: 'stretch',
        justifyContent: 'center',
        marginBottom: 20,
        width: '100%'
    },
 image: {
  width: 100,
  height: 100,
  borderRadius: 50,
  borderWidth: 2,
  borderColor: 'rgb(7,254,213)',
  alignSelf: 'center',
  marginBottom: 10,
},
title: {
  fontSize: 26,
  fontWeight: 'bold',
  color: 'rgb(7,254,213)',
  textAlign: 'center',
  letterSpacing: 1.2,
},
    registerContainer: {
        width: '100%',
        paddingHorizontal: 20,
        alignItems: 'stretch',
    },
});
