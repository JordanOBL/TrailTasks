import watermelonDatabase from '../watermelon/getWatermelonDb';
import {Q} from '@nozbe/watermelondb';

export const checkExistingUser = async (email: string, password: string) => {
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
    console.log(err);
  }
};

export const handleLogin = async ({
  email,
  password,
  setUser,
  setError,
}: {
  email: string;
  password: string;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  setError: React.Dispatch<React.SetStateAction<any>>;
}): Promise<void> => {
  try {
    if (email.trim() === '' || password.trim() === '') {
      setError('All fields are required');
      return;
    }
    //check for exitsing user
    const existingUser = await checkExistingUser(email, password);

    if (!existingUser) {
      setError('Invalid Email or Password');
      return;
    }
    //set user info in app state
    setUser({userId: existingUser._raw.id});
  } catch (err) {
    console.error('Error in handling Login', err);
  }
};
