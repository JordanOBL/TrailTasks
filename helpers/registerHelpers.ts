import {Subscription, User, User_Miles} from '../watermelon/models';

//import watermelonDatabase from '../watermelon/getWatermelonDb';
import {Q} from '@nozbe/watermelondb';
import formatDateTime from './formatDateTime';

export const checkExistingUser = async ({
  username,
  email,
  watermelonDatabase,
}: {
  username: string;
  email: string;
  watermelonDatabase: any;
}) => {
  try {
    const ExistingUser = await watermelonDatabase
      .get('users')
      .query(Q.or(Q.where('email', email), Q.where('username', username)))
      .fetch();

    return ExistingUser[0];
  } catch (err) {
    console.error('Error in checkExistingUser(), registerHelpers.tsx', err);
  }
};

export const createNewUser = async ({
  firstName,
  lastName,
  email,
  password,
  username,
  setUser,
  setError,
  watermelonDatabase,
}: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  username: string;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  setError: React.Dispatch<React.SetStateAction<any>>;
  watermelonDatabase: any;
}) => {
  try {
    const trailStartedAt = formatDateTime(new Date());

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
        user.trailStartedAt = trailStartedAt;
        //@ts-ignore
        user.trailTokens = 20;

      })
   
    return newUser
     });
    if (newUser) {
     
      const userMiles = await newUser.addUserMile();

      const subscription = await newUser.addUserSubscription();

      if (userMiles) {
        await watermelonDatabase.localStorage.set(
          'user_miles_id',
          userMiles.id
        );
      }
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
      setUser(newUser);
      return newUser;
    }
  } catch (err) {
    console.error('error creating new registered user', err);
  }
};

export const handleRegister = async ({
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
  username,
  setUser,
  setError,
  watermelonDatabase,
}: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  setError: React.Dispatch<React.SetStateAction<any>>;
  watermelonDatabase: any;
}): Promise<void> => {
  try {
    if (
      firstName.trim() === '' ||
      lastName.trim() === '' ||
      email.trim() === '' ||
      password.trim() === '' ||
      confirmPassword.trim() === ''
    ) {
      setError('All fields are required');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    //check for exitsing user
    const ExistingUser = await checkExistingUser({
      username,
      email,
      watermelonDatabase,
    });
    //create new user
    if (!ExistingUser) {
      const createdUser = await createNewUser({
        firstName,
        lastName,
        email,
        password,
        username,
        setUser,
        setError,
        watermelonDatabase,
      });

      if (createdUser) {
        console.log('successful user creation');
      }
      return;
      //@ts-ignore
    } else if (
      ExistingUser &&
      ExistingUser.email.toLowerCase() === email.toLowerCase()
    ) {
      setError('User Already Exists With Provided Email, Please Login');
      return; //@ts-ignore
    } else if (
      ExistingUser &&
      ExistingUser.username.toLowerCase() === username.toLowerCase()
    ) {
      setError('User Already Exists With Username, Please Choose New Username');
      return;
    } else {
      setError('Unkown Error, please Restart');
      return;
    }
  } catch (err) {
    console.error('Error in handle Register', err);
  }
};
