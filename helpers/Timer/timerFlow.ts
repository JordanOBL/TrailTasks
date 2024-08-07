import {
  Achievement,
  Completed_Hike,
  Queued_Trail,
  Trail,
  User,
  User_Miles,
  User_Session,
} from '../../watermelon/models';
//creating a new session
import {Database, Q} from '@nozbe/watermelondb';

import { AchievementManager } from '../Achievements/AchievementManager';
import { AchievementsWithCompletion } from '../../types/achievements';
import {SessionDetails} from '../../types/session';
import {Vibration} from 'react-native';
import formatDateTime from '../formatDateTime';
import {getBetterTime} from './getBetterTime';
import getTimeDifference from './getTimeDifference';
import nextHundredthMileSeconds from './nextHundrethMileSeconds';
import checkDailyStreak from '../Session/checkDailyStreak';

//increase distance hiked
export async function increaseDistanceHiked({
  user,
  userMiles,
  currentTrail,
  sessionDetails,
  userSession,
  setSessionDetails,
  achievementsWithCompletion,
  completedHikes,
  onAchievementEarned
}: {
  user: User;
  userMiles: User_Miles[];
  currentTrail: Trail;
  userSession: User_Session;
  setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
  sessionDetails: SessionDetails;
  achievementsWithCompletion: AchievementsWithCompletion[];
  completedHikes: Completed_Hike;
  onAchievementEarned: any
}) {
  //UPDATE CURRENT TRAILDISTANCE in session when user walks .01 miles

  //increase state current_trail_distance, user total miles by .01 every .01 miles (pace dependent)

  try
  {
    const canIncreaseDistance =
      sessionDetails.elapsedPomodoroTime > 0 &&
      sessionDetails.elapsedPomodoroTime %
        nextHundredthMileSeconds(sessionDetails.pace) ===
        0 &&
      Number(user.trailProgress) < Number(currentTrail.trailDistance);
    if (canIncreaseDistance) {
      console.debug('updating in increaseDistanceHiked()');
      //update users distance on database
      await user.increaseDistanceHikedWriter({
        user,
        userMiles: userMiles[0],
        userSession,
      });
      //Check for any achievements that would unlock at the users current total miles hiked
      //return array of achievements {achievementId, achievementName}[]
      const achievementsEarned =
        await AchievementManager.checkTotalMilesAchievements(
          user,
          userMiles[0],
          achievementsWithCompletion
        );
      
      //check if any achievements earned
      //if so, update the Current sessions achievements list to display on the screen for user
      if (achievementsEarned && achievementsEarned.length > 0) {
        console.debug('calling on achievements increase Distance Hiked', {
          achievementsEarned,
        });
        onAchievementEarned(achievementsEarned);
      }
    }
    //Check if session is break time
    const timeForBreak =
      sessionDetails.elapsedPomodoroTime ===
      sessionDetails.initialPomodoroTime - 1;
    if (
      timeForBreak
    )
    {
      //if break time find out which break is due
      //if user still has more sets left until long break
      //set and begin short break time @ 0
      const sessionHasRemaingShortBreaks =
        sessionDetails.currentSet < sessionDetails.sets;
      if (sessionHasRemaingShortBreaks) {
        setSessionDetails((prev: any) => {
          return {
            ...prev,
            elapsedShortBreakTime: 0,
          };
        });
      } else {
        //if user still has used all short breaks
        //set and begin long break time @ 0
        setSessionDetails((prev: any) => {
          return {
            ...prev,
            elapsedLongBreakTime: 0,
          };
        });
      }
    }
  } catch (err) {
    console.error('Error in timerflow increaseDistanceHiked()', err);
  }
}

//update users_miles / user

