//creating a new session

import {Database, Q} from '@nozbe/watermelondb';
import {formatDateTime} from '../formatDateTime';
import {
  Completed_Hike,
  Queued_Trail,
  Trail,
  User,
  User_Miles,
  User_Session,
} from '../../watermelon/models';
import {SessionDetails} from '../../types/session';
import {Vibration} from 'react-native';
import nextHundredthMileSeconds from './nextHundrethMileSeconds';
import getTimeDifference from './getTimeDifference';
import {getBetterTime} from './getBetterTime';

//increase distance hiked
export async function increaseDistanceHiked({
  user,
  userMiles,
  currentTrail,
  sessionDetails,
  userSession,
  setSessionDetails,
}: {
  user: User;
  userMiles: User_Miles[];
  currentTrail: Trail;
  userSession: User_Session;
  setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
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
      // await user.updateTrailProgress({
      //   miles: 0.01,
      // });
      // await userMiles[0].updateTotalMiles({
      //   miles: 0.01,
      // });
      // userSession.updateTotalDistanceHiked({
      //   miles: 0.01,
      // });
      await user.increaseDistanceHikedWriter({
        user,
        userMiles: userMiles[0],
        userSession,
      });
    }
    if (
      sessionDetails.elapsedPomodoroTime ===
      sessionDetails.initialPomodoroTime - 1
    ) {
      if (sessionDetails.currentSet < sessionDetails.sets) {
        setSessionDetails((prev: any) => {
          return {
            ...prev,
            elapsedShortBreakTime: 0,
          };
        });
      } else {
        setSessionDetails((prev: any) => {
          return {
            ...prev,
            elapsedLongBreakTime: 0,
          };
        });
      }
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
  queuedTrails,
}: {
  watermelonDatabase: Database;
  // userId: string;
  // trailId: string;
  user: User;
  queuedTrails: Queued_Trail[];
}) {
  try {
    const currentDate = formatDateTime(new Date());
    //!cahnge randomTrailID to 163 after all trails are added
    const randomTrailId = Math.floor(Math.random() * 7 + 1).toString();
    if (queuedTrails.length) {
      const updatedUserTrail = await user.updateUserTrail({
        trailId: queuedTrails[0].trailId,
        trailStartedAt: currentDate,
      });
      if (updatedUserTrail) {
        await watermelonDatabase.write(async () => {
          await queuedTrails[0].markAsDeleted();
        });
      }
    } else {
      await user.updateUserTrail({
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
    if (
      sessionDetails.elapsedPomodoroTime < sessionDetails.initialPomodoroTime
    ) {
      await userSession.updateTotalSessionTime();
      increaseDistanceHiked({
        user,
        userMiles,
        currentTrail,
        userSession,
        sessionDetails,
        setSessionDetails,
      });
      setSessionDetails((prev: any) => {
        return {
          ...prev,
          elapsedPomodoroTime: prev.elapsedPomodoroTime + 1,
        };
      });
    } else if (sessionDetails.currentSet < sessionDetails.sets) {
      await shortBreak({sessionDetails, setSessionDetails});
    } else if (sessionDetails.currentSet >= sessionDetails.sets) {
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
    (sessionDetails.elapsedPomodoroTime % 600 === 0 ||
      sessionDetails.elapsedPomodoroTime ===
        sessionDetails.initialPomodoroTime) &&
    sessionDetails.elapsedShortBreakTime === 0 &&
    sessionDetails.elapsedLongBreakTime === 0
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
      return {...prev, elapsedPomodoroTime: 0, currentSet: prev.currentSet + 1};
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
        currentSet: prev.currentSet + 1,
      };
    });
  } else {
    cb((prev) => {
      return {
        ...prev,
        elapsedPomodoroTime: 0,
        elapsedShortBreakTime: prev.initialShortBreakTime,
        elapsedLongBreakTime: prev.initialLongBreakTime,
        currentSet: 1,
      };
    });
  }
}

export async function isTrailCompleted({
  user,
  watermelonDatabase,
  //setSessionDetails,
  //sessionDetails,
  currentTrail,
  //completedHikes,
  queuedTrails,
}: {
  user: User;
  watermelonDatabase: Database;
  //setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
  //sessionDetails: SessionDetails;
  currentTrail: Trail;
  //completedHikes: Completed_Hike[];
  queuedTrails: Queued_Trail[];
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
            queuedTrails,
            watermelonDatabase,
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
            queuedTrails,
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
  queuedTrails,
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
  queuedTrails: Queued_Trail[];
}) {
  try {
    //check for completed hike
    isTrailCompleted({
      watermelonDatabase,
      user,
      currentTrail,
      queuedTrails,
    });

    //modify Speed
    speedModifier(setSessionDetails, sessionDetails);

    increaseElapsedTime({
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
