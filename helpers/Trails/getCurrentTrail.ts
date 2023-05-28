import React from 'react';

import {Trail} from '../../watermelon/models';
import {Database, Q} from '@nozbe/watermelondb';

const getCurrentTrail = (user: any, watermelonDatabase: Database) => {
  const [currentTrail, setCurrentTrail] = React.useState<Trail | null>(null);

  React.useEffect(() => {
    const currentTrailFromDB = async (): Promise<void> => {
      try
      {
        const userCurrentTrailId: string = user._raw.trail_id
        const foundTrail: any = await watermelonDatabase
          .get('trails')
          .find(userCurrentTrailId)
     
        if (foundTrail)
        {
          console.log({foundTrail})
          setCurrentTrail(foundTrail)
        }

      } catch (err) {
        console.error(err);
      }
    };
    currentTrailFromDB();
  }, []);
  return {currentTrail, setCurrentTrail};
};

export default getCurrentTrail;
