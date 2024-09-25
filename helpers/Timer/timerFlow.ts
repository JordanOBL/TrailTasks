import {
  Achievement,
  Completed_Hike,
  Queued_Trail,
  Trail,
  User,
  User_Session,
} from '../../watermelon/models';
//creating a new session
import {Database} from '@nozbe/watermelondb';
import handleError from "../ErrorHandler";
import { achievementManagerInstance } from '../Achievements/AchievementManager';
import { AchievementsWithCompletion } from '../../types/achievements';
import {SessionDetails} from '../../types/session';
import {Vibration} from 'react-native';
import formatDateTime from '../formatDateTime';
import {getBetterTime} from './getBetterTime';
import getTimeDifference from './getTimeDifference';
import nextHundredthMileSeconds from './nextHundrethMileSeconds';
import checkDailyStreak from '../Session/checkDailyStreak';
import React from "react";

//increase distance hiked
export async function increaseDistanceHiked({
  user,
  currentTrail,
  sessionDetails,
  userSession,
  setSessionDetails,
  achievementsWithCompletion,
  completedHikes,
  onAchievementEarned
}: {
  user: User;
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
    const isTimeToIncreaseDistance =
        sessionDetails.elapsedPomodoroTime > 0 &&
        sessionDetails.elapsedPomodoroTime % nextHundredthMileSeconds(sessionDetails.pace) === 0;

    const hasRemainingTrailDistance = user.trailProgress < Number(currentTrail.trailDistance);

    const canIncreaseDistance = isTimeToIncreaseDistance && hasRemainingTrailDistance;
    if (canIncreaseDistance) {
      console.debug('updating in increaseDistanceHiked()');
      //update users distance on database
      await user.increaseDistanceHikedWriter({
        user,
        userSession,
      });
      //Check for any achievements that would unlock at the users current total miles hiked
      //return array of achievements {achievementId, achievementName}[]
      const achievementsEarned =
        await achievementManagerInstance.checkTotalMilesAchievements(
          user,
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
    handleError(err, "increaseDistanceHiked");
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
    const randomTrailId = Math.floor(Math.random() * 50 + 1).toString();
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
    handleError(err, "updateUsersTrailAndQueue");
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
    breakTimeReduction:0,
    sets: 3,
    currentSet: 1,
    minimumPace: 2,
    maximumPace: 5.5,
    pace: 2,
    paceIncreaseValue: .25,
    paceIncreaseInterval: 900, //15 minutes,
    increasePaceOnBreakValue: 0, //TODO: possible addon sleeping bag increases pace by this interval on breaks
    completedHike: false,
    strikes: 0,
    penaltyValue: 1,
    endSessionModal: false,
    totalSessionTime: 0,
    totalDistanceHiked: 0.0,
    trailTokenBonus: 0,
    trailTokensEarned:0,
    isLoading: false,
    isError: false,
    backpack: [{addon: null, minimumTotalMiles:0.0}, {addon: null, minimumTotalMiles:75.0}, {addon: null, minimumTotalMiles:175.0}, {addon: null, minimumTotalMiles:375.0}]
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
  sessionDetails: SessionDetails,
  setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>
) {
  const isActive = sessionDetails.elapsedPomodoroTime < sessionDetails.initialPomodoroTime
  try {
    if(isActive){
      setSessionDetails((prev) => ({...prev,strikes: prev.strikes+1,pace: prev.pace - prev.penaltyValue < prev.minimumPace ? prev.minimumPace : prev.pace - prev.penaltyValue, isPaused: true}))
    }
    else{
      setSessionDetails((prev) => ({...prev, isPaused: true}))

    }
    return true;
  } catch (err) {
    handleError(err, "pauseSession");
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
    // @ts-ignore
    await checkDailyStreak(user, sessionDetails)
    resetSessionState(setSessionDetails);
  } catch (err: any) {
    handleError(err, "endSession");
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
  currentTrail: Trail;
  achievementsWithCompletion: AchievementsWithCompletion[];
    completedHikes: Completed_Hike[];
  onAchievementEarned: any
}) {
  try {
    if (sessionDetails.isPaused === false) {
      if (
          sessionDetails.elapsedPomodoroTime < sessionDetails.initialPomodoroTime
      ) {
        // Increase elapsed time in state first
        setSessionDetails((prev: any) => ({
          ...prev,
          elapsedPomodoroTime: prev.elapsedPomodoroTime + 1,
        }));

        // Perform asynchronous operations after state update
        await Promise.all([
          userSession.updateTotalSessionTime(),
          increaseDistanceHiked({
            user,
            //@ts-ignore
            currentTrail,
            userSession,
            sessionDetails,
            setSessionDetails,
            achievementsWithCompletion,
            //@ts-ignore
            completedHikes,
            onAchievementEarned
          }),
        ]);
      } else if (sessionDetails.currentSet < sessionDetails.sets) {
        await shortBreak({sessionDetails, setSessionDetails});
      } else if (sessionDetails.currentSet >= sessionDetails.sets) {
        await longBreak({sessionDetails, setSessionDetails});
      }
    }
  }catch(err){
    handleError(err, "increaseElapsedTime");
  }
}

async function speedModifier(
  cb: React.Dispatch<React.SetStateAction<SessionDetails>>,
  sessionDetails: SessionDetails
) {

  const notShortBreak = sessionDetails.elapsedShortBreakTime == 0;
  const notLongBreak = sessionDetails.elapsedLongBreakTime == 0;
  const notJustStarted = sessionDetails.elapsedPomodoroTime > 0
  const timeToModifyPace = (sessionDetails.elapsedPomodoroTime % sessionDetails.paceIncreaseInterval === 0) 
  //not being called
  function decreasePace(
    cb: React.Dispatch<React.SetStateAction<SessionDetails>>,
    sessionDetails: SessionDetails
  ) {
    if (sessionDetails.pace > sessionDetails.minimumPace) {
      cb((prev) => {
        return {...prev, pace: prev.pace - prev.penaltyValue};
      });
    } else {
      cb((prev) => {
        return {...prev, pace: sessionDetails.minimumPace};
      });
    }
  }

  function increasePace(
    cb: React.Dispatch<React.SetStateAction<SessionDetails>>,
    sessionDetails: SessionDetails
  ) {
    if (sessionDetails.pace < sessionDetails.maximumPace) {
      cb((prev) => ({...prev, pace: prev.pace + sessionDetails.paceIncreaseValue})      );
    } else {
      cb((prev) => ({...prev, pace: sessionDetails.maximumPace}));
    }
  }
  if (sessionDetails.sessionName.toLowerCase() === 'fastasfuqboi') return;
  if ( notShortBreak && notLongBreak && notJustStarted && timeToModifyPace) {
    Vibration.vibrate(1000);
    //if (sessionDetails.strikes === 0) increasePace(cb, sessionDetails);
    increasePace(cb, sessionDetails);

    //else decreasePace(cb, sessionDetails);
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
  try {//increase session detailes elaposedPomodorotime every second
    if (
        sessionDetails.elapsedShortBreakTime >= sessionDetails.initialShortBreakTime
    ) {
      setSessionDetails((prev) => {
        return {...prev, elapsedPomodoroTime: 0, currentSet: prev.currentSet + 1, elapsedShortBreakTime: 0};
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
  }catch(err) {
    handleError(err, "shortBreak");
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
  try {
    if (
        sessionDetails.elapsedLongBreakTime >= sessionDetails.initialLongBreakTime
    ) {
      setSessionDetails((prev) => {
        return {...prev, elapsedPomodoroTime: 0, currentSet: 1, elapsedLongBreakTime: 0};
      });
    } else {
      setSessionDetails((prev: any) => {
        return {
          ...prev,
          elapsedLongBreakTime: prev.elapsedLongBreakTime + 1,
        };
      });
    }
  }catch(err) {
    handleError(err, "longBreak");
  }

}
//skip break
export function skipBreak(
  cb: React.Dispatch<React.SetStateAction<SessionDetails>>,
  sessionDetails: SessionDetails
) {
  try {
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
  }catch(err) {
    handleError(err, "skipBreak");
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
    if (user.trailProgress >= Number(currentTrail.trailDistance)) {
      //checkif completed hike table has column with the current trail and username
      let calculatedReward = Math.ceil(Number(currentTrail.trailDistance));
        const reward = currentTrail.trailOfTheWeek ? calculatedReward * 10 : calculatedReward * 3 < 5 ? 5 : Math.ceil(calculatedReward * 3)
      

        onCompletedTrail(currentTrail, reward);

      const existingCompletedHike = await user.hasTrailBeenCompleted(user.id, currentTrail.id);


      //set current date to now (YY-MM-DD H/H:mm:ss)
      const currentDateTime = formatDateTime(new Date());
      //get time difference in H:mm:ss from time trail started to now(finished)
      const timeToComplete = getTimeDifference(
        currentDateTime,
        user.trailStartedAt
      );

      //if completed trail existed keep first completed date else set to now
      const firstCompletedTime: string = existingCompletedHike
        ? //@ts-ignore
          existingCompletedHike.firstCompletedAt
        : currentDateTime;


      //if already completed find best time between theat time vs this time
      //else set it to the time it just took to finish from start date / time
      const betterTime: string = existingCompletedHike
        ? //@ts-ignore
          getBetterTime(timeToComplete, existingCompletedHike.bestCompletedTime)
        : timeToComplete;


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


        if (addedHike) {
          await updateUsersTrailAndQueue({
            watermelonDatabase,
            user,
            queuedTrails,
          });
        }
              const updatedCompletedHikes = await user.completedHikes;
        const achievementsEarned =
          await achievementManagerInstance.checkTrailCompletionAchievements(
            user,
            updatedCompletedHikes,
            achievementsWithCompletion
          );
        if (achievementsEarned && achievementsEarned.length > 0) {
          onAchievementEarned(achievementsEarned);
        }
      }
      await user.awardCompletedTrailTokens(reward);

      return true;
    }
  } catch (err) {
    handleError(err, "isTraillCompleted")
  }
}
//hiking
export async function Hike({
  watermelonDatabase,
  user,
  userSession,
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
  completedHikes: Completed_Hike[];
  currentTrail: Trail;
  queuedTrails: Queued_Trail[];
  achievementsWithCompletion: AchievementsWithCompletion[];
  onAchievementEarned: (achievements: Achievement[]) => void;
  onCompletedTrail: (trail: Trail) => void;
}) {
  try {
    //check for completed hike
    await isTrailCompleted({
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
    await speedModifier(setSessionDetails, sessionDetails);

    //console.debug('TimerFlow hike() calling increaseElapsedTime()')
    await increaseElapsedTime({
      user,
      currentTrail,
      setSessionDetails,
      sessionDetails,
      canHike,
      userSession,
      achievementsWithCompletion,
      completedHikes,
      onAchievementEarned,
    });
  } catch (err) {
      handleError(err, "Hike")
  }
}
