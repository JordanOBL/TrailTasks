
import { StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import React from 'react';

type Props = {
	text: string;
	disabled?: boolean;
    handleContinueClick?: () => void;

};

const ContinueButton = ({ text, handleContinueClick }: Props) => {
	return (
		<View>
			<Pressable
				style={styles.ContinueButtons}
				onPress={handleContinueClick && (() => handleContinueClick()) }>
				<Text style={{ textAlign: 'center', fontWeight: 'bold' }}>
					{text}
				</Text>
			</Pressable>
		</View>
	);
};

export default ContinueButton;

const styles = StyleSheet.create({
	ContinueButtons: {
		backgroundColor: 'white',
		padding: 10,
		borderRadius: 10,
		margin: 5,
	},
});
