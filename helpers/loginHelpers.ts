import {Database, Q} from '@nozbe/watermelondb';
import {User, Subscription} from '../watermelon/models';

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

export const setSubscriptionStatus = async (
  user: User,
  watermelonDatabase: Database
) => {
  try {
    const subscription: Subscription[]| any = await watermelonDatabase.collections
      .get('users_subscriptions')
      .query(Q.where('user_id', user.id))
      .fetch();
    if (subscription[0]) {
      await watermelonDatabase.localStorage.set(
        'subscription_id',
        subscription[0].id
      );
    } 
  } catch (err) {
    console.error('Error in setSubscriptionStatus()', err);
  }
};

export const setLocalStorageUserAndMiles = async (
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
    //get usersMilesId
    const usersMiles = await watermelonDatabase
      .get('users_miles')
      .query(Q.where('user_id', existingUser.id))
      .fetch();
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
    const userId: string | undefined | void = await watermelonDatabase.localStorage.get(
      'user_id'
    ); // string or undefined if no value for this key
  

    if (userId) {
      let user = await watermelonDatabase.collections.get('users').find(userId);
      console.debug("checking logged in user information, checkForLoggedInUser()");
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
    //check for exitsing user
    const existingUser = await checkExistingUser(
      email,
      password,
      watermelonDatabase
    );

    if (!existingUser) {
      setError('Invalid Email or Password');
      return;
    }
    //@ts-ignore
    await setSubscriptionStatus(existingUser, watermelonDatabase);
    const response = await setLocalStorageUserAndMiles(
      existingUser,
      watermelonDatabase
    );
    if (response) {
      setUser(existingUser);
      return;
    }
  } catch (err) {
    console.error('Error in handling Login', err);
  }
};
