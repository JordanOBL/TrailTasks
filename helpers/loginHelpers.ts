import {Database, Model, Q} from '@nozbe/watermelondb';
import {
    User,
    Subscription,
    User_Miles,
    User_Purchased_Trail,
    User_Session,
    User_Achievement,
    Completed_Hike
} from '../watermelon/models';
import checkInternetConnection from '../helpers/InternetConnection/checkInternetConnection';
import React from "react";





//*this function checks for a user in the database matching users login input
export const checkExistingUser = async (
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
    console.error('Error in checkExistingUser()', err);
  }
};


export const checkExistingGlobalUser = async (
  email: string,
  password: string,
): Promise<User | null> => {
  try {
    const response = await fetch(`${process.env.SERVER_PORT_URL}/api/users`, {
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
    console.log('user from checkExistingGlobalUser', responseJson);
    return responseJson || null;
  } catch (err) {
    console.error('Error in checkExistingGlobalUser()', err);
    return null;
  }
};
 

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
    console.error('Error in setSubscriptionStatus()', {err});
  }
};

export const setLocalStorageUserAndMiles = async (
  existingUser: any,
  watermelonDatabase: Database
) => {
  try {
    console.log('existingUser in setLocalStoordageUserandMiles', existingUser);
    await watermelonDatabase.localStorage.set('user_id', existingUser.id);
    await watermelonDatabase.localStorage.set(
      'username',
      //@ts-ignore
      existingUser.username
    );
    //get usersMilesId
    const usersMiles = await watermelonDatabase
      .get('users_miles')
      .query(Q.where('user_id', existingUser.id))

    if (usersMiles.length > 0) {
      await watermelonDatabase.localStorage.set(
        'user_miles_id',
        usersMiles[0].id
      );
    }
    return true;
  } catch (err) {
    console.error('Error setting localStorageUserMilesId', err);
  }
};

//*This funtion persits logged in user from local storrage
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
      if (user.id) {
          console.debug('userid found attempting to set subscription status', user.id)
        await setSubscriptionStatus(user, watermelonDatabase);
      }
        console.debug('user before seeting in checked for logged in user:', user)
      setUser((prevUser: User | null) => user);
    }
    return;
  } catch (error) {
    console.error('Error in checkForUser(), app.tsx', error);
  }
};


