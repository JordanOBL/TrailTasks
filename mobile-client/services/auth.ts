//@ts-nocheck
import {Database, Q} from '@nozbe/watermelondb';
import {User} from '../watermelon/models';

import Config from "react-native-config";
import React from "react";
import formatDateTime from "../helpers/formatDateTime";
import handleError from "../helpers/ErrorHandler";

//checkExistingUser checks for a user in the local database
const HTTP_HTTPS = Config.NODE_ENV === 'production' ? 'https' : 'http';
export const checkLocalUserExists = async (
	email: string,
	password: string,
	watermelonDatabase: Database
) => {
	try {
		const [ existingUser ]: User[] | any = await watermelonDatabase
			.get('users')
			.query(Q.and(Q.where('email', email), Q.where('password', password)))
			.fetch();

		return existingUser;
	} catch (err) {
		handleError(err, "checkLocalUserExists");
	}
};


//checkExistingGlobalUser checks for a user in the global database
export const checkGlobalUserExists = async (
	email: string,
	password: string,
): Promise<User | null> => {
	try {
		const url = `${HTTP_HTTPS}://${Config.DATABASE_URL}/api/users`;
		console.log('checkGlobalUserExists url:', url);
		const response: Response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email, password }),
		});

		if(response.status == 404) {
			return null;
		}

		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		const responseJson = await response.json();
		return responseJson || null;
	} catch (err) {
		handleError(err, "checkGlobalUserExists");
		return null;
	}
};

export async function registerValidation(email: string, username: string) {

	if (!email || !username) {
		
		return 'Please enter email and username';
	}
	try {
		const response = await fetch(`${HTTP_HTTPS}://${Config.DATABASE_URL}/api/registerValidation`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email, username }),
		});
		if (!response.ok && response.status != 409) {
			throw new Error('Network response was not ok');
		}
		const responseJson = await response.json();
		return responseJson
	} catch (err) {
		handleError(err, "registerValidation");
		return null;
	}
}


//createNewUser creates a new user
export const createNewUser = async ({
	email,
	password,
	username,
	watermelonDatabase
}: {
		email: string;
		password: string;
		username: string;
	 watermelonDatabase: Database}) => {
	try {
		//const trailStartedAt = formatDateTime(new Date());
		console.log('createNewUser',  email, password, username);
		//!BCYPT PASSWORD BEFORE ADDING TO DB
		const newUser = await watermelonDatabase.write(async () => {
			const newUser = await watermelonDatabase
				.get<User>('users')
				.create((user: User) =>
				{

						user.email = email.trim().toLowerCase();
						user.password = password;
						user.username = username;
						user.pushNotificationsEnabled = true;
						user.themePreference = 'light';
						user.trailId = '1';
						user.trailProgress = '0.0';
						user.dailyStreak = 0;
						user.trailStartedAt = formatDateTime(new Date());
						user.trailTokens = 50;
						user.totalMiles = '0.00';

					})

			return newUser
		});


		if (newUser && newUser.id.length > 0) {
			return newUser;
		}
	} catch (err) {
		handleError(err, "createNewUser");
	}
};



//setLocalStorageUser sets the logged in user in local storage
export const setLocalStorageUser = async (
	existingUser: any,
	watermelonDatabase: Database
) => {
	try {
		await watermelonDatabase.localStorage.set('user_id', existingUser.id);
		await watermelonDatabase.localStorage.set(
			'username',
			existingUser.username
		);

		return true;
	} catch (err) {
		handleError(err, "setLocalStorageUser");
	}
};

//checkForLoggedInUser checks if there is a logged in user
export const checkForLoggedInUser = async (
	setUser: React.Dispatch<React.SetStateAction<any>>,
	watermelonDatabase: Database
) => {
	try {
		const userId: string | undefined | void =
			await watermelonDatabase.localStorage.get('user_id'); // string or undefined if no value for this key

		if (userId) {
			let user = await watermelonDatabase.collections.get('users').find(userId);


			setUser((prevUser: User | null) => user);
		}
	} catch (err) {
		handleError(err, "checkForLoggedInUser");
	}
};
