import watermelonDatabase from '../watermelon/getWatermelonDb';
import {Q} from '@nozbe/watermelondb';

export const checkExistingUser = async (email: string) => {
  try {
    const existingUser = await watermelonDatabase
      .get('users')
      .query(Q.where('email', email))
      .fetch();
    if (existingUser.length > 0) {
      await watermelonDatabase.localStorage.set('user_id', existingUser[0].id);
      await watermelonDatabase.localStorage.set(
        'username',
        existingUser[0].username
      );
      return existingUser[0];
    }
  } catch (err) {
    console.log(err);
  }
};

export const handleLogin = async (
  email: string,
  password: string,
  setUserCb: React.Dispatch<React.SetStateAction<any>>,
  errorCb: React.Dispatch<React.SetStateAction<any>>
): Promise<void> => {
  try {
    if (email.trim() === '' || password.trim() === '') {
      errorCb('All fields are required');
      return;
    }
    //check for exitsing user
    const existingUser = await checkExistingUser(email);

    if (!existingUser) {
      errorCb('Invalid Email or Password');
      return;
    }
    //set user info in app state
    setUserCb({userId: existingUser._raw.id});
  } catch (err) {
    console.error('Error in handling Login', err);
  }
};
