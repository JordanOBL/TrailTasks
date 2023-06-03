//creating a new session

import {Database, Q} from '@nozbe/watermelondb';
import {formatDateTime} from '../formatDateTime';
import {
  Completed_Hike,
  User,
  User_Miles,
  User_Session,
} from '../../watermelon/models';
import {JoinedUserTrail, SessionDetails} from '../../types/session';
import {Vibration} from 'react-native';
import nextHundredthMileSeconds from './nextHundrethMileSeconds';
import getTimeDifference from './getTimeDifference';
import {getBetterTime} from './getBetterTime';

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
        //@ts-ignore
        userSession.userId = userId;
        //@ts-ignore
        userSession.sessionName = sessionName;
        //@ts-ignore
        userSession.sessionDescription = sessionDescription;
        //@ts-ignore
        userSession.sessionCategoryId = sessionCategoryId.toString();
        //@ts-ignore
        userSession.dateAdded = formatDateTime(new Date());
        //@ts-ignore
        userSession.totalSessionTime = 0;
        //@ts-ignore
        userSession.totalDistanceHiked = '0.00';
      });
  } catch (err) {
    console.log(
      'Error creating new session in "createSession" helper func',
      err
    );
  }
}

//increase distance hiked
export async function increaseDistanceHiked(
  setJoinedUserTrail: React.Dispatch<React.SetStateAction<JoinedUserTrail>>,
  joinedUserTrail: JoinedUserTrail,
  setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>,
  sessionDetails: SessionDetails
) {
  //UPDATE CURRENT TRAILDISTANCE in session when user walks .01 miles

  //increase state current_trail_distance, user total miles by .01 every .01 miles (pace dependent)
  console.log({
    0: sessionDetails.totalDistanceHiked,
    1: sessionDetails.presaveDistanceHiked,
    2: joinedUserTrail.trail_progress,
    4: sessionDetails.pace,
  });
  if (
    sessionDetails.elapsedPomodoroTime %
      nextHundredthMileSeconds(sessionDetails.pace) ==
      0 &&
    Number(joinedUserTrail.trail_progress) <
      Number(joinedUserTrail.trail_distance)
  ) {
    setJoinedUserTrail((prev: any) => {
      return {
        ...prev,
        trail_progress: (Number(prev.trail_progress) + 0.01).toFixed(2),
      };
    });
    setSessionDetails((prev: SessionDetails) => {
      return {
        ...prev,
        totalDistanceHiked: Number((prev.totalDistanceHiked + 0.01).toFixed(2)),
        presaveDistanceHiked: Number(
          (prev.presaveDistanceHiked + 0.01).toFixed(2)
        ),
      };
    });
  }
}

//update users_miles / user
export async function save({
  watermelonDatabase,
  userId,
  setSessionDetails,
  sessionDetails,
  setJoinedUserTrail,
  joinedUserTrail,
  paused,
  endSession
}: {
  watermelonDatabase: Database;
  userId: string;
  setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
  sessionDetails: SessionDetails;
  setJoinedUserTrail: React.Dispatch<React.SetStateAction<JoinedUserTrail>>;
  joinedUserTrail: JoinedUserTrail;
  paused?: boolean;
  endSession?: boolean
}) {
  try {
    const sessionId: any = await watermelonDatabase.localStorage.get(
      'sessionId'
    );
    //@ts-ignore
    const userMilesId: string = await watermelonDatabase.localStorage.get(
      'users_miles_id'
    );
    if (
      // (sessionDetails.totalDistanceHiked > 0 &&
      //   sessionDetails.totalDistanceHiked.toFixed(2).split('.')[1] === '00') ||
      paused === true || endSession === true ||
      sessionDetails.completedHike === true ||
      sessionDetails.elapsedPomodoroTime === sessionDetails.initialPomodoroTime
    ) {
      const savedSession = await watermelonDatabase.write(async () => {
        //save users miles
        //@ts-ignore
        const userMiles = await watermelonDatabase
          .get('users_miles')
          .find(userMilesId);
        console.log({userMiles});
        const updatedUserMiles = await userMiles.update(() => {
          //@ts-ignore
          userMiles.totalMiles = //@ts-ignore
            (
              Number(userMiles._raw.total_miles) + sessionDetails.presaveDistanceHiked
            ).toFixed(2);
        });

        //save user trail progress
        //@ts-ignore
        const user: User = await watermelonDatabase.get('users').find(userId);
        console.log({user})
        await user.update(() => {
          user.trailProgress = joinedUserTrail.trail_progress;
        });
        //save user session
        const userSession = await watermelonDatabase
          .get('users_sessions')
          .find(sessionId);
        const updatedSession = await userSession.update(() => {
          //@ts-ignore
          userSession.totalSessionTime = sessionDetails.totalSessionTime;
          //@ts-ignore
          userSession.totalDistanceHiked =
            sessionDetails.totalDistanceHiked.toFixed(2);
        });
        return updatedSession;
      });
      if (savedSession) {
        if (
          sessionDetails.elapsedPomodoroTime ===
          sessionDetails.initialPomodoroTime
        ) {
          setSessionDetails((prev: SessionDetails) => {
            return {
              ...prev,
              elapsedShortBreakTime: 0,
              elapsedLongBreakTime: 0,
              currentSet: prev.currentSet + 1,
              presaveDistanceHiked: 0,
            };
          });
        } else {
          setSessionDetails((prev) => {
            return {...prev, presaveDistanceHiked: 0.0};
          });
        }
      }
      return savedSession;
    }
  } catch (err) {
    console.log(
      'Error updating user miles and user in "save" helper func',
      err
    );
  }
}

