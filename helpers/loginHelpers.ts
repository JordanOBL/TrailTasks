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
    if (existingUser.length > 0) {
      await watermelonDatabase.localStorage.set('user_id', existingUser[0].id);
      await watermelonDatabase.localStorage.set(
        'username',
        //@ts-ignore
        existingUser[0].username
      );
      return existingUser[0];
    }
  } catch (err) {
    console.log('error in checkexisting user function', err);
  }
};

//*This funtion persits logged in user from local storrage
export const checkForLoggedInUser = async (
  setUserId: React.Dispatch<React.SetStateAction<any>>,
  watermelonDatabase: Database
) => {
  try {
    const userId = await watermelonDatabase.localStorage.get('user_id'); // string or undefined if no value for this key
    console.log('User info from local Storage', {userId});

    if (userId) {
      console.log('FOUND USER!');
      const thisUser = await watermelonDatabase
        .get('users')
        .query(Q.where('id', `${userId}`))
        .fetch();
      if (thisUser[0] !== undefined) {
        console.log(thisUser);
        setUserId(userId);
      }
    }
  } catch (error) {
    console.error('Error in checkForUser function, app.tsx', error);
  }
};

export const handleLogin = async ({
  email,
  password,
  setUserId,
  setError,
  watermelonDatabase,
}: {
  email: string;
  password: string;
  setUserId: React.Dispatch<React.SetStateAction<any>>;
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
    //set user info in app state
    setUserId(existingUser._raw.id);
  } catch (err) {
    console.error('Error in handling Login', err);
  }
};
