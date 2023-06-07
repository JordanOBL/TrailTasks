import {Database, Q} from '@nozbe/watermelondb';
import {User} from '../watermelon/models';

//*this function checks for a user in the database matching users login input
export const checkExistingUser = async (
  email: string,
  password: string,
  watermelonDatabase: Database
) => {
  try {
    const existingUser = await watermelonDatabase
      .get('users')
      .query(Q.where('email', email), Q.where('password', password))
      .fetch();

    return existingUser[0];
  } catch (err) {
    console.log('error in checkexisting user function', err);
  }
};

const setLocalStorageUserAndMiles = async (
  existingUser: any,
  watermelonDatabase: Database
) => {
  try {
    await watermelonDatabase.localStorage.set('user_id', existingUser.id);
    console.log('Set localStorage userId');
    await watermelonDatabase.localStorage.set(
      'username',
      //@ts-ignore
      existingUser.username
    );
    console.log('Set localStorage username');
    //get usersMilesId
    const usersMiles = await watermelonDatabase
      .get('users_miles')
      .query(Q.where('user_id', existingUser.id))
      .fetch();
    if (usersMiles.length > 0) {
      await watermelonDatabase.localStorage.set(
        'users_miles_id',
        usersMiles[0].id
      );
      console.log('Set localStorage UsersMilesId');
    }
    return true;
  } catch (err) {
    console.log('Error setting localStorageUserMilesId', err);
  }
};

//*This funtion persits logged in user from local storrage
export const checkForLoggedInUser = async (
  setUser: React.Dispatch<React.SetStateAction<any>>,
  watermelonDatabase: Database
) => {
  try {
    const userId: string | void = await watermelonDatabase.localStorage.get(
      'user_id'
    ); // string or undefined if no value for this key
    console.log('User info from local Storage', userId);

    if (userId) {
      let user = await watermelonDatabase.collections.get('users').find(userId);
      console.log({user})
      setUser(user);
    }
  } catch (error) {
    console.error('Error in checkForUser function, app.tsx', error);
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