//update new trail
export async function startNewTrail({
  database,
  userId,
  trailId,
}: {
  database: Database;
  userId: string;
  trailId: string;
}) {
  try {
    await database.write(async () => {
      //@ts-ignore
      const user: User = await database.get('users').find(userId);
      await user.update(() => {
        user.trailId = trailId;
      });
    });
  } catch (err) {
    console.log('Error setting new trail in "startNewTrail" helper func', err);
  }
}

//reset Session State
function resetSessionState(
  cb: React.Dispatch<React.SetStateAction<SessionDetails>>
) {
  cb((prev: SessionDetails) => {
    return {
      isSessionStarted: false,
      isPaused: false,
      sessionName: '',
      sessionDescription: '',
      sessionCategoryId: null,
      initialPomodoroTime: 1500,
      initialShortBreakTime: 300,
      initialLongBreakTime: 2700,
      elapsedPomodoroTime: 0,
      elapsedShortBreakTime: 0,
      elapsedLongBreakTime: 0,
      sets: 3,
      currentSet: 1,
      pace: 2,
      completedHike: false,
      strikes: 0,
      endSessionModal: false,
      totalSessionTime: 0,
      presaveDistanceHiked: 0,
      totalDistanceHiked: 0,
      isLoading: false,
      isError: false,
    };
  });
}

//resume paused session
export function resumeSession(
  cb: React.Dispatch<React.SetStateAction<SessionDetails>>
) {
  cb((prev) => {
    return {...prev, isPaused: false};
  });
}

//pause session
export async function pauseSession(
  database: Database,
  userId: string,
  setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>,
  sessionDetails: SessionDetails,
  setJoinedUserTrail: React.Dispatch<React.SetStateAction<JoinedUserTrail>>,
  joinedUserTrail: JoinedUserTrail
) {
  await setSessionDetails((prev) => {
    return {...prev, isPaused: true};
  });
  return true;
}

//end a session
export async function endSession({
  watermelonDatabase,
  userId,
  setSessionDetails,
  sessionDetails,
  setJoinedUserTrail,
  joinedUserTrail,
}: {
  watermelonDatabase: Database;
  userId: string;
  setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
  sessionDetails: SessionDetails;
  setJoinedUserTrail: React.Dispatch<React.SetStateAction<JoinedUserTrail>>;
  joinedUserTrail: JoinedUserTrail;
}) {
  try
  {
    const endSession = true
    const savedSession = await save({
      watermelonDatabase,
      userId,
      setSessionDetails,
      sessionDetails,
      setJoinedUserTrail,
      joinedUserTrail,
      endSession
    });
    if (savedSession) {
      resetSessionState(setSessionDetails);
    }
  } catch (err: any) {
    console.log(`Error in End Session helper function`, err);
    setSessionDetails((prev) => {
      return {...prev, isError: err.message};
    });
  }
}