//update new trail
export async function updateUsersTrailAndQueue({
  watermelonDatabase,
  user,
  queuedTrails,
}: {
  watermelonDatabase: Database;
  user: User;
  queuedTrails: Queued_Trail[];
}) {
  try {
    const currentDate = formatDateTime(new Date());
    //!check if user is subscribed. If so make all trails random, else only make basic subscription trails random
    const randomTrailId = Math.floor(Math.random() * 7 + 1).toString();
    //if user has set their own trails to be up next
    if (queuedTrails.length)
    {
      //@writer
      //update user in database
      //user.current trail = users next trail in their queue
      //next trail start date and time
      const updatedUserTrail = await user.updateUserTrail({
        trailId: queuedTrails[0].trailId,
        trailStartedAt: currentDate,
      });
      //if update was successful
      //remove the new trail from their queue
      if (updatedUserTrail) {
        await watermelonDatabase.write(async () => {
          await queuedTrails[0].markAsDeleted();
        });
      }
      //if user doesnt have a trail next in their queue use a random trail
    } else
    {
      //@writer
      //update users in database
      //user current trail is randomId from above
      //start time is now() from above
      await user.updateUserTrail({
        trailId: randomTrailId,
        trailStartedAt: currentDate,
      });
    }
  } catch (err) {
    console.error(
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
      ...prev,
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
  try {
    setSessionDetails((prev) => ({...prev, isPaused: true}));
    return true;
  } catch (error) {
    console.error('Error in pauseSession:', error);
    return false;
  }
}


//end a session by caling reset session state
export async function endSession({
  user,
  sessionDetails,
  setSessionDetails,
}: 
{
    user: User;
    sessionDetails: SessionDetails;
  setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
  
 
}) {
  try {
    

    //check daily streak
    await checkDailyStreak(user, sessionDetails)
    resetSessionState(setSessionDetails);
  } catch (err: any) {
    console.debug(`Error in EndSession()`, err);
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
  achievementsWithCompletion,
  completedHikes,
  onAchievementEarned
}: {
  setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
  sessionDetails: SessionDetails;
  canHike?: boolean;
  userSession: User_Session;
  user: User;
  userMiles: User_Miles;
  currentTrail: Trail;
  achievementsWithCompletion: AchievementsWithCompletion[];
    completedHikes: Completed_Hike[];
  onAchievementEarned: any
}) {
  if (sessionDetails.isPaused === false) {
    if (
      sessionDetails.elapsedPomodoroTime < sessionDetails.initialPomodoroTime
    ) {
      //increase usersession by 1 in the watermelon database
      await userSession.updateTotalSessionTime();
      increaseDistanceHiked({
        user,
        userMiles,
        currentTrail,
        userSession,
        sessionDetails,
        setSessionDetails,
        achievementsWithCompletion,
        completedHikes,
        onAchievementEarned
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
    Vibration.vibrate(1000);
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
  //increase session detailes elaposedPomodorotime every second
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

//checks if current trail has been completed
//checks if trail has been previously completed by the user
//checks for achievements of type Trail Completetion
export async function isTrailCompleted({
  user,
  watermelonDatabase,
  currentTrail,
  completedHikes,
  queuedTrails,
  achievementsWithCompletion,
  onAchievementEarned,
  onCompletedTrail,
}: {
  user: User;
  watermelonDatabase: Database;
  currentTrail: Trail;
  completedHikes: Completed_Hike[];
  queuedTrails: Queued_Trail[];
  achievementsWithCompletion: AchievementsWithCompletion[];
  onAchievementEarned: (achievements: Achievement[]) => void;
  onCompletedTrail: (trail: Trail) => void;
}) {
  try {
    if (Number(user.trailProgress) >= Number(currentTrail.trailDistance)) {
      //checkif completed hike table has column with the current trail and username
      const existingCompletedHike = await user.hasTrailBeenCompleted();
      console.debug('TimerFlow inside isTrailCompleted()', {
        existingCompletedHike,
      });

      //set current date to now (YY-MM-DD H/H:mm:ss)
      const currentDateTime = formatDateTime(new Date());
      console.debug('TimerFlow inside isTrailCompleted()', {currentDateTime});
      //get time difference in H:mm:ss from time trail started to now(finished)
      const timeToComplete = getTimeDifference(
        currentDateTime,
        user.trailStartedAt
      );
      console.debug('TimerFlow inside isTrailCompleted()', {timeToComplete});

      //if completed trail existed keep first completed date else set to now
      const firstCompletedTime: string = existingCompletedHike
        ? //@ts-ignore
          existingCompletedHike.firstCompletedAt
        : currentDateTime;
      console.debug('TimerFlow inside isTrailCompleted()', {
        firstCompletedTime,
      });

      //if already completed find best time between theat time vs this time
      //else set it to the time it just took to finish from start date / time
      const betterTime: string = existingCompletedHike
        ? //@ts-ignore
          getBetterTime(timeToComplete, existingCompletedHike.bestCompletedTime)
        : timeToComplete;

      console.debug('TimerFlow inside isTrailCompleted()', {betterTime});

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
        const addedHike = await user.addCompletedHike({
          trailId: user.trailId,
          bestCompletedTime: betterTime,
          firstCompletedAt: firstCompletedTime,
          lastCompletedAt: currentDateTime,
        });
        console.debug('TimerFlow, inside isTrailCompleted()', {addedHike});

        if (addedHike) {
          await updateUsersTrailAndQueue({
            watermelonDatabase,
            user,
            queuedTrails,
          });
        }
        console.debug({currentTrail})
        onCompletedTrail(currentTrail)
        const updatedCompletedHikes = await user.completedHikes;
        const achievementsEarned =
          await AchievementManager.checkTrailCompletionAchievements(
            user,
            updatedCompletedHikes,
            achievementsWithCompletion
          );
        if (achievementsEarned && achievementsEarned.length > 0) {
          onAchievementEarned(achievementsEarned);
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
  achievementsWithCompletion,
  onAchievementEarned,
  onCompletedTrail,
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
  achievementsWithCompletion: AchievementsWithCompletion[];
  onAchievementEarned: (achievements: Achievement[]) => void;
  onCompletedTrail: (trail: Trail) => void;
}) {
  try {
    //check for completed hike
    //console.debug('TimerFlow hike() calling isTrailCompleted()');
    isTrailCompleted({
      watermelonDatabase,
      user,
      completedHikes,
      currentTrail,
      queuedTrails,
      achievementsWithCompletion,
      onAchievementEarned,
      onCompletedTrail
    });

    //modify Speed
    //console.debug('TimerFlow hike() calling speed Modifier()');
    speedModifier(setSessionDetails, sessionDetails);

    //console.debug('TimerFlow hike() calling increaseElapsedTime()')
    increaseElapsedTime({
      user,
      userMiles,
      currentTrail,
      setSessionDetails,
      sessionDetails,
      canHike,
      userSession,
      achievementsWithCompletion,
      completedHikes,
      onAchievementEarned,
    });
    //save the users current session details in the database
  } catch (err) {
    console.log('Error in Hike helper func', err);
  }
}