export const handleLogin = async ({
  email,
  password,
  setUser,
  setError,
  watermelonDatabase,
}: {
  email: string;
  password: string;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  setError: React.Dispatch<React.SetStateAction<any>>;
  watermelonDatabase: Database;
}): Promise<void> => {
  try {
    if (email.trim() === '' || password.trim() === '') {
      setError('All fields are required');
      return;
    }

    // Check for internet connection
    // @ts-ignore
      const { isConnected } = await checkInternetConnection();

    let existingUser = await checkExistingUser(email, password, watermelonDatabase);

    // If not found locally and internet is available, check globally
    if (!existingUser && isConnected) {
      existingUser = await checkExistingGlobalUser(email, password);

      if (existingUser) {
       console.log('existingUser subscription', existingUser.userSubscription)
        // Save the user and related data to local database
        await watermelonDatabase.write(async () => {
            // Create user
          
           // @ts-ignore
            const newUser =  watermelonDatabase.collections.get('users').prepareCreate((newUser: User) => {
              newUser._raw.id = existingUser.user.id;
              newUser.firstName = existingUser.user.first_name;
              newUser.lastName = existingUser.user.last_name;
              newUser.email = existingUser.user.email;
              newUser.password = existingUser.user.password;
              newUser.username = existingUser.user.username;
              newUser.pushNotificationsEnabled = existingUser.user.push_notifications_enabled;
              newUser.themePreference = existingUser.user.theme_preference;
              newUser.trailId = existingUser.user.trail_id;
              newUser.trailProgress = existingUser.user.trail_progress;
              newUser.dailyStreak = existingUser.user.daily_streak;
              newUser.trailStartedAt = existingUser.user.trail_started_at;
              newUser.trailTokens = existingUser.user.trail_tokens;
            })
            // Create user miles
            // @ts-ignore
            const userMiles = watermelonDatabase.collections.get('users_miles').prepareCreate((newUserMiles: User_Miles) => {
              newUserMiles._raw.id = existingUser.userMiles.id;
              newUserMiles.totalMiles = existingUser.userMiles.total_miles;
              newUserMiles.userId = existingUser.userMiles.user_id;
       })


            const userSessions = [...existingUser.userSessions].map((session: User_Session) =>
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
            const userPurchasedTrails = [...existingUser.userPurchasedTrails].map((trail: User_Purchased_Trail) =>
                // @ts-ignore
              watermelonDatabase.collections.get('users_purchased_trails').prepareCreate((newUserPurchasedTrail: User_Purchased_Trail) => {
                newUserPurchasedTrail._raw.id = trail.id;
                  // @ts-ignore
                newUserPurchasedTrail.userId = trail.user_id;
                  // @ts-ignore
                newUserPurchasedTrail.purchasedAt = trail.purchased_at;
                  // @ts-ignore
                newUserPurchasedTrail.trailId = trail.trail_id;
                  // @ts-ignore
                newUserPurchasedTrail.createdAt = trail.created_at;
              })
            )  
//            // Create user subscription
            // @ts-ignore
            const userSubscriptions =  watermelonDatabase.collections.get('users_subscriptions').prepareCreate((newUserSubscription: Subscription) => {
              newUserSubscription._raw.id = existingUser.userSubscription.id;
              newUserSubscription.userId = existingUser.userSubscription.user_id;
              newUserSubscription.isActive = existingUser.userSubscription.is_active;
              newUserSubscription.expiresAt = existingUser.userSubscription.expires_at;
            })
//            // Create user achievements
            const userAchievements = [...existingUser.userAchievements].map((achievement: User_Achievement) =>
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

            const completedHikes = [...existingUser.completedHikes].map((completedHike: Completed_Hike) =>
                // @ts-ignore
                watermelonDatabase.collections.get('completed_hikes').prepareCreate((newCompletedHike: Completed_Hike) => {

                    // @ts-ignore
                    newCompletedHike.userId = completedHike.user_id;
                    // @ts-ignore
                    newCompletedHike.trailId = completedHike.trail_id;
                    // @ts-ignore
                    newCompletedHike.bestCompletedTime = completedHike.best_completed_time;
                    // @ts-ignore
                    newCompletedHike.firstCompletedAt = completedHike.first_completed_at;
                    // @ts-ignore
                    newCompletedHike.lastCompletedAt = completedHike.last_completed_at;
                    // @ts-ignore
                    newCompletedHike.createdAt = completedHike.created_at;
                    // @ts-ignore
                    newCompletedHike.updatedAt = completedHike.updated_at;

                })
            )
            console.debug('attempting to writebatch of new user from master DB')
            await watermelonDatabase.batch([newUser, userMiles, ...userSessions, ...userPurchasedTrails, userSubscriptions, ...userAchievements, ...completedHikes]);
            console.debug('batch write done...')
        });

        // Retrieve the newly created user from the database
          console.debug('retrieving new user from DB')
        existingUser = await checkExistingUser(email, password, watermelonDatabase);
          console.debug('Retrieved new user: ' + existingUser);
        //await sync(watermelonDatabase, existingUser.id);
      }
    }

    if (!existingUser) {
      setError('Invalid Email or Password');
      return;
    }

    console.debug('Setting user in subscription', existingUser);
    await setSubscriptionStatus(existingUser, watermelonDatabase);
    const response = await setLocalStorageUserAndMiles(existingUser, watermelonDatabase);

    if (response) {
      console.log('Setting user locally', existingUser);
      setUser((prevUser: User | null ) =>(existingUser)
      );
      return;
    }
  } catch (err) {
    console.error('Error in handling Login', err);
  }
};