function increaseElapsedTime(
  cb: React.Dispatch<React.SetStateAction<SessionDetails>>,
  sessionDetails: SessionDetails,
  canHike?: boolean
) {
  if (canHike) {
    cb((prev: any) => {
      return {
        ...prev,
        elapsedPomodoroTime: prev.elapsedPomodoroTime + 1,
        totalSessionTime: prev.totalSessionTime + 1,
      };
    });
  } else if (sessionDetails.currentSet <= sessionDetails.sets) {
    cb((prev: any) => {
      return {
        ...prev,
        elapsedShortBreakTime: prev.elapsedShortBreakTime + 1,
        totalSessionTime: prev.totalSessionTime + 1,
      };
    });
  } else if (sessionDetails.currentSet > sessionDetails.sets) {
    cb((prev: any) => {
      return {
        ...prev,
        elapsedLongBreakTime: prev.elapsedLongBreakTime + 1,
        totalSessionTime: prev.totalSessionTime + 1,
      };
    });
  }
}

async function speedModifier(
  cb: React.Dispatch<React.SetStateAction<SessionDetails>>,
  sessionDetails: SessionDetails
) {
  function decreasePace(
    cb: React.Dispatch<React.SetStateAction<SessionDetails>>,
    sessionDetails: SessionDetails
  )
  {
    
    if (sessionDetails.pace > 2) {
      cb((prev) => {
        return {...prev, pace: prev.pace - 0.5, strikes: 0};
      });
    } else {
      cb((prev) => {
        return {...prev, pace: 2, strikes: 0};
      });
    }
  }

  function increasePace(
    cb: React.Dispatch<React.SetStateAction<SessionDetails>>,
    sessionDetails: SessionDetails
  )
  {
    
    if (sessionDetails.pace < 6) {
      cb((prev) => {
        return {...prev, pace: prev.pace + 0.5, strikes: 0};
      });
    } else {
      cb((prev) => {
        return {...prev, pace: 6, strikes: 0};
      });
    }
  }
  if (sessionDetails.sessionName.toLowerCase() === 'fastasfuqboi') return;
  if (
    sessionDetails.elapsedPomodoroTime ===
      sessionDetails.initialPomodoroTime / 2 ||
    sessionDetails.elapsedPomodoroTime === sessionDetails.initialPomodoroTime
  ) {
    Vibration.vibrate();
    if (sessionDetails.strikes === 0) increasePace(cb, sessionDetails);
    else decreasePace(cb, sessionDetails);
  }
}

//shortBreak
export async function shortBreak(
  cb: React.Dispatch<React.SetStateAction<SessionDetails>>,
  sessionDetails: SessionDetails,
  canHike: boolean
) {
  //increase sessiondetailes elaposedPomodorotime every second
  if (
    sessionDetails.elapsedShortBreakTime ===
    sessionDetails.initialShortBreakTime - 1
  ) {
    cb((prev) => {
      return {...prev, elapsedPomodoroTime: 0};
    });
  }
  increaseElapsedTime(cb, sessionDetails, canHike);
}

//Longbreak\
export async function longBreak(
  cb: React.Dispatch<React.SetStateAction<SessionDetails>>,
  sessionDetails: SessionDetails,
  canHike: boolean
) {
  //increase sessiondetailes elaposedPomodorotime every second
  if (
    sessionDetails.elapsedLongBreakTime ===
    sessionDetails.initialLongBreakTime - 1
  ) {
    cb((prev) => {
      return {...prev, elapsedPomodoroTime: 0, currentSet: 1};
    });
  }
  increaseElapsedTime(cb, sessionDetails, canHike);
}
//skip break
export function skipBreak(
  cb: React.Dispatch<React.SetStateAction<SessionDetails>>,
  sessionDetails: SessionDetails
) {
  if (sessionDetails.currentSet < sessionDetails.sets) {
    cb((prev) => {
      return {
        ...prev,
        elapsedPomodoroTime: 0,
        elapsedShortBreakTime: prev.initialShortBreakTime,
        elapsedLongBreakTime: prev.initialLongBreakTime,
        currentSet: 1,
        totalSessionTime: prev.totalSessionTime + 1,
      };
    });
  } else {
    cb((prev) => {
      return {
        ...prev,
        elapsedPomodoroTime: 0,
        elapsedShortBreakTime: prev.initialShortBreakTime,
        elapsedLongBreakTime: prev.initialLongBreakTime,
        totalSessionTime: prev.totalSessionTime + 1,
      };
    });
  }
}

