//creating a new session

import {Database, Q} from '@nozbe/watermelondb';
import {formatDateTime} from '../formatDateTime';
import {User, User_Miles, User_Session} from '../../watermelon/models';
import {SessionDetails} from '../../types/session';
import {Vibration} from 'react-native';
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
export async function save({
  database,
  userId,
  sessionDetails
}: {
  database: Database;
  userId: string;
  sessionDetails: SessionDetails;
}) {
  try {
    await database.write(async () =>
    {
      //save users miles
      const userMiles: User_Miles = await database
        .get('users_miles')
        .query(Q.where('user_id', userId))
        .fetch();
      await userMiles.update(() => {
        userMiles.totalMiles = (
          Number(userMiles.totalMiles) +
          Math.abs(Number(userMiles.totalMiles) - Number(totalDistanceHiked))
        ).toFixed(2);
      });
      //save user trail progress
      const user: User = await database.get('users').find(userId);
      await user.update(() => {
        user.trailProgress = trailProgress;
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
  trailId,
}: {
  database: Database;
  userId: string;
  trailId: string;
}) {
  try {
    await database.write(async () => {
      const user: User = await database.get('users').find(userId);
      await user.update(() => {
        user.trailId = trailId;
      });
    });
  } catch (err) {
    console.log('Error setting new trail in "startNewTrail" helper func', err);
  }
}

function resetSessionState(
  cb: React.Dispatch<React.SetStateAction<SessionDetails>>
) {
  cb((prev: any) => {
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

//resume a session
export function resumeSession(
  cb: React.Dispatch<React.SetStateAction<SessionDetails>>
) {
  cb((prev) => {
    return {...prev, isPaused: false};
  });
}

//pause a session
export function pauseSession(
  cb: React.Dispatch<React.SetStateAction<SessionDetails>>
) {
  cb((prev) => {
    return {...prev, isPaused: true};
  });
}

//end a session
export async function endSession(
  database: Database,
  cb: React.Dispatch<React.SetStateAction<SessionDetails>>,
  sessionDetails: SessionDetails
) {
  try {
    const sessionId: any = await database.localStorage.get('sessionId');
    console.log({sessionId});
    const updatedEndedSession = await database.write(async () => {
      const userSession = await database.get('users_sessions').find(sessionId);
      //@ts-ignore
      const updatedSession = await userSession.update(() => {
        userSession.totalSessionTime = sessionDetails.totalSessionTime;
        userSession.totalDistanceHiked =
          sessionDetails.totalDistanceHiked.toFixed(2);
      });
      return updatedSession;
    });
    if (updatedEndedSession) {
      resetSessionState(cb);
    }
  } catch (err: any) {
    console.log(`Error in End Session helper function`, err);
    cb((prev) => {
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
  cb: React.Dispatch<React.SetStateAction<SessionDetails>>,
  sessionDetails: SessionDetails
) {
  //increase sessiondetailes elaposedPomodorotime every second
  if (
    sessionDetails.elapsedPomodoroTime ===
    sessionDetails.initialPomodoroTime / 2 - 1
  ) {
    speedModifier(cb, sessionDetails);
  }
  if (
    sessionDetails.elapsedPomodoroTime ===
    sessionDetails.initialPomodoroTime - 1
  ) {
    cb((prev) => {
      return {
        ...prev,
        elapsedShortBreakTime: 0,
        elapsedLongBreakTime: 0,
        currentSet: prev.currentSet + 1,
      };
    });
  }
  increaseElapsedTime(cb, 'pomodoroTime');
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
