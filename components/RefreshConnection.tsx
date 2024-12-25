/* Render offline message if not connected */
import {Pressable, SafeAreaView, StyleSheet, Text} from "react-native";
import React, {SetStateAction} from "react";

//@ts-ignore
const RefreshConection = ({setRefreshing, children}:{setRefreshing: SetStateAction<boolean>, children: string}) => {
    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    return(
    <SafeAreaView
        style={[styles.container, {justifyContent: 'center'}]}>
        <Text
            style={{
                color: 'white',
                fontSize: 18,
                padding: 8,
                margin: 12,
                textAlign: 'center',
            }}>
            {children}
        </Text>
        <Pressable
            //@ts-ignore
            onPress={() => setRefreshing(true)}
            style={[
                styles.button,
                {
                    backgroundColor: 'rgba(30, 139, 195, .7)',
                    marginVertical: 12,
                },
            ]}>
            <Text style={styles.buttonText}>Refresh Connection</Text>
        </Pressable>

    </SafeAreaView>
    )
}

export default RefreshConection;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
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

    buttonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
    }
});
