import React from 'react';

import {Trail} from '../../watermelon/models';
import {Database, Q} from '@nozbe/watermelondb';
import handleError from "../ErrorHandler";

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
        handleError(err, "getCurrentTrail");
      }
    };
    currentTrailFromDB();
  }, []);
  return {currentTrail, setCurrentTrail};
};

export default getCurrentTrail;
