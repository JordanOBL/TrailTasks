import {
	StyleSheet,
	TextInput,
	KeyboardAvoidingView,
	Text,
} from 'react-native';
import * as React from 'react';
import LoginButton from '../components/LoginButton';
import ContinueButton from '../components/ContinueButton';
import { db } from '../dbs/sqLite/InitializeDB';
const Register = () => {
	//set states of everything needed for sql user table
	const [firstName, setFirstName] = React.useState<string>('');
	const [lastName, setLastName] = React.useState<string>('');
	const [email, setEmail] = React.useState<string>('');
	const [emailTaken, setEmailTaken] = React.useState<boolean>(false);
	const [password, setPassword] = React.useState<string>('');
	const [confirmPassword, setConfirmPassword] = React.useState<string>('');
	const [passwordsMatch, setPasswordsMatch] = React.useState<boolean>(true);
	const [username, setUsername] = React.useState<string | null>(null);
	const [showChooseUsername, setShowChooseUsername] =
		React.useState<boolean>(false);
	const [registered, setRegistered] = React.useState<boolean>(false);

	//*Username Component
    // const ChooseUsername = () => {

    // 	return (
    // 		<KeyboardAvoidingView
    // 			style={{ display: 'flex', alignItems: 'center' }}>
    // 			<Text style={{ color: 'white', textAlign: 'center' }}>
    // 				WARNING: You may be asked to change this username once your
    // 				device establishes a network connection.{' '}
    // 			</Text>
    // 			<TextInput
    // 				style={styles.RegisterInput}
    // 				placeholder="Username"
    // 				onChangeText={(text) => setUsername(text)}
    // 			/>
    // 			<LoginButton text="Register" handleRegisterClick={handleRegisterClick} />
    // 		</KeyboardAvoidingView>
    // 	);
    // };

	//*Action for user click on register
	

  const handleContinueClick = (): void =>
  {
		//if paswords do not match, tell user, dont continue until they do
		console.log('clicked continue');
		if (password != confirmPassword) {
			setPasswordsMatch(false);
			setTimeout(() => setPasswordsMatch(true), 3000);
			return;
		}
		//if user enters everything correctly, show input allowing user to choose username
		if (
			firstName &&
			lastName &&
			email &&
			password &&
			confirmPassword &&
			passwordsMatch
		) {
			setShowChooseUsername(true);
		}
	};

	const handleRegisterClick = (): void => {
		console.log('clicked register', {
			firstName,
			lastName,
			email,
			password,
			username,
		});
		if (
			firstName &&
			lastName &&
			email &&
			password &&
			confirmPassword &&
			passwordsMatch &&
			username
		) {
			db.transaction(
				(tx: {
					executeSql: (
						arg0: string,
						arg1: (string | number)[],
						arg2?: () => void,
						arg3?: (tx: any, err: any) => boolean
					) => void;
				}) =>
					tx.executeSql(
						'INSERT INTO users (firstName, lastName, email, password, username) VALUES (?, ?, ?, ?, ?);',
						[firstName, lastName, email, password, username],
						() => {
							console.log(
								'Insert Successful, Registered Complete',
								{
									firstName,
									lastName,
									email,
									password,
									username,
								}
							);
							setRegistered(true);
							setShowChooseUsername(false);
						},
						//@ts-ignore
						(_tx: any, err: any) => {
							console.error(
								'Error registering to SQLite database',
								err
							);
							if (
								err.message ==
								'Error code 19: UNIQUE constraint failed: Users.Email'
							) {
                setTimeout(() => setEmailTaken(false), 5000);
                setEmailTaken(true);
                setShowChooseUsername(false); 
							}
						}
					)
			);
		}
	};

	return showChooseUsername ? (
		<KeyboardAvoidingView style={{ display: 'flex', alignItems: 'center' }}>
			<Text style={{ color: 'white', textAlign: 'center' }}>
				WARNING: You may be asked to change this username once your
				device establishes a network connection.{' '}
			</Text>
			<TextInput
				style={styles.RegisterInput}
				placeholder="Username"
				onChangeText={(text) => setUsername(text)}
			/>
			<LoginButton
				text="Register"
				handleRegisterClick={handleRegisterClick}
			/>
		</KeyboardAvoidingView>
	) : (
		//!Make into own component
		<KeyboardAvoidingView>
			<TextInput
				style={styles.RegisterInput}
				onChangeText={(text) => setFirstName(text)}
				autoComplete="name"
          placeholder="First Name"
          value={firstName && firstName}
			/>
			<TextInput
				style={styles.RegisterInput}
				onChangeText={(text) => setLastName(text)}
          placeholder="Last Name"
          value={lastName && lastName}
          
			/>
			<TextInput
				style={styles.RegisterInput}
				onChangeText={(text) => setEmail(text)}
				autoComplete="email"
				placeholder="Email"
          keyboardType="email-address"
          value={email && email}
			/>
			<TextInput
				style={styles.RegisterInput}
				onChangeText={(text) => setPassword(text)}
          placeholder="Password"
          
			/>
			<TextInput
				style={styles.RegisterInput}
				onChangeText={(text) => setConfirmPassword(text)}
				placeholder="Confirm Password"
			/>
			{!passwordsMatch && (
				<Text style={{ color: 'red', textAlign: 'center' }}>
					Passwords Dont Match!
				</Text>
			)}
			{emailTaken ? (
				<Text style={{ color: 'red', textAlign: 'center' }}>
					This email is already registerd!
				</Text>
			) : (
				<></>
			)}
			<ContinueButton
				text="Continue"
				handleContinueClick={handleContinueClick}
			/>
		</KeyboardAvoidingView>
	);
};

export default Register;

const styles = StyleSheet.create({
	RegisterInput: {
		borderColor: 'white',
		height: 40,
		width: 200,
		margin: 12,
		borderWidth: 1,
		color: 'black',
		backgroundColor: 'white',
		padding: 10,
	},
});
