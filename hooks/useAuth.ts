import { useState, useEffect, useCallback } from 'react';
import { Database } from '@nozbe/watermelondb';
import { checkForLoggedInUser, checkLocalUserExists, checkGlobalUserExists,  setLocalStorageUser, createNewUser , registerValidation, saveUserToLocalDB} from '../services/auth';
import {useInternetConnection} from './useInternetConnection';
import handleError from '../helpers/ErrorHandler';
import { User } from '../watermelon/models';
import {sync} from '../watermelon/sync';

type UseAuthParams = {
  watermelonDatabase: Database;
  initialUser?: User | null;
};

export function useAuth({ watermelonDatabase, initialUser = null }: UseAuthParams) {
  const {isConnected} = useInternetConnection();
  const [user, setUser] = useState<any>(initialUser);
  const [error, setError] = useState<string>('');

  // Observe user changes (only if user is a Watermelon model)
//  useEffect(() => {
//    let subscription: any;
//    if (user && typeof user.observe === 'function') {
//      subscription = user.observe().subscribe((updatedUser: any) => {
//        setUser(updatedUser);
//      });
//    }
//    return () => subscription?.unsubscribe();
//  }, [user]);

  // Check if there's a user in local DB
  const initUser = useCallback(async () => {
    try {
      if(watermelonDatabase) {
         await checkForLoggedInUser(setUser, watermelonDatabase);

      }
         } catch (err) {
      handleError(err, 'initUser in useAuth');
    }
  }, [watermelonDatabase]);

  useEffect(() => {
    initUser();
  }, [initUser]);

  // Wrap your existing “handleLogin” logic
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setError('');
        if (!email.trim() || !password.trim()) {
          setError('All fields are required');
          return;
        }

        let localUser = await checkLocalUserExists(email.toLowerCase(), password, watermelonDatabase);
        if (!localUser && isConnected) {
          // Attempt remote login
          const remoteUser = await checkGlobalUserExists(email.toLowerCase(), password);
          if (remoteUser) {
            // Write remote data to local DB (this is your large block that creates user, sessions, etc.)
            await saveUserToLocalDB(remoteUser, watermelonDatabase);
            localUser = await checkLocalUserExists(email.toLowerCase(), password, watermelonDatabase);
          }
        }
        if (!localUser) {
          setError('Incorrect Email or Password');
          return;
        }

        //await setSubscriptionStatus(localUser, watermelonDatabase);
        await setLocalStorageUser(localUser, watermelonDatabase);
        setUser(localUser);
      } catch (err) {
        handleError(err, 'login in useAuth');
      }
    },
    [watermelonDatabase]
  );

  // Wrap your existing “handleRegister” logic
  const register = useCallback(
    async ({ email, password, confirmPassword, username}:{
      email: string,
      password: string,
      confirmPassword: string,
      username: string
    }) => {

      try {
        setError('');

        // Basic validation
        if (!email || !password || !confirmPassword || !username) {
          setError('All fields are required');
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        const result = await registerValidation(email.toLowerCase(), username.toLowerCase());
        if (result.duplicateAttribute) {
            setError(result.message);
            return;
        }

        // Otherwise create user in local DB
        const newUser = await createNewUser(
          {  email: email.toLowerCase(), password, username: username.toLowerCase(), watermelonDatabase}
        );
        if (newUser) {
          // Possibly set user in state after register
          setUser(newUser);
          await sync(watermelonDatabase, isConnected, newUser.id);
        }
      } catch (err) {
        handleError(err, 'register in useAuth');
      }
    },
    [watermelonDatabase]
  );

  // Optional: logout or remove user from local storage
  const logout = useCallback(async () => {
    try {
      // Clear local storage items, e.g. user_id, subscription
      await watermelonDatabase.localStorage.remove('user_id');
      await watermelonDatabase.localStorage.remove('username');
      setUser(null);
    } catch (err) {
      handleError(err, 'logout in useAuth');
    }
  }, [watermelonDatabase]);

  return {
    user,
    setUser,
    error,
    initUser,
    login,
    register,
    logout,
    setError,  // if your UI needs to manually clear or set an error
  };
}

