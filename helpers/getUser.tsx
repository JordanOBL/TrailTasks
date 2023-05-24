import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import watermelonDatabase from '../watermelon/getWatermelonDb';
import { User } from '../watermelon/models';
import { Q } from '@nozbe/watermelondb';

const getUser = () => {
  const [user, setUser] = React.useState<any>(null);
  React.useEffect(() => {
    const userFromDB = async (): Promise<void> => {
      try
      {
        const userId: string | void = await watermelonDatabase.localStorage.get('user_id');
        if (userId)
        {
          const thisUser = await watermelonDatabase.get('users').query(Q.where("id", userId)).fetch();
          if (thisUser[0] !== undefined)
          {
            setUser(thisUser[0]);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    userFromDB();
  }, []);
  return user
};

export default getUser;

const styles = StyleSheet.create({});
