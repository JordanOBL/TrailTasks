//@ts-nocheck
import {Database, Q} from '@nozbe/watermelondb';
import {
	User,
	User_Achievement,
	User_Addon,
	User_Completed_Trail,
	User_Park,
	User_Purchased_Trail,
	User_Session,
} from '../watermelon/models';

import Config from "react-native-config";
import{GlobalExistingUserResponseSuccess} from "../types/api";
import React from "react";
import { ServerResponse } from 'node:http';
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
			await watermelonDatabase.localStorage.set('user_id', newUser.id);
			await watermelonDatabase.localStorage.set('username', newUser.username);

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

//saveUserToLocalDB saves user from global and related data to local database
export async function saveUserToLocalDB(remoteUser: GlobalExistingUserResponseSuccess & User, watermelonDatabase: Database) {
	try
{
		if (remoteUser && remoteUser.user)
			// Save the user and related data to local database
			await watermelonDatabase.write(async () => {
				// Create user
				const newUser =  watermelonDatabase.collections.get<User>('users').prepareCreate((newUser) => {
					newUser._raw.id = remoteUser.user.id;
					newUser.email = remoteUser.user.email;
					newUser.password = remoteUser.user.password;
					newUser.username = remoteUser.user.username;
					newUser.pushNotificationsEnabled = remoteUser.user.push_notifications_enabled;
					newUser.themePreference = remoteUser.user.theme_preference;
					newUser.trailId = remoteUser.user.trail_id;
					newUser.trailProgress = remoteUser.user.trail_progress;
					newUser.dailyStreak = remoteUser.user.daily_streak;
					newUser.trailStartedAt = remoteUser.user.trail_started_at;
					newUser.trailTokens = remoteUser.user.trail_tokens;
					newUser.totalMiles = remoteUser.user.total_miles;
					newUser.prestigeLevel = remoteUser.user.prestige_level;
				})

				const userSessions = [...remoteUser.userSessions].map((session: User_Session) => {				
					return watermelonDatabase.collections.get<User_Session>('users_sessions').prepareCreate((newUserSession: User_Session) => {
						newUserSession._raw.id = session.id;
						newUserSession.userId = session.user_id;
						newUserSession.sessionName = session.session_name;
						newUserSession.sessionDescription = session.session_description;
						newUserSession.totalDistanceHiked = session.total_distance_hiked;
						newUserSession.totalSessionTime = session.total_session_time;
						newUserSession.sessionCategoryId = session.session_category_id;
						newUserSession.createdAt = session.created_at;
						newUserSession.dateAdded = session.date_added;
						// newUserSession.sessionStartedAt = session.session_started_at;
						// newUserSession.sessionEndedAt = session.session_ended_at;
					})
				})
				
				// Create user purchased trail
				const userPurchasedTrails = [...remoteUser.userPurchasedTrails].map((existingPurchasedTrail: User_Purchased_Trail) =>{
					return watermelonDatabase.collections.get('users_purchased_trails').prepareCreate((newUserPurchasedTrail: User_Purchased_Trail) => {
						newUserPurchasedTrail._raw.id = existingPurchasedTrail.id;
						newUserPurchasedTrail.userId = existingPurchasedTrail.user_id;
						newUserPurchasedTrail.purchasedAt = existingPurchasedTrail.purchased_at;
						newUserPurchasedTrail.trailId = existingPurchasedTrail.trail_id;
						//newUserPurchasedTrail.createdAt = existingPurchasedTrail.created_at;
					})
				})
         // Create user achievements
				const userAchievements = [...remoteUser.userAchievements].map((achievement: User_Achievement) => {
					return watermelonDatabase.collections.get('users_achievements').prepareCreate((newUserAchievement: User_Achievement) => {
						newUserAchievement._raw.id = achievement.id;
						newUserAchievement.userId = achievement.user_id;
						newUserAchievement.achievementId = achievement.achievement_id;
						newUserAchievement.achievementDescription = achievement.achievement_description;
						//newUserAchievement.createdAt = achievement.created_at;
						newUserAchievement.completedAt = achievement.completed_at;
					})
				})

		const userCompletedTrails = [...remoteUser.userCompletedTrails].map((existingCompletedTrail: User_Completed_Trail) =>{ 
			return watermelonDatabase.collections.get('users_completed_trails').prepareCreate((newCompletedTrail: User_Completed_Trail) => {
				newCompletedTrail._raw.id = existingCompletedTrail.id;
				newCompletedTrail.userId = existingCompletedTrail.user_id;
				newCompletedTrail.trailId = existingCompletedTrail.trail_id;
				newCompletedTrail.bestCompletedTime = existingCompletedTrail.best_completed_time;
				newCompletedTrail.firstCompletedAt = existingCompletedTrail.first_completed_at;
				newCompletedTrail.lastCompletedAt = existingCompletedTrail.last_completed_at;
				newCompletedTrail.completionCount = existingCompletedTrail.completion_count;
				//newCompletedTrail.createdAt = existingCompletedTrail.created_at;
				//newCompletedTrail.updatedAt = existingCompletedTrail.updated_at;

			}) 
		})
				const userParks = [...remoteUser.userParks].map((existingUserPark: User_Park) => {
					return watermelonDatabase.collections.get('users_parks').prepareCreate((newUserPark: User_Park) => {
						newUserPark._raw.id = existingUserPark.id;
						newUserPark.userId = existingUserPark.user_id;
						newUserPark.parkId = existingUserPark.park_id;
						newUserPark.isRewardRedeemable = existingUserPark.is_reward_redeemable;
						newUserPark.parkLevel = existingUserPark.park_level;
						newUserPark.lastCompleted = existingUserPark.last_completed;
						//newUserPark.createdAt = existingUserPark.created_at;
						//newUserPark.updatedAt = existingUserPark.updated_at;
					})
				})

				const userAddons = [...remoteUser.userAddons].map((addon: User_Addon) => {
					return watermelonDatabase.collections.get('users_addons').prepareCreate((newUserAddon: User_Addon) => {
						newUserAddon._raw.id = addon.id;
						newUserAddon.userId = addon.user_id;
						newUserAddon.addonId = addon.addon_id;
						newUserAddon.quantity = addon.quantity;
						//newUserAddon.createdAt = addon.created_at;
						//newUserAddon.updatedAt = addon.updated_at;
					})
				})

				const userWilds = [...remoteUser.userWilds].map((wild: User_Wild) => {
					return watermelonDatabase.collections.get('users_wilds').prepareCreate((newUserWild: User_Wild) => {
						newUserWild._raw.id = wild.id;
						newUserWild.userId = wild.user_id;
						newUserWild.wildId = wild.wild_id;
						newUserWild.isActive = wild.is_active;
						newUserWild.level = wild.level;
						newUserWild.xp = wild.xp;
						newUserWild.xpToNext = wild.xp_to_next;
						newUserWild.unlockedAt = wild.unlocked_at;
						//newUserWild.createdAt = wild.created_at;
						//newUserWild.updatedAt = wild.updated_at;
					})
				})

				await watermelonDatabase.batch([newUser, ...userSessions, ...userPurchasedTrails, ...userAchievements, ...userCompletedTrails, ...userParks, ...userAddons, ...userWilds]);
			});
	} catch (err) {
		handleError(err, "saveUserToLocalDB")
	}
}



