import React from 'react';

import {Trail} from '../../watermelon/models';
import {Database, Q} from '@nozbe/watermelondb';

const getJoinedUserTrail = (watermelonDatabase: Database, userId: string ) => {
  const [joinedUserTrail, setJoinedUserTrail] = React.useState<any>()

  React.useEffect(() => {
    const userTrailResponse = async (): Promise<void> => {
      try {
        // Gets trails with parks
        const userTrailResponse = await watermelonDatabase
          .get('users')
          .query(
            Q.unsafeSqlQuery(
              'SELECT users.*, trails.*, parks.park_name, parks.park_type ' +
                'FROM users ' +
                'LEFT JOIN trails ON trails.id = users.trail_id  ' +
                'LEFT JOIN parks on trails.park_id = parks.id ' +
                'WHERE users.id = ? ',
              [userId]
            )
          )
          .unsafeFetchRaw();
        if (userTrailResponse !== undefined) {
          console.log(userTrailResponse[0]);
          //@ts-ignore
          setJoinedUserTrail(userTrailResponse[0]);
        }
        //}
      } catch (err) {
        console.error(err);
      }
    };
    userTrailResponse();
  }, [setJoinedUserTrail]);
  return {joinedUserTrail, setJoinedUserTrail};
};

export default getJoinedUserTrail;
