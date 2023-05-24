//import watermelonDatabase from '../watermelon/getWatermelonDb';
import { Q } from '@nozbe/watermelondb';
import { formatDateTime } from '../components/formatDateTime';
import { User, User_Miles } from '../watermelon/models';

const checkExistingUser = async ({
  username,
  email,
  watermelonDatabase
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
    return ExistingUser;
  } catch (err) {
    console.error('Error in checking for existing user in user register', err);
  }
};

const createNewUser = async ({
  firstName,
  lastName,
  email,
  password,
  username,
  setUser,
  setError,
  watermelonDatabase
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
    const current_trail_start = formatDateTime(new Date());
    //!BCYPT PASSWORD BEFORE ADDING TO DB
    const newUser = await watermelonDatabase.write(async () => {
      const createdUser = await watermelonDatabase
        .get('users')
        .create((user: User) => {
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
          //@ts-ignore
          user.trailStartedAt = current_trail_start;
          //@ts-ignore
          user.createdAt = current_trail_start;
          //@ts-ignore
          user.updatedAt = current_trail_start;
        });

      if (createdUser) {
        const userMiles = await watermelonDatabase
          .get('users_miles')
          .create((user_miles: User_Miles) => {
            //@ts-ignore
            user_miles.userId = createdUser._raw.id;
            //@ts-ignore
            user_miles.totalMiles = '0.00';
          });
      }

      return createdUser;
    });

    if (newUser.id.length > 0) {
      await watermelonDatabase.localStorage.set('user_id', newUser.id);
      //@ts-ignore
      await watermelonDatabase.localStorage.set('username', newUser.username);
      setUser({userId: newUser.id});
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
    const ExistingUser = await checkExistingUser({username, email, watermelonDatabase});
    //create new user
    if (ExistingUser!.length === 0) {
      const createdUser = await createNewUser({
        firstName,
        lastName,
        email,
        password,
        username,
        setUser,
        setError,
        watermelonDatabase
      });

      if (createdUser!) {
        console.log('successful user creation');
        return;
      } //@ts-ignore
    } else if (ExistingUser && ExistingUser[0].email === email) {
      setError('User Already Exists With Provided Email, Please Login');
      return; //@ts-ignore
    } else if (ExistingUser && ExistingUser[0].username === username) {
      setError('User Already Exists With Username, Please Choose New Username');
      return;
    }
  } catch (err) {
    console.error('Error in handle Register', err);
  }
};
