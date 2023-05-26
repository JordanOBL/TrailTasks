
import React from 'react';

import {Trail} from '../../watermelon/models';
import {Database, Q} from '@nozbe/watermelondb';

const getTrails = (watermelonDatabase: Database) => {
  const [trails, setTrails] = React.useState<Trail[]| null>(null);


  React.useEffect(() => {
    const trailsFromDB = async (): Promise<void> => {
      try {
        const userId: string | void = await watermelonDatabase.localStorage.get(
          'user_id'
        );
        if (userId) {
          const Trails = await watermelonDatabase
            .get('trails')
            .query()
            .fetch();
          if (Trails[0] !== undefined) {
            console.log(Trails);
            //setUser(thisUser[0]);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    trailsFromDB();
  }, []);
  return {trails, setTrails};
};

export default getTrails;

