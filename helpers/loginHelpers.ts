import {Database, Q} from '@nozbe/watermelondb';
import {User, Subscription, User_Miles,User_Purched_Trail, User_Session, User_Achievement} from '../watermelon/models';
import checkInternetConnection from '../helpers/InternetConnection/checkInternetConnection';
import sync from '../watermelon/sync';
import {prepareCreate} from '@nozbe/watermelondb/QueryDescription';

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
    const response = await fetch('http://192.168.1.42:5500/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

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
  user: User,
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
    return undefined
  } catch (err) {
    console.error('Error in setSubscriptionStatus()', {err});
  }
};

export const setLocalStorageUserAndMiles = async (
  existingUser: any,
  watermelonDatabase: Database
) => {
  try {
    console.log('existingUser', existingUser);
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
        await setSubscriptionStatus(user, watermelonDatabase);
      }

      setUser(user);
    }
  } catch (error) {
    console.error('Error in checkForUser(), app.tsx', error);
  }
};

//export const handleLogin = async ({
//  email,
//  password,
//  setUser,
//  setError,
//  watermelonDatabase,
//}: {
//  email: string;
//  password: string;
//  setUser: React.Dispatch<React.SetStateAction<any>>;
//  setError: React.Dispatch<React.SetStateAction<any>>;
//  watermelonDatabase: Database;
//}): Promise<void> => {
//  try {
//    if (email.trim() === '' || password.trim() === '') {
//      setError('All fields are required');
//      return;
//    }
//    //check for exitsing user
//    const existingUser = await checkExistingUser(
//      email,
//      password,
//      watermelonDatabase
//    );
//
//    if (!existingUser) {
//      setError('Invalid Email or Password');
//      return;
//    }
//    //@ts-ignore
//    await setSubscriptionStatus(existingUser, watermelonDatabase);
//    const response = await setLocalStorageUserAndMiles(
//      existingUser,
//      watermelonDatabase
//    );
//    if (response) {
//      setUser(existingUser);
//      return;
//    }
//  } catch (err) {
//    console.error('Error in handling Login', err);
//  }
//};



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
    const { connection } = await checkInternetConnection();

    let existingUser = await checkExistingUser(email, password, watermelonDatabase);

    // If not found locally and internet is available, check globally
    if (!existingUser && connection.isConnected) {
      existingUser = await checkExistingGlobalUser(email, password);
      console.log('Global existingUser:', existingUser);

      if (existingUser) {
      console.debug('existingUser found from checkExistingGlobalUser',{existingUser})
        // Save the user and related data to local database
        await watermelonDatabase.write(async () => {
            // Create user
          
           const newUser = watermelonDatabase.collections.get('users').prepareCreate((newUser: User) => {
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
          console.debug({newUser})
            // Create user miles
            const userMiles = watermelonDatabase.collections.get('users_miles').prepareCreate((newUserMiles: User_Miles) => {
              newUserMiles._raw.id = existingUser.userMiles.id;
              newUserMiles.totalMiles = existingUser.userMiles.total_miles;
              newUserMiles.userId = existingUser.userMiles.user_id;
       })
            console.debug({userMiles})

            // Create user sessions
            const userSessions = [...existingUser.userSessions].map((session: User_Session) =>
              watermelonDatabase.collections.get('users_sessions').prepareCreate((newUserSession: User_Session) => {
                newUserSession._raw.id = session.id;
                newUserSession.userId = session.user_id;
                newUserSession.sessionName = session.session_name;
                newUserSession.sessionDescription = session.session_description;
                newUserSession.totalDistanceHiked = session.total_distance_hiked;
                newUserSession.totalSessionTime = session.total_session_time;
                newUserSession.sessionCategoryId = session.session_category_id;
                newUserSession.createdAt = session.created_at;
                newUserSession.dateAdded = session.date_added;
                newUserSession.sessionStartedAt = session.session_started_at;
                newUserSession.sessionEndedAt = session.session_ended_at;
              })
            )
          console.debug({userSessions})
//            // Create user purchased trail
            const userPurchasedTrails = [...existingUser.userPurchasedTrails].map((trail: User_Purchased_Trail) =>
              watermelonDatabase.collections.get('users_purchased_trails').prepareCreate((newUserPurchasedTrail: UserPurchasedTrail) => {
                newUserPurchasedTrail._raw.id = trail.id;
                newUserPurchasedTrail.userId = trail.user_id;
                newUserPurchasedTrail.purchasedAt = trail.purchased_at;
                newUserPurchasedTrail.trailId = trail.trail_id;
                newUserPurchasedTrail.createdAt = trail.created_at;
              })
            )  
            console.debug({userPurchasedTrails})
//            // Create user subscription
            const userSubscriptions =  watermelonDatabase.collections.get('users_subscriptions').prepareCreate((newUserSubscription: Subscription) => {
              newUserSubscription._raw.id = existingUser.userSubscription.id;
              newUserSubscription.userId = existingUser.userSubscription.user_id;
              newUserSubscription.isActive = existingUser.userSubscription.is_active;
            })
//            // Create user achievements
            const userAchievements = [...existingUser.userAchievements].map((achievement: UserAchievement) =>
              watermelonDatabase.collections.get('users_achievements').prepareCreate((newUserAchievement: User_Achievement) => {
                newUserAchievement._raw.id = achievement.id;
                newUserAchievement.userId = achievement.user_id;
                newUserAchievement.achievementId = achievement.achievement_id;
                newUserAchievement.achievementDescription = achievement.achievement_description;
                newUserAchievement.createdAt = achievement.created_at;
                newUserAchievement.completedAt = achievement.completed_at;
              })
            )
            await watermelonDatabase.batch([newUser, userMiles, ...userSessions, ...userPurchasedTrails, userSubscriptions, ...userAchievements]);
      
        });

        // Retrieve the newly created user from the database
        existingUser = await checkExistingUser(email, password, watermelonDatabase);
        await sync(watermelonDatabase, existingUser.id);
      }
    }

    if (!existingUser) {
      setError('Invalid Email or Password');
      return;
    }

    //@ts-ignore
    await setSubscriptionStatus(existingUser.user, watermelonDatabase);
    const response = await setLocalStorageUserAndMiles(existingUser, watermelonDatabase);

    if (response) {
      console.log('Setting user locally', existingUser);
      setUser(existingUser);
      return;
    }
  } catch (err) {
    console.error('Error in handling Login', err);
  }
};

