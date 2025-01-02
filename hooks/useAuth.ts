import { useState, useEffect, useCallback } from 'react';
import { Database } from '@nozbe/watermelondb';
import { checkForLoggedInUser, checkLocalUserExists, checkGlobalUserExists, setSubscriptionStatus, setLocalStorageUser, createNewUser } from '../services/auth';
import {useInternetConnection} from './useInternetConnection';
import handleError from '../helpers/ErrorHandler';
import { User } from '../watermelon/models';

type UseAuthParams = {
  watermelonDatabase: Database;
  initialUser?: User | null;
};

export function useAuth({ watermelonDatabase, initialUser = null }: UseAuthParams) {
  const {isConnected} = useInternetConnection();
  const [user, setUser] = useState<any>(initialUser);
  const [error, setError] = useState<string>('');

  // Observe user changes (only if user is a Watermelon model)
  useEffect(() => {
    let subscription: any;
    if (user && typeof user.observe === 'function') {
      subscription = user.observe().subscribe((updatedUser: any) => {
        setUser(updatedUser);
      });
    }
    return () => subscription?.unsubscribe();
  }, [user]);

  // Check if there's a user in local DB
  const initUser = useCallback(async () => {
    console.debug('initUser in useAuth');
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

        let localUser = await checkLocalUserExists(email, password, watermelonDatabase);
        if (!localUser && isConnected) {
          // Attempt remote login
          const remoteUser = await checkGlobalUserExists(email, password);
          if (remoteUser) {
            // Write remote data to local DB (this is your large block that creates user, sessions, etc.)
            await saveUserToLocalDB(remoteUser, watermelonDatabase);
            localUser = await checkLocalUserExists(email, password, watermelonDatabase);
          }
        }
        if (!localUser) {
          setError('Incorrect Email or Password');
          return;
        }

        await setSubscriptionStatus(localUser, watermelonDatabase);
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
    async ({firstName, lastName, email, password, confirmPassword, username}:{
      firstName: string,
      lastName: string,
      email: string,
      password: string,
      confirmPassword: string,
      username: string
    }) => {

      console.debug('register in useAuth');
      console.debug({firstName, lastName, email, password, confirmPassword, username});
      try {
        setError('');

        // Basic validation
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
          console.log('All fields are required');
          setError('All fields are required');
          return;
        }
        if (password !== confirmPassword) {
          console.log('Passwords do not match');
          setError('Passwords do not match');
          return;
        }
        const existing = await checkGlobalUserExists(username, email, watermelonDatabase);
        if (existing) {
          if (existing.email.toLowerCase() === email.toLowerCase()) {
            setError('User Already Exists. Please Login');
          } else if (existing.username.toLowerCase() === username.toLowerCase()) {
            setError('Username is taken. Please choose a new username');
          }
          return;
        }

        // Otherwise create user in local DB
        const newUser = await createNewUser(
          { firstName, lastName, email, password, username ,
          watermelonDatabase}
        );
        if (newUser) {
          // Possibly set user in state after register
          setUser(newUser);
          await sync(watermelonDatabase, isConnected, newUser);
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

