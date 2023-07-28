import {StyleSheet, Text, View} from 'react-native';
import React from 'react';


import {User} from '../watermelon/models';
import {Database, Q} from '@nozbe/watermelondb';

const getUser = (watermelonDatabase: Database) => {
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const userFromDB = async (): Promise<void> => {
      try {
        const userId: string | void = await watermelonDatabase.localStorage.get(
          'user_id'
        );
        if (userId) {
          const thisUser = await watermelonDatabase
            .get('users')
            .query(Q.where('id', userId))
            .fetch();
          if (thisUser[0] !== undefined)
          {
            console.log(thisUser)
            //@ts-ignore
            setUser(thisUser[0]);
          }
        } else
        {
          setUser(null)
        }
      } catch (err) {
        console.error('error in getUser helper funtion', err);
      }
    };
    userFromDB();
  }, [user]);
  return {user, setUser};
};

export default getUser;

const styles = StyleSheet.create({});
