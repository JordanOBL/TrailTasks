//creating a new session

import {Database, Q} from '@nozbe/watermelondb';
import {formatDateTime} from '../formatDateTime';
import {
  Completed_Hike,
  Hiking_Queue,
  Trail,
  User,
  User_Miles,
  User_Session,
} from '../../watermelon/models';
import {JoinedUserTrail, SessionDetails} from '../../types/session';
import {Vibration} from 'react-native';
import nextHundredthMileSeconds from './nextHundrethMileSeconds';
import getTimeDifference from './getTimeDifference';
import {getBetterTime} from './getBetterTime';

// export async function createSession({
//   database,
//   userId,
//   sessionName,
//   sessionDescription,
//   sessionCategoryId,
// }: {
//   database: Database;
//   userId: string;
//   sessionName: string;
//   sessionDescription: string;
//   sessionCategoryId: number;
// }) {
//   try {
//     const newSession = await database
//       .get('users_sessions')
//       .create((userSession) => {
//         //@ts-ignore
//         userSession.userId = userId;
//         //@ts-ignore
//         userSession.sessionName = sessionName;
//         //@ts-ignore
//         userSession.sessionDescription = sessionDescription;
//         //@ts-ignore
//         userSession.sessionCategoryId = sessionCategoryId.toString();
//         //@ts-ignore
//         userSession.dateAdded = formatDateTime(new Date());
//         //@ts-ignore
//         userSession.totalSessionTime = 0;
//         //@ts-ignore
//         userSession.totalDistanceHiked = '0.00';
//       });
//   } catch (err) {
//     console.log(
//       'Error creating new session in "createSession" helper func',
//       err
//     );
//   }
// }

//increase distance hiked
export async function increaseDistanceHiked({
  user,
  userMiles,
  currentTrail,
  sessionDetails,
  userSession,
}: {
  user: User;
  userMiles: User_Miles;
  currentTrail: Trail;
  userSession: User_Session;
  //setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>,
  sessionDetails: SessionDetails;
}) {
  //UPDATE CURRENT TRAILDISTANCE in session when user walks .01 miles

  //increase state current_trail_distance, user total miles by .01 every .01 miles (pace dependent)

  try {
    if (
      sessionDetails.elapsedPomodoroTime > 0 &&
      sessionDetails.elapsedPomodoroTime %
        nextHundredthMileSeconds(sessionDetails.pace) ==
        0 &&
      Number(user.trailProgress) < Number(currentTrail.trailDistance)
    ) {
      console.log('updating in increaseDistanceHiked');
      const updatedTrailProgress = await user.updateTrailProgress({
        miles: 0.01,
      });
      const updatedUsersMiles = await userMiles[0].updateTotalMiles({
        miles: 0.01,
      });
      const updateSessionTotalTime = userSession.updateTotalDistanceHiked({
        miles: 0.01,
      });
      // setSessionDetails((prev: SessionDetails) => {
      //   return {
      //     ...prev,
      //     totalDistanceHiked: Number((prev.totalDistanceHiked + 0.01).toFixed(2))
      //   };
      // });
    }
  } catch (err) {
    console.log('error in timerflow increaseDistanceHiked', err);
  }
}

//update users_miles / user

