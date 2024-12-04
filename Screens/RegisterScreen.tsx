import { Image, StyleSheet, Text, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Register from '../components/Register';
import React from 'react';


interface Props {
    setUser: React.Dispatch<React.SetStateAction<any>>;
    setisRegistering: React.Dispatch<React.SetStateAction<any>>;
    isRegistering: boolean;
}

const RegisterScreen = ({ setUser, setisRegistering, isRegistering }: Props) => {
    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.imageContainer}>
                    <Image source={require('../assets/StopwatchLogo.png')} style={styles.image} />
                    <Text style={styles.title}>New Hiker</Text>
                </View>
                <View style={styles.registerContainer}>
                    <Register
                        setUser={setUser}
                        setisRegistering={setisRegistering}
                        isRegistering={isRegistering}
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
        width: 50, // Reduced size of the image to create more space
        height: 50,
        borderRadius: 40, // Maintain circular shape with new size
    },
    title: {
        fontSize: 24, // Slightly smaller font size for better layout balance
        fontWeight: 'bold',
        color: 'white',
        marginTop: 10,
    },
    registerContainer: {
        width: '100%',
        paddingHorizontal: 20,
        alignItems: 'stretch',
    },
});