//checkIfcopledHikeExistsForUsesr
async function checkForCompletedHike({
  watermelonDatabase,
  userId,

  joinedUserTrail,
}: {
  watermelonDatabase: Database;
  userId: string;
  joinedUserTrail: JoinedUserTrail;
}): Promise<Completed_Hike> {
  const completedHikeExists = await watermelonDatabase
    .get('completed_hikes')
    .query(
      Q.and(
        Q.where('user_id', userId),
        Q.where('trail_id', joinedUserTrail.trail_id)
      )
    );
  console.log({completedHikeExists});
  //@ts-expect-error
  return completedHikeExists[0];
}

//beginNextTrail
export async function beginNextTrail({
  watermelonDatabase,
  userId,
  setSessionDetails,
  sessionDetails,
  setJoinedUserTrail,
  joinedUserTrail,
}: {
  watermelonDatabase: Database;
  userId: string;
  setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
  sessionDetails: SessionDetails;
  setJoinedUserTrail: React.Dispatch<React.SetStateAction<JoinedUserTrail>>;
  joinedUserTrail: JoinedUserTrail;
}) {
  try {
    let nextHikeInQueue = await watermelonDatabase
      .get('hiking_queue')
      .query(
        Q.unsafeSqlQuery(
          `SELECT hiking_queue.*, hiking_queue.id as hiking_queue_id, trails.* FROM hiking_queue LEFT JOIN trails on trails.id = hiking_queue.trail_id where hiking_queue.user_id = ? ORDER BY  hiking_queue.created_at ASC LIMIT 1;`, [userId]
        )
      )
      .unsafeFetchRaw();
    console.log({ nextHikeInQueue })
    nextHikeInQueue = nextHikeInQueue[0]
    const User = await watermelonDatabase.get('users').find(userId);
    const randomTrail = await watermelonDatabase
      .get('trails')
      .find((Math.floor(Math.random() * 5) + 1).toString());
    console.log({randomTrail})
    const nextHike = await watermelonDatabase
      .get('hiking_queue')
      .find(nextHikeInQueue.hiking_queue_id);
    console.log({nextHike})
    //update user in DB with new trail info
    const batchUpdate = await watermelonDatabase.write(async () => {
      const updatedUser = await User.update((user) => {
        user.trailId = nextHikeInQueue?.trail_id || randomTrail.id;
        user.trailStartedAt = formatDateTime(new Date());
        user.trailProgress = '0.00';
        user.trailDistance =
          nextHikeInQueue?.trail_distance || randomTrail.trail_distance;
      });
      if (updatedUser) return true;
    });
    //if user updated in db
    //remove next hike from users hiking queue
    if (batchUpdate) {
      if (nextHike) {
        const isRemovedFromQueue = nextHike.markAsDeleted();
      }

      //update joined usertrail state and sessionDetails
      setJoinedUserTrail((prev) => {
        return {
          ...prev,
          trail_difficulty:
            nextHikeInQueue?.trail_difficulty ||
            randomTrail.trail_difficulty,
          trail_distance:
            nextHikeInQueue?.trail_distance || randomTrail.trail_distance,
          trail_elevation:
            nextHikeInQueue?.trail_elevation || randomTrail.trail_elevation,
          trail_id: nextHikeInQueue?.trail_id || randomTrail.id,
          trail_image_url:
            nextHikeInQueue?.trail_image_url || randomTrail.trail_image_url,
          trail_lat: nextHikeInQueue?.trail_lat || randomTrail.trail_lat,
          trail_long: nextHikeInQueue?.trail_long || randomTrail.trail_long,
          trail_name: nextHikeInQueue?.trail_name || randomTrail.trail_name,
          trail_progress: '0.0',
          trail_started_at: formatDateTime(new Date()),
        };
      });
    }

    await save({
      watermelonDatabase,
      userId,
      setSessionDetails,
      sessionDetails,
      setJoinedUserTrail,
      joinedUserTrail,
    });
  } catch (err) {
    console.error('Error in begin Next trail helper function', err);
  }
}

