import {Database, Model, Q} from '@nozbe/watermelondb';
import {
	User,
	Subscription,
	User_Purchased_Trail,
	User_Session,
	User_Achievement,
	User_Completed_Trail,
} from '../watermelon/models';
import React from "react";
import handleError from "../helpers/ErrorHandler";
import formatDateTime from "../helpers/formatDateTime";
import Config from "react-native-config";
import {ExistingUserResponse} from "../types/api";
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
		const response: ExistingUserResponseSuccess | ExistingUserResponseFail = await fetch(`${HTTP_HTTPS}://${Config.DATABASE_URL}/api/users`, {
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
				.get('users')
				.create((user: User) =>
				{

						//@ts-ignore
						user.email = email.trim().toLowerCase();
						//@ts-ignore
						user.password = password;
						//@ts-ignore
						user.username = username;
						//@ts-ignore
						user.pushNotificationsEnabled = true;
						//@ts-ignore
						user.themePreference = 'light';
						//@ts-ignore
						user.trailId = '1';
						//@ts-ignore
						user.trailProgress = '0.0';
						user.dailyStreak = 0;
						//@ts-ignore
						user.trailStartedAt = formatDateTime(new Date());
						//@ts-ignore
						user.trailTokens = 50;
						user.totalMiles = '0.00';

					})

			return newUser
		});
//		if (newUser) {
//
//			const subscription = await newUser.addUserSubscription();
//
//			if (subscription) {
//				await watermelonDatabase.localStorage.set(
//					'subscription_id',
//					subscription.id
//				);
//			}
//		}

		// return newUser;

		if (newUser && newUser.id.length > 0) {
			await watermelonDatabase.localStorage.set('user_id', newUser.id);
			//@ts-ignore
			await watermelonDatabase.localStorage.set('username', newUser.username);
//			await watermelonDatabase.localStorage.set(
//				'subscriptionStatus',
//				'inactive'
//			);
			return newUser;
		}
	} catch (err) {
		handleError(err, "createNewUser");
	}
};


//setSubscriptionStatus sets the subscription id in local storage
//export const setSubscriptionStatus = async (
//	user: Model,
//	watermelonDatabase: Database
//) => {
//	try
//{
//		if (user && user.id)
//	{
//			const subscription: Subscription[] | any =
//				await watermelonDatabase.collections
//				.get('users_subscriptions')
//				.query(Q.where('user_id', user.id))
//
//			if (subscription && subscription[0])
//		{
//				await watermelonDatabase.localStorage.set(
//					'subscription_id',
//					subscription[0].id
//				);
//				return subscription[0].id
//			}
//		}
//		return;
//	} catch (err) {
//		handleError(err, "setSubscriptionStatus");
//	}
//};

//setLocalStorageUser sets the logged in user in local storage
export const setLocalStorageUser = async (
	existingUser: any,
	watermelonDatabase: Database
) => {
	try {
		await watermelonDatabase.localStorage.set('user_id', existingUser.id);
		await watermelonDatabase.localStorage.set(
			'username',
			//@ts-ignore
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

			//@ts-ignore
//			if (user.id) {
//				await setSubscriptionStatus(user, watermelonDatabase);
//			}
			setUser((prevUser: User | null) => user);
		}
	} catch (err) {
		handleError(err, "checkForLoggedInUser");
	}
};

