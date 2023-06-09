import React from 'react';

import {Trail} from '../../watermelon/models';
import {Database, Q} from '@nozbe/watermelondb';

const getTrails = (watermelonDatabase: Database) => {
  const [trails, setTrails] = React.useState<Trail[] | null>(null);

  React.useEffect(() => {
    const trailsFromDB = async (): Promise<void> => {
      try {
        // Gets trails with parks
        const Trails = await watermelonDatabase.collections
          .get('trails')
          .query(
            Q.unsafeSqlQuery(
              'SELECT trails.*, parks.park_name, parks.park_type FROM trails ' +
                'LEFT JOIN parks ON parks.id = trails.park_id '
            )
          )
          .unsafeFetchRaw();
        if (Trails[0] !== undefined) {
          console.log(Trails);
          //@ts-ignore
          setTrails(Trails);
        }
        //}
      } catch (err) {
        console.error(err);
      }
    };
    trailsFromDB();
  }, []);
  return {trails, setTrails};
};

export default getTrails;