export async function CompletedHike({
  watermelonDatabase,
  userId,
  setSessionDetails,
  sessionDetails,
  setJoinedUserTrail,
  joinedUserTrail,
}: {
  watermelonDatabase: Database;
  userId: string;
  setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
  sessionDetails: SessionDetails;
  setJoinedUserTrail: React.Dispatch<React.SetStateAction<JoinedUserTrail>>;
  joinedUserTrail: JoinedUserTrail;
}) {
  try {
    if (joinedUserTrail.trail_progress >= joinedUserTrail.trail_distance) {
      //checkif completed hike table has column with the current trail and username
      const existingCompletedHike = await checkForCompletedHike({
        watermelonDatabase,
        userId,
        joinedUserTrail,
      });
      console.log('existingCompletedHike', existingCompletedHike);
      //set current date to now (YY-MM-DD H/H:mm:ss)
      const currentDateTime = formatDateTime(new Date());
      console.log({currentDateTime});
      //get time difference in H:mm:ss from time trail started to now(finished)
      const timeToComplete = getTimeDifference(
        currentDateTime,
        joinedUserTrail.trail_started_at
      );

      //if completed trail existed keep first completed date else set to now
      const firstCompletedTime: any = existingCompletedHike
        ? existingCompletedHike._raw.first_completed_at
        : currentDateTime;
      console.log({firstCompletedTime});
      //if already completed find best time between theat time vs this time
      //else set it to the time it just took to finish from start date / time
      const betterTime = existingCompletedHike
        ? getBetterTime(
            timeToComplete,
            existingCompletedHike._raw.best_completed_time
          )
        : timeToComplete;
      const addedHike = await watermelonDatabase.write(async () => {
        try {
          if (existingCompletedHike) {
            const completedHike = await watermelonDatabase
              .get('completed_hikes')
              .find(existingCompletedHike._raw.id);
            return await completedHike.update(() => {
              completedHike.bestCompletedTime = betterTime;
              completedHike.lastCompletedAt = currentDateTime;
            });
          }
          if (!existingCompletedHike) {
            const completedHike = await watermelonDatabase
              .get('completed_hikes')
              .create((completedHike: Completed_Hike) => {
                completedHike.userId = userId;
                completedHike.trailId = joinedUserTrail.trail_id;
                completedHike.firstCompletedAt = currentDateTime;
                completedHike.lastCompletedAt = currentDateTime;
                completedHike.bestCompletedTime = betterTime;
              });
            return completedHike;
          }
        } catch (err) {
          console.error(
            'Error adding or updating completed hike function CompletedHike',
            err
          );
        }
      });

      if (addedHike) {
        await beginNextTrail({
          watermelonDatabase,
          userId,
          setSessionDetails,
          sessionDetails,
          setJoinedUserTrail,
          joinedUserTrail,
        });
      }
    }
    return true;
  } catch (err) {
    console.error('Error completeedHike helper', err);
  }
}
//hiking
export async function Hike({
  watermelonDatabase,
  userId,
  setSessionDetails,
  sessionDetails,
  setJoinedUserTrail,
  joinedUserTrail,
  canHike,
}: {
  watermelonDatabase: Database;
  userId: string;
  setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
  sessionDetails: SessionDetails;
  setJoinedUserTrail: React.Dispatch<React.SetStateAction<JoinedUserTrail>>;
  joinedUserTrail: JoinedUserTrail;
  canHike: boolean;
}) {
  try {
    //check for completed hike
    const completedHike = await CompletedHike({
      watermelonDatabase,
      userId,
      setSessionDetails,
      sessionDetails,
      setJoinedUserTrail,
      joinedUserTrail,
    });

    //increase distance hiked by .01 time depending on the pace
    await increaseDistanceHiked(
      setJoinedUserTrail,
      joinedUserTrail,
      setSessionDetails,
      sessionDetails
    );

    //modify Speed
    await speedModifier(setSessionDetails, sessionDetails);

    await increaseElapsedTime(setSessionDetails, sessionDetails, canHike);
    //save the users current session details in the database
    await save({
      watermelonDatabase,
      userId,
      setSessionDetails,
      sessionDetails,
      setJoinedUserTrail,
      joinedUserTrail,
    });
  } catch (err) {
    console.log('Error in Hike helper func', err);
  }
}
