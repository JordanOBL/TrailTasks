import React from 'react';

import {Trail} from '../../watermelon/models';
import {Database, Q} from '@nozbe/watermelondb';

const getCurrentTrail = (user: any, watermelonDatabase: Database) => {
  const [currentTrail, setCurrentTrail] = React.useState<Trail | null>(null);

  React.useEffect(() => {
    const currentTrailFromDB = async (): Promise<void> => {
      try
      {
        const userCurrentTrailId: string = user.trailId
        const foundTrail: any = await watermelonDatabase
          .get('trails')
          .find(userCurrentTrailId)
     
        if (foundTrail)
        {
          setCurrentTrail(foundTrail)
        }

      } catch (err) {
        console.error('Error in getCurrentTrail()', err);
      }
    };
    currentTrailFromDB();
  }, []);
  return {currentTrail, setCurrentTrail};
};

export default getCurrentTrail;
