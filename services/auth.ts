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
import {DATABASE_URL} from "@env"

//checkExistingUser checks for a user in the local database
export const checkLocalUserExists = async (
	email: string,
	password: string,
	watermelonDatabase: Database
) => {
	try {
		const existingUser: User[] | any = await watermelonDatabase
			.get('users')
			.query(Q.and(Q.where('email', email), Q.where('password', password)))
			.fetch();

		return existingUser[0];
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
		const response = await fetch(`http://${DATABASE_URL}/api/users`, {
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
		console.log('user from checkGlobalUserExists', responseJson);
		return responseJson || null;
	} catch (err) {
		handleError(err, "checkGlobalUserExists");
		return null;
	}
};


//createNewUser creates a new user
export const createNewUser = async ({
	firstName,
	lastName,
	email,
	password,
	username,
	watermelonDatabase
}: {
		firstName: string;
		lastName: string;
		email: string;
		password: string;
		username: string;
	 watermelonDatabase: Database}) => {
	try {
		//const trailStartedAt = formatDateTime(new Date());
		console.log('createNewUser', firstName, lastName, email, password, username);
		//!BCYPT PASSWORD BEFORE ADDING TO DB
		const newUser = await watermelonDatabase.write(async () => {
			const newUser = await watermelonDatabase
				.get('users')
				.create((user: User) =>
				{
						//@ts-ignore
						user.firstName = firstName;
						//@ts-ignore
						user.lastName = lastName;
						//@ts-ignore
						user.email = email;
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
		if (newUser) {

			const subscription = await newUser.addUserSubscription();

			if (subscription) {
				await watermelonDatabase.localStorage.set(
					'subscription_id',
					subscription.id
				);
			}
		}

		// return newUser;

		if (newUser && newUser.id.length > 0) {
			await watermelonDatabase.localStorage.set('user_id', newUser.id);
			//@ts-ignore
			await watermelonDatabase.localStorage.set('username', newUser.username);
			await watermelonDatabase.localStorage.set(
				'subscriptionStatus',
				'inactive'
			);
			return newUser;
		}
	} catch (err) {
		handleError(err, "createNewUser");
	}
};


//setSubscriptionStatus sets the subscription id in local storage
export const setSubscriptionStatus = async (
	user: Model,
	watermelonDatabase: Database
) => {
	try
{
		if (user && user.id)
	{
			const subscription: Subscription[] | any =
				await watermelonDatabase.collections
				.get('users_subscriptions')
				.query(Q.where('user_id', user.id))

			if (subscription && subscription[0])
		{
				await watermelonDatabase.localStorage.set(
					'subscription_id',
					subscription[0].id
				);
				return subscription[0].id
			}
		}
		console.debug('returning undefined in setsubscription')
		return;
	} catch (err) {
		handleError(err, "setSubscriptionStatus");
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
		console.debug('checking for logged in user')
		const userId: string | undefined | void =
			await watermelonDatabase.localStorage.get('user_id'); // string or undefined if no value for this key

		if (userId) {
			let user = await watermelonDatabase.collections.get('users').find(userId);

			//@ts-ignore
			if (user.id) {
				console.debug('userid found attempting to set subscription status', user.id)
				await setSubscriptionStatus(user, watermelonDatabase);
			}
			console.debug('user before seeting in checked for logged in user:', user)
			setUser((prevUser: User | null) => user);
		}
	} catch (err) {
		handleError(err, "checkForLoggedInUser");
	}
};

//saveUserToLocalDB saves user and related data to local database
export async function saveUserToLocalDB(remoteUser: any, watermelonDatabase: Database) {
	try
{
		if (remoteUser && remoteUser.user)
	{
			// Save the user and related data to local database
			console.debug('existing user', remoteUser);
			await watermelonDatabase.write(async () => {
				// Create user
				console.debug('Creating new user:', remoteUser.user);
				console.debug('Creating new session:', remoteUser.userSessions);
				console.debug('Creating purchased trails:', remoteUser.userPurchasedTrails);
				console.debug('Creating subscription:', remoteUser.userSubscription);
				console.debug('Creating achievements:', remoteUser.userAchievements);
				console.debug('Creating completed trails:', remoteUser.usersCompletedTrails);

				// @ts-ignore
				const newUser =  watermelonDatabase.collections.get('users').prepareCreate((newUser: User) => {
					newUser._raw.id = remoteUser.user.id;
					newUser.firstName = remoteUser.user.first_name;
					newUser.lastName = remoteUser.user.last_name;
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
				console.debug('newUser', newUser)

				const userSessions = [...remoteUser.userSessions].map((session: User_Session) =>
					// @ts-ignore
					watermelonDatabase.collections.get('users_sessions').prepareCreate((newUserSession: User_Session) => {
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
				)
				//            // Create user purchased trail
				// @ts-ignore
				const userPurchasedTrails = [...remoteUser.userPurchasedTrails].map((existingPurchasedTrail: User_Purchased_Trail) =>
					// @ts-ignore
					watermelonDatabase.collections.get('users_purchased_trails').prepareCreate((newUserPurchasedTrail: User_Purchased_Trail) => {
						newUserPurchasedTrail._raw.id = existingPurchasedTrail.id;
						// @ts-ignore
						newUserPurchasedTrail.userId = existingPurchasedTrail.user_id;
						// @ts-ignore
						newUserPurchasedTrail.purchasedAt = existingPurchasedTrail.purchased_at;
						// @ts-ignore
						newUserPurchasedTrail.trailId = existingPurchasedTrail.trail_id;
						// @ts-ignore
						newUserPurchasedTrail.createdAt = existingPurchasedTrail.created_at;
					})
				)
				//            // Create user subscription
				// @ts-ignore
				const userSubscriptions =  watermelonDatabase.collections.get('users_subscriptions').prepareCreate((newUserSubscription: Subscription) => {
					newUserSubscription._raw.id = remoteUser.userSubscription.id;
					newUserSubscription.userId = remoteUser.userSubscription.user_id;
					newUserSubscription.isActive = remoteUser.userSubscription.is_active;
					newUserSubscription.expiresAt = remoteUser.userSubscription.expires_at;
				})
				//            // Create user achievements
				const userAchievements = [...remoteUser.userAchievements].map((achievement: User_Achievement) =>
					// @ts-ignore
					watermelonDatabase.collections.get('users_achievements').prepareCreate((newUserAchievement: User_Achievement) => {
						newUserAchievement._raw.id = achievement.id;
						// @ts-ignore
						newUserAchievement.userId = achievement.user_id;
						// @ts-ignore
						newUserAchievement.achievementId = achievement.achievement_id;
						// @ts-ignore
						newUserAchievement.achievementDescription = achievement.achievement_description;
						// @ts-ignore
						newUserAchievement.createdAt = achievement.created_at;
						// @ts-ignore
						newUserAchievement.completedAt = achievement.completed_at;
					}))

				const completedTrails = [...remoteUser.usersCompletedTrails].map((existingCompletedTrail: User_Completed_Trail) =>
					// @ts-ignore
					watermelonDatabase.collections.get('users_completed_trails').prepareCreate((newCompletedTrail: User_Completed_Trail) => {
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
						newCompletedTrail.createdAt = existingCompletedTrail.created_at;
						// @ts-ignore
						newCompletedTrail.updatedAt = existingCompletedTrail.updated_at;

					})
				)
				console.debug('attempting to writebatch of new user from master DB')
				await watermelonDatabase.batch([newUser, ...userSessions, ...userPurchasedTrails, userSubscriptions, ...userAchievements, ...completedTrails]);
				console.debug('batch write done...')
			});

			// Retrieve the newly created user from the database
			console.debug('retrieving new user from DB')
			remoteUser = await checkExistingUser(email, password, watermelonDatabase);
			console.debug('Retrieved new user: ' + remoteUser);
			//await sync(watermelonDatabase, remoteUser.id);
		}
	} catch (err) {
		handleError(err, "saveUserToLocalDB")
	}
}



