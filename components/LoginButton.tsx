import { StyleSheet, Text, View, Pressable } from 'react-native';
import React from 'react';

type Props = {
	text: string;
	disabled?: boolean;
    handleRegisterClick?: () => void;
};

const LoginButton = ({ text, handleRegisterClick }: Props) => {
	return (
		<View>
			<Pressable
				style={styles.LoginButtons}
				onPress={handleRegisterClick && (() => handleRegisterClick()) }>
				<Text style={{ textAlign: 'center', fontWeight: 'bold' }}>
					{text}
				</Text>
			</Pressable>
		</View>
	);
};

export default LoginButton;

const styles = StyleSheet.create({
	LoginButtons: {
		backgroundColor: 'white',
		padding: 10,
		borderRadius: 10,
		margin: 5,
	},
});