//saveUserToLocalDB saves user and related data to local database
export async function saveUserToLocalDB(remoteUser: GlobalExistingUserResponseSuccess, watermelonDatabase: Database) {
	try
{
		if (remoteUser && remoteUser.user)
			// Save the user and related data to local database
			await watermelonDatabase.write(async () => {
				// Create user
						// @ts-ignore
				const newUser =  watermelonDatabase.collections.get('users').prepareCreate((newUser: User) => {
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
					// @ts-ignore
					return watermelonDatabase.collections.get('users_sessions').prepareCreate((newUserSession: User_Session) => {
						newUserSession._raw.id = session.id;
						// @ts-ignore
						newUserSession.userId = session.user_id;
						// @ts-ignore
						newUserSession.sessionName = session.session_name;
						// @ts-ignore
						newUserSession.sessionDescription = session.session_description;
						// @ts-ignore
						newUserSession.totalDistanceHiked = session.total_distance_hiked;
						// @ts-ignore
						newUserSession.totalSessionTime = session.total_session_time;
						// @ts-ignore
						newUserSession.sessionCategoryId = session.session_category_id;
						// @ts-ignore
						newUserSession.createdAt = session.created_at;
						// @ts-ignore
						newUserSession.dateAdded = session.date_added;
						// @ts-ignore
						newUserSession.sessionStartedAt = session.session_started_at;
						// @ts-ignore
						newUserSession.sessionEndedAt = session.session_ended_at;
					})
				})
				
				//            // Create user purchased trail
				// @ts-ignore
				const userPurchasedTrails = [...remoteUser.userPurchasedTrails].map((existingPurchasedTrail: User_Purchased_Trail) =>{
					// @ts-ignore
					return watermelonDatabase.collections.get('users_purchased_trails').prepareCreate((newUserPurchasedTrail: User_Purchased_Trail) => {
						newUserPurchasedTrail._raw.id = existingPurchasedTrail.id;
						// @ts-ignore
						newUserPurchasedTrail.userId = existingPurchasedTrail.user_id;
						// @ts-ignore
						newUserPurchasedTrail.purchasedAt = existingPurchasedTrail.purchased_at;
						// @ts-ignore
						newUserPurchasedTrail.trailId = existingPurchasedTrail.trail_id;
						// @ts-ignore
						//newUserPurchasedTrail.createdAt = existingPurchasedTrail.created_at;
					})
				})
				
				//            // Create user subscription
				// @ts-ignore
//				const userSubscriptions =  watermelonDatabase.collections.get('users_subscriptions').prepareCreate((newUserSubscription: Subscription) => {
//					newUserSubscription._raw.id = remoteUser.userSubscription.id;
//					newUserSubscription.userId = remoteUser.userSubscription.user_id;
//					newUserSubscription.isActive = remoteUser.userSubscription.is_active;
//					newUserSubscription.expiresAt = remoteUser.userSubscription.expires_at;
//				})
				//            // Create user achievements
				const userAchievements = [...remoteUser.userAchievements].map((achievement: User_Achievement) => {
					// @ts-ignore
					return watermelonDatabase.collections.get('users_achievements').prepareCreate((newUserAchievement: User_Achievement) => {
						newUserAchievement._raw.id = achievement.id;
						// @ts-ignore
						newUserAchievement.userId = achievement.user_id;
						// @ts-ignore
						newUserAchievement.achievementId = achievement.achievement_id;
						// @ts-ignore
						newUserAchievement.achievementDescription = achievement.achievement_description;
						// @ts-ignore
						//newUserAchievement.createdAt = achievement.created_at;
						// @ts-ignore
						newUserAchievement.completedAt = achievement.completed_at;
					})
				})

		const userCompletedTrails = [...remoteUser.userCompletedTrails].map((existingCompletedTrail: User_Completed_Trail) =>{ 
			// @ts-ignore
			return watermelonDatabase.collections.get('users_completed_trails').prepareCreate((newCompletedTrail: User_Completed_Trail) => {
				newCompletedTrail._raw.id = existingCompletedTrail.id;
				// @ts-ignore
				newCompletedTrail.userId = existingCompletedTrail.user_id;
				// @ts-ignore
				newCompletedTrail.trailId = existingCompletedTrail.trail_id;
				// @ts-ignore
				newCompletedTrail.bestCompletedTime = existingCompletedTrail.best_completed_time;
				// @ts-ignore
				newCompletedTrail.firstCompletedAt = existingCompletedTrail.first_completed_at;
				// @ts-ignore
				newCompletedTrail.lastCompletedAt = existingCompletedTrail.last_completed_at;
				newCompletedTrail.completionCount = existingCompletedTrail.completion_count;
				// @ts-ignore
				//newCompletedTrail.createdAt = existingCompletedTrail.created_at;
				// @ts-ignore
				//newCompletedTrail.updatedAt = existingCompletedTrail.updated_at;

			}) 
		})
				const userParks = [...remoteUser.userParks].map((existingUserPark: User_Park) => {
					// @ts-ignore
					return watermelonDatabase.collections.get('users_parks').prepareCreate((newUserPark: User_Park) => {
						newUserPark._raw.id = existingUserPark.id;
						// @ts-ignore
						newUserPark.userId = existingUserPark.user_id;
						// @ts-ignore
						newUserPark.parkId = existingUserPark.park_id;
						newUserPark.isRewardRedeemable = existingUserPark.is_reward_redeemable;
						newUserPark.parkLevel = existingUserPark.park_level;
						newUserPark.lastCompleted = existingUserPark.last_completed;
						// @ts-ignore
						//newUserPark.createdAt = existingUserPark.created_at;
						// @ts-ignore
						//newUserPark.updatedAt = existingUserPark.updated_at;
					})
				})

				const userAddons = [...remoteUser.userAddons].map((addon: User_Addon) => {
					// @ts-ignore
					return watermelonDatabase.collections.get('users_addons').prepareCreate((newUserAddon: User_Addon) => {
						newUserAddon._raw.id = addon.id;
						// @ts-ignore
						newUserAddon.userId = addon.user_id;
						// @ts-ignore
						newUserAddon.addonId = addon.addon_id;
						newUserAddon.quantity = addon.quantity;
						// @ts-ignore
						//newUserAddon.createdAt = addon.created_at;
						// @ts-ignore
						//newUserAddon.updatedAt = addon.updated_at;
					})
				})

				await watermelonDatabase.batch([newUser, ...userSessions, ...userPurchasedTrails, ...userAchievements, ...userCompletedTrails, ...userParks, ...userAddons]);
			});
	} catch (err) {
		handleError(err, "saveUserToLocalDB")
	}
}



