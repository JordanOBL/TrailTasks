import { StyleSheet, TextInput, SafeAreaView, Text, View } from "react-native";
import React from "react";
import LoginButton from "../components/LoginButton";
interface user {
    UserId: number, Username: string, FirstName: string, LastName: string, Email: string, Password: string, PushNotificationsEnabled: number, ThemePreference: string
}
interface Props {
    users: user[]
}
const Login = ({ users }:Props) => {
    return (
        <SafeAreaView>
            <View>{users
? users.map((user, idx:number) => (
    <Text key={idx} style={styles.usersNames}>{user.FirstName}</Text>
            ))
: <Text>Loading Users</Text>}</View>
            <TextInput style={styles.LoginInput} placeholder='email' />
            <TextInput style={styles.LoginInput} placeholder='password' />
            <LoginButton text='Login' />
            <LoginButton text='Register' />
        </SafeAreaView>
    );
};

export default Login;

const styles = StyleSheet.create({
    LoginInput: {
        borderColor: "white",
        height: 40,
        width: 200,
        margin: 12,
        borderWidth: 1,
        color: "black",
        backgroundColor: "white",
        padding: 10,
    },
    usersNames: {
        color: "#fff",
    },
});
