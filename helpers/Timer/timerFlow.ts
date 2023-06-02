//creating a new session

import {Database, Q} from '@nozbe/watermelondb';
import {formatDateTime} from '../formatDateTime';
import {User, User_Miles, User_Session} from '../../watermelon/models';
import {JoinedUserTrail, SessionDetails} from '../../types/session';
import {Vibration} from 'react-native';
import nextHundredthMileSeconds from './nextHundrethMileSeconds';

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
export function increaseDistanceHiked(
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

//update users_miles / user
export async function save(
  database: Database,
  userId: string,
  setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>,
  sessionDetails: SessionDetails,
  setJoinedUserTrail: React.Dispatch<React.SetStateAction<JoinedUserTrail>>,
  joinedUserTrail: JoinedUserTrail
) {
  try {
    const sessionId: any = await database.localStorage.get('sessionId');
    const userMilesId: string = await database.localStorage.get(
      'users_miles_id'
    );

    const savedSession = await database.write(async () => {
      //save users miles
      //@ts-ignore
      const userMiles = await database.get('users_miles').find(userMilesId);
      console.log(userMiles);
      const updatedUserMiles = await userMiles.update(() => {
        //@ts-ignore
        userMiles.totalMiles = //@ts-ignore
        (
          Number(userMiles.totalMiles) + sessionDetails.presaveDistanceHiked
        ).toFixed(2);
      });
      //console.log({updatedUserMiles})
      //save user trail progress
      //@ts-ignore
      const user: User = await database.get('users').find(userId);
      await user.update(() => {
        user.trailProgress = joinedUserTrail.trail_progress;
      });
      //save user session
      const userSession = await database.get('users_sessions').find(sessionId);

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
      setSessionDetails((prev) => {
        return {...prev, presaveDistanceHiked: 0.0};
      });
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
export async function endSession(
  database: Database,
  userId: string,
  setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>,
  sessionDetails: SessionDetails,
  setJoinedUserTrail: React.Dispatch<React.SetStateAction<JoinedUserTrail>>,
  joinedUserTrail: JoinedUserTrail
) {
  try {
    const savedSession = await save(
      database,
      userId,
      setSessionDetails,
      sessionDetails,
      setJoinedUserTrail,
      joinedUserTrail
    );
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
  countdown: string
) {
  if (countdown === 'pomodoroTime') {
    cb((prev: any) => {
      return {
        ...prev,
        elapsedPomodoroTime: prev.elapsedPomodoroTime + 1,
        totalSessionTime: prev.totalSessionTime + 1,
      };
    });
  } else if (countdown === 'shortBreakTime') {
    cb((prev: any) => {
      return {
        ...prev,
        elapsedShortBreakTime: prev.elapsedShortBreakTime + 1,
        totalSessionTime: prev.totalSessionTime + 1,
      };
    });
  } else if (countdown === 'longBreakTime') {
    cb((prev: any) => {
      return {
        ...prev,
        elapsedLongBreakTime: prev.elapsedLongBreakTime + 1,
        totalSessionTime: prev.totalSessionTime + 1,
      };
    });
  }
}

const decreasePace = (
  cb: React.Dispatch<React.SetStateAction<SessionDetails>>,
  sessionDetails: SessionDetails
) => {
  if (sessionDetails.pace > 2) {
    cb((prev) => {
      return {...prev, pace: prev.pace - 0.5, strikes: 0};
    });
  } else {
    cb((prev) => {
      return {...prev, pace: 2, strikes: 0};
    });
  }
};

const increasePace = (
  cb: React.Dispatch<React.SetStateAction<SessionDetails>>,
  sessionDetails: SessionDetails
) => {
  if (sessionDetails.pace < 6) {
    cb((prev) => {
      return {...prev, pace: prev.pace + 0.5, strikes: 0};
    });
  } else {
    cb((prev) => {
      return {...prev, pace: 6, strikes: 0};
    });
  }
};

const speedModifier = (
  cb: React.Dispatch<React.SetStateAction<SessionDetails>>,
  sessionDetails: SessionDetails
) => {
  if (sessionDetails.strikes === 0) increasePace(cb, sessionDetails);
  else decreasePace(cb, sessionDetails);
  Vibration.vibrate();
};
//hiking
export async function Hike(
  database: Database,
  userId: string,
  setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>,
  sessionDetails: SessionDetails,
  setJoinedUserTrail: React.Dispatch<React.SetStateAction<JoinedUserTrail>>,
  joinedUserTrail: JoinedUserTrail
) {
  try {
    //increase sessiondetailes elaposedPomodorotime every second
    if (
      sessionDetails.elapsedPomodoroTime ===
      sessionDetails.initialPomodoroTime / 2 - 1
    ) {
      speedModifier(setSessionDetails, sessionDetails);
    }
    if (
      sessionDetails.totalDistanceHiked > 0 &&
      sessionDetails.totalDistanceHiked.toFixed(2).split('.')[1] === '00'
    ) {
      save(
        database,
        userId,
        setSessionDetails,
        sessionDetails,
        setJoinedUserTrail,
        joinedUserTrail
      );
    }
    if (
      sessionDetails.elapsedPomodoroTime %
        nextHundredthMileSeconds(sessionDetails.pace) ==
        0 &&
      Number(joinedUserTrail.trail_progress) <
        Number(joinedUserTrail.trail_distance)
    ) {
      //increase distance hiked
      increaseDistanceHiked(
        setJoinedUserTrail,
        joinedUserTrail,
        setSessionDetails,
        sessionDetails
      );
    }
    //finish hiking if time runs out
    if (
      sessionDetails.elapsedPomodoroTime ===
      sessionDetails.initialPomodoroTime - 1
    ) {
      speedModifier(setSessionDetails, sessionDetails);

      const savedSession = await save(
        database,
        userId,
        setSessionDetails,
        sessionDetails,
        setJoinedUserTrail,
        joinedUserTrail
      );
      if (savedSession) {
        setSessionDetails((prev: SessionDetails) => {
          return {
            ...prev,
            elapsedShortBreakTime: 0,
            elapsedLongBreakTime: 0,
            currentSet: prev.currentSet + 1,
            presaveDistanceHiked: 0,
          };
        });
      }
    }
    increaseElapsedTime(setSessionDetails, 'pomodoroTime');
  } catch (err) {
    console.log('Error in Hike helper func', err);
  }
}

//shortBreak
export async function shortBreak(
  cb: React.Dispatch<React.SetStateAction<SessionDetails>>,
  sessionDetails: SessionDetails
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
  increaseElapsedTime(cb, 'shortBreakTime');
}

//Longbreak\
export async function longBreak(
  cb: React.Dispatch<React.SetStateAction<SessionDetails>>,
  sessionDetails: SessionDetails
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
  increaseElapsedTime(cb, 'longBreakTime');
}

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