//update new trail
export async function updateUsersTrailAndQueue({
  watermelonDatabase,
  // userId,
  // trailId,
  user,
  hikingQueue,
}: {
   watermelonDatabase: Database;
  // userId: string;
  // trailId: string;
  user: User;
  hikingQueue: Hiking_Queue[];
}) {
  try {
    const currentDate = formatDateTime(new Date());
    //!cahnge randomTrailID to 163 after all trails are added
    const randomTrailId = Math.floor(Math.random() * 6 + 1).toString();
    if (hikingQueue.length) {
      const updatedUserTrail = await user.updateUserTrail({
        trailId: hikingQueue[0].trailId,
        trailStartedAt: currentDate,
      });
      if (updatedUserTrail) {
        await watermelonDatabase.write(async () => {
          await hikingQueue[0].markAsDeleted();
        });
      }
    } else {
      const updatedUserTrail = await user.updateUserTrail({
        trailId: randomTrailId,
        trailStartedAt: currentDate,
      });
    }
  } catch (err) {
    console.log(
      'Error setting new trail in "updateUsersTrailQueue" helper func',
      err
    );
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
  setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>
) {
  setSessionDetails((prev) => {
    return {...prev, isPaused: true};
  });
  return true;
}

//end a session
export async function endSession({
  // watermelonDatabase,
  // userId,
  setSessionDetails,
}: // sessionDetails,
// setJoinedUserTrail,
// joinedUserTrail,
{
  // watermelonDatabase: Database;
  // userId: string;
  setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
  sessionDetails: SessionDetails;
  // setJoinedUserTrail: React.Dispatch<React.SetStateAction<JoinedUserTrail>>;
  // joinedUserTrail: JoinedUserTrail;
}) {
  try {
    //const endSession = true;
    // const savedSession = await save({
    //   watermelonDatabase,
    //   userId,
    //   setSessionDetails,
    //   sessionDetails,
    //   setJoinedUserTrail,
    //   joinedUserTrail,
    //   endSession,
    // });

    resetSessionState(setSessionDetails);
  } catch (err: any) {
    console.log(`Error in End Session helper function`, err);
    setSessionDetails((prev) => {
      return {...prev, isError: err.message};
    });
  }
}

async function increaseElapsedTime({
  setSessionDetails,
  sessionDetails,
  canHike,
  userSession,
  user,
  userMiles,
  currentTrail,
}: {
  setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
  sessionDetails: SessionDetails;
  canHike?: boolean;
  userSession: User_Session;
  user: User;
  userMiles: User_Miles;
  currentTrail: Trail;
}) {
  if (sessionDetails.isPaused === false) {
    if (canHike === true) {
      await increaseDistanceHiked({
        user,
        userMiles,
        currentTrail,
        userSession,
        sessionDetails,
      });
      await userSession.updateTotalSessionTime();
      setSessionDetails((prev: any) => {
        return {
          ...prev,
          elapsedPomodoroTime: prev.elapsedPomodoroTime + 1,
        };
      });
    } else if (sessionDetails.currentSet <= sessionDetails.sets) {
      await shortBreak({sessionDetails, setSessionDetails});
    } else if (sessionDetails.currentSet > sessionDetails.sets) {
      await longBreak({sessionDetails, setSessionDetails});
    }
  }
}

async function speedModifier(
  cb: React.Dispatch<React.SetStateAction<SessionDetails>>,
  sessionDetails: SessionDetails
) {
  function decreasePace(
    cb: React.Dispatch<React.SetStateAction<SessionDetails>>,
    sessionDetails: SessionDetails
  ) {
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
  ) {
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
export async function shortBreak({
  setSessionDetails,
  sessionDetails,
}: {
  setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
  sessionDetails: SessionDetails;
}) {
  //increase sessiondetailes elaposedPomodorotime every second
  if (
    sessionDetails.elapsedShortBreakTime >= sessionDetails.initialShortBreakTime
  ) {
    setSessionDetails((prev) => {
      return {...prev, elapsedPomodoroTime: 0};
    });
  } else {
    setSessionDetails((prev: any) => {
      return {
        ...prev,
        elapsedShortBreakTime: prev.elapsedShortBreakTime + 1,
      };
    });
    //increaseElapsedTime({setSessionDetails, userSession, sessionDetails, canHike});
  }
}

//Longbreak\
export async function longBreak({
  setSessionDetails,
  sessionDetails,
}: {
  setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
  sessionDetails: SessionDetails;
}) {
  //increase sessiondetailes elaposedPomodorotime every second
  if (
    sessionDetails.elapsedLongBreakTime >= sessionDetails.initialLongBreakTime
  ) {
    setSessionDetails((prev) => {
      return {...prev, elapsedPomodoroTime: 0, currentSet: 1};
    });
  } else {
    setSessionDetails((prev: any) => {
      return {
        ...prev,
        elapsedLongBreakTime: prev.elapsedLongBreakTime + 1,
      };
    });
  }
  //increaseElapsedTime(cb, sessionDetails, canHike);
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
// async function checkForCompletedHike({
//   //completedHikes,
//   user

//   //joinedUserTrail,
// }: {
//   watermelonDatabase: Database;
//   userId: string;
//   joinedUserTrail: JoinedUserTrail;
// }): Promise<Completed_Hike> {
//   const completedHikeExists = user.hasTrailBeenCompleted()
//   console.log({completedHikeExists});
//   return completedHikeExists[0];
// }

// //beginNextTrail
// export async function beginNextTrail({
//   // watermelonDatabase,
//   // userId,
//   // setSessionDetails,
//   // sessionDetails,
//   // setJoinedUserTrail,
//   // joinedUserTrail,
//   hikingQueue,user
// }: {
//   // watermelonDatabase: Database;
//   // userId: string;
//   // setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
//   // sessionDetails: SessionDetails;
//   // setJoinedUserTrail: React.Dispatch<React.SetStateAction<JoinedUserTrail>>;
//   // joinedUserTrail: JoinedUserTrail;
//   , user
// }) {
//   try {
//     let nextHikeInQueue = await watermelonDatabase
//       .get('hiking_queue')
//       .query(
//         Q.unsafeSqlQuery(
//           `SELECT hiking_queue.*, hiking_queue.id as hiking_queue_id, trails.* FROM hiking_queue LEFT JOIN trails on trails.id = hiking_queue.trail_id where hiking_queue.user_id = ? ORDER BY  hiking_queue.created_at ASC LIMIT 1;`,
//           [userId]
//         )
//       )
//       .unsafeFetchRaw();
//     console.log({nextHikeInQueue});
//     nextHikeInQueue = nextHikeInQueue[0];
//     const User = await watermelonDatabase.get('users').find(userId);
//     const randomTrail = await watermelonDatabase
//       .get('trails')
//       .find((Math.floor(Math.random() * 5) + 1).toString());
//     console.log({randomTrail});
//     const nextHike = await watermelonDatabase
//       .get('hiking_queue')
//       .find(nextHikeInQueue.hiking_queue_id);
//     console.log({nextHike});
//     //update user in DB with new trail info
//     const batchUpdate = await watermelonDatabase.write(async () => {
//       const updatedUser = await User.update((user) => {
//         user.trailId = nextHikeInQueue?.trail_id || randomTrail.id;
//         user.trailStartedAt = formatDateTime(new Date());
//         user.trailProgress = '0.00';
//         user.trailDistance =
//           nextHikeInQueue?.trail_distance || randomTrail.trail_distance;
//       });
//       if (updatedUser) return true;
//     });
//     //if user updated in db
//     //remove next hike from users hiking queue
//     if (batchUpdate) {
//       if (nextHike) {
//         const isRemovedFromQueue = nextHike.markAsDeleted();
//       }

//       //update joined usertrail state and sessionDetails
//       setJoinedUserTrail((prev) => {
//         return {
//           ...prev,
//           trail_difficulty:
//             nextHikeInQueue?.trail_difficulty || randomTrail.trail_difficulty,
//           trail_distance:
//             nextHikeInQueue?.trail_distance || randomTrail.trail_distance,
//           trail_elevation:
//             nextHikeInQueue?.trail_elevation || randomTrail.trail_elevation,
//           trail_id: nextHikeInQueue?.trail_id || randomTrail.id,
//           trail_image_url:
//             nextHikeInQueue?.trail_image_url || randomTrail.trail_image_url,
//           trail_lat: nextHikeInQueue?.trail_lat || randomTrail.trail_lat,
//           trail_long: nextHikeInQueue?.trail_long || randomTrail.trail_long,
//           trail_name: nextHikeInQueue?.trail_name || randomTrail.trail_name,
//           trail_progress: '0.0',
//           trail_started_at: formatDateTime(new Date()),
//         };
//       });
//     }

//     await save({
//       watermelonDatabase,
//       userId,
//       setSessionDetails,
//       sessionDetails,
//       setJoinedUserTrail,
//       joinedUserTrail,
//     });
//   } catch (err) {
//     console.error('Error in begin Next trail helper function', err);
//   }
// }

export async function isTrailCompleted({
  user,
  watermelonDatabase,
  //setSessionDetails,
  //sessionDetails,
  currentTrail,
  //completedHikes,
  hikingQueue,
}: {
    user: User;
  watermelonDatabase: Database
  //setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
  //sessionDetails: SessionDetails;
  currentTrail: Trail;
  //completedHikes: Completed_Hike[];
  hikingQueue: Hiking_Queue[];
}) {
  try {
    if (Number(user.trailProgress) >= Number(currentTrail.trailDistance)) {
      //checkif completed hike table has column with the current trail and username
      const existingCompletedHike = await user.hasTrailBeenCompleted();
      console.log('existingCompletedHike', existingCompletedHike);

      //set current date to now (YY-MM-DD H/H:mm:ss)
      const currentDateTime = formatDateTime(new Date());
      console.log({currentDateTime});
      //get time difference in H:mm:ss from time trail started to now(finished)
      const timeToComplete = getTimeDifference(
        currentDateTime,
        user.trailStartedAt
      );
      console.log({timeToComplete});

      //if completed trail existed keep first completed date else set to now
      const firstCompletedTime: string = existingCompletedHike
        ? //@ts-ignore
          existingCompletedHike.firstCompletedAt
        : currentDateTime;
      console.log({firstCompletedTime});

      //if already completed find best time between theat time vs this time
      //else set it to the time it just took to finish from start date / time
      const betterTime: string = existingCompletedHike
        ? //@ts-ignore
          getBetterTime(timeToComplete, existingCompletedHike.bestCompletedTime)
        : timeToComplete;

      console.log({betterTime});

      if (existingCompletedHike) {
        //@ts-ignore
        const updatedHike: Completed_Hike = await user.updateCompletedHike({
          completedHikeId: existingCompletedHike.id,
          bestCompletedTime: betterTime,
          lastCompletedAt: currentDateTime,
        });
        if (updatedHike) {
          await updateUsersTrailAndQueue({
            user,
            hikingQueue,
            watermelonDatabase
          });
        }
      } else if (!existingCompletedHike) {
        //@ts-ignore
        console.log('in here');
        const addedHike = await user.addCompletedHike({
          trailId: user.trailId,
          bestCompletedTime: betterTime,
          firstCompletedAt: firstCompletedTime,
          lastCompletedAt: currentDateTime,
        });
        console.log({addedHike});

        if (addedHike) {
          await updateUsersTrailAndQueue({
            watermelonDatabase,
            user,
            hikingQueue,
          });
        }
      }

      return true;
    }
  } catch (err) {
    console.error('Error completeedHike helper', err);
  }
}
//hiking
export async function Hike({
  watermelonDatabase,
  user,
  userSession,
  userMiles,
  setSessionDetails,
  sessionDetails,
  currentTrail,
  hikingQueue,
  completedHikes,
  canHike,
}: {
    user: User;
    watermelonDatabase: Database;
  setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
  sessionDetails: SessionDetails;
  canHike: boolean;
  userSession: User_Session;
  userMiles: User_Miles;
  completedHikes: Completed_Hike[];
  currentTrail: Trail;
  hikingQueue: Hiking_Queue[];
}) {
  try {
    //check for completed hike
    await isTrailCompleted({
      watermelonDatabase,
      user,
      currentTrail,
      hikingQueue,
    });

    //modify Speed
    await speedModifier(setSessionDetails, sessionDetails);

    await increaseElapsedTime({
      user,
      userMiles,
      currentTrail,
      setSessionDetails,
      sessionDetails,
      canHike,
      userSession,
    });
    //save the users current session details in the database
  } catch (err) {
    console.log('Error in Hike helper func', err);
  }
}
