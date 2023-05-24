import {User_Miles} from '../watermelon/models';
import React from 'react';
import watermelonDatabase from '../watermelon/getWatermelonDb';
import {Q} from '@nozbe/watermelondb';

const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = React.useState<User_Miles[]>();

  React.useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // const leaderboard = await watermelonDatabase
        //   .get('users_miles')
        //   .query(Q.sortBy('total_miles', Q.desc))
       const leaderboard = await watermelonDatabase
         .get('users_miles')
         .query(
           Q.unsafeSqlQuery(
             'SELECT users_miles.*, users.username FROM users_miles ' +
               'LEFT JOIN users ON users.id = users_miles.user_id ' +
               'ORDER BY CAST(users_miles.total_miles AS REAL) DESC'
           )
         )
         .unsafeFetchRaw();


        console.log(leaderboard)

        if (leaderboard) {
          //@ts-ignore
          setLeaderboard(leaderboard);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchLeaderboard();
  }, []);
  return leaderboard;
};

export default useLeaderboard;
