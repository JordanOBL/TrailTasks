//creating a new session

import {Database, Q} from '@nozbe/watermelondb';
import {formatDateTime} from '../formatDateTime';
import {User, User_Miles} from '../../watermelon/models';
export async function createSession({
  database,
  userId,
  sessionName,
  sessionDescription,
  sessionCategoryId,
}: {
  database: Database;
  userId: string;
  sessionName: string;
  sessionDescription: string;
  sessionCategoryId: number;
}) {
  try {
    const newSession = await database
      .get('users_sessions')
      .create((userSession) => {
        userSession.userId = userId;
        userSession.sessionName = sessionName;
        userSession.sessionDescription = sessionDescription;
        userSession.sessionCategoryId = sessionCategoryId.toString();
        userSession.dateAdded = formatDateTime(new Date());
        userSession.totalSessionTime = 0;
        userSession.totalDistanceHiked = '0.00';
      });
  } catch (err) {
    console.log(
      'Error creating new session in "createSession" helper func',
      err
    );
  }
}

//updating a session

//update users_miles
export async function updateUserMilesAndUser({
  database,
  userId,
  trailProgress,
  totalDistanceHiked,
}: {
  database: Database;
    userId: string;
    trailProgress: string;
  totalDistanceHiked: string;
}) {
  try {
    await database.write(async () => {
      const userMiles: User_Miles = await database
        .get('users_miles')
        .query(Q.where('user_id', userId))
        .fetch();
      await userMiles.update(() => {
        userMiles.totalMiles = (
          Number(userMiles.totalMiles) +
          (Math.abs(Number(userMiles.totalMiles) - Number(totalDistanceHiked)))
        ).toFixed(2);
      });
      const user: User = await database
        .get('users')
        .find(userId)
      await user.update(() => {
        user.trailProgress = trailProgress
      });
    });
  } catch (err) {
    console.log(
      'Error updating user miles and user in "updateUsersMilesAndUser" helper func',
      err
    );
  }
}

//update userInfo
export async function startNewTrail({
  database,
  userId,
  trailId

}: {
  database: Database;
  userId: string;
  trailId: string;
}) {
  try {
    await database.write(async () => {
      const user: User = await database
        .get('users')
        .find(userId)
      await user.update(() => {
        user.trailId = trailId
      });
    });
  } catch (err) {
    console.log(
      'Error setting new trail in "startNewTrail" helper func',
      err
    );
  }
}

//start a session

//skip session break

//pause a session

//end a session
