import {
  Achievement,
  User_Completed_Trail,
  User_Queued_Trail,
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
import checkDailyStreak from '../Session/checkDailyStreak';
import Rewards from '../Session/Rewards';
import React from "react";
import Timer from "../../types/timer";


//increase distance hiked
export async function increaseDistanceHiked({
  user,
  timer,
  setSessionDetails,
  sessionDetails,
  userSession,
  achievementsWithCompletion,
  onAchievementEarned
}: {
    user: User;
    timer: Timer;
    currentTrail: Trail;
    userSession: User_Session;
    setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
    sessionDetails: SessionDetails;
    achievementsWithCompletion: AchievementsWithCompletion[];
    completedTrails: User_Completed_Trail;
    onAchievementEarned: any
  }) {
  //UPDATE CURRENT TRAILDISTANCE in session when user walks .01 miles
  //increase state current_trail_distance, user total miles by .01 every .01 miles (pace dependent)
  try
{

    //update users distance on database && usersession
    await user.increaseDistanceHikedWriter({
      user,
      userSession,
      timer,
      sessionDetails
    });
    setSessionDetails(prev => ( {...prev, totalDistanceHiked: prev.totalDistanceHiked + .01} ));
    console.log("updated user distance on database");
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
  } catch (err) {
    handleError(err, "increaseDistanceHiked");
  }
}

//handle timer is zero
export const checkTimerIsZero = ({timer, setTimer}: {timer: Timer, setTimer: React.Dispatch<React.SetStateAction<Timer>> }) => {

    //Check if session is break time
    const completedAllSets = timer.completedSets + 1 > timer.sets;
    const timeForBreak =  timer.isBreak === false;
    const returnFromBreak = timer.isBreak === true;


    // if user has completed all sets
    if (completedAllSets) {
      Vibration.vibrate([0, 1000, 500, 1000]);
      setTimer((prev: Timer) => {
        return {
          ...prev,
        isCompleted: true
        };
      });
      return
      //TOD0: add modal to let user to do extra set or finish
    }
    Vibration.vibrate(1000);

    //if user has sets remaining and time for a break
    if (timeForBreak){
      //Find out which break is due
      const sessionHasRemaingShortBreaks = timer.completedSets + 1 < timer.sets;

      //if user still has more short breaks left until long break
      if (sessionHasRemaingShortBreaks) {
        //set and begin short break time
        setTimer((prev: Timer) => {
          return {
            ...prev,
            time: prev.shortBreakTime,
            isBreak: true,
            completedSets: prev.completedSets + 1
          };
        });
      } else {
        //if user still has used all short breaks
        //set and begin long break time @ 0
        setTimer((prev: Timer) => {
          return {
            ...prev,
            time: prev.longBreakTime,
            isBreak: true,
            completedSets: prev.completedSets + 1
          };
        });
      }
    }
    //if Timer is zero because break just ended
    else if (returnFromBreak){
      //set and begin next focus set
      setTimer((prev: Timer) => {
        return {
          ...prev,
          time: prev.focusTime,
          isBreak: false,
        };
      });
    }
}


//update new trail
export async function updateUsersTrailAndQueue({
  watermelonDatabase,
  user,
  queuedTrails,
}: {
    watermelonDatabase: Database;
    user: User;
    queuedTrails: User_Queued_Trail[];
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
function resetTimerState(setTimer: React.Dispatch<React.SetStateAction<Timer>>) {
  setTimer((prev: Timer) => {
    return {
      ...prev,
      time: 1500,
      isRunning: false,
      isBreak: false,
      isPaused: false,
      completedSets: 0,
      sets: 3,
      pace: 2,
      autoContinue: false,
      startTime: null,
      isCompleted: false
    };
  });

}
//reset Session State
function resetSessionState(
  setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>
) {
  setSessionDetails((prev: SessionDetails) => {
    return {
      startTime: null,
      sessionName: '',
      sessionDescription: '',
      sessionCategoryId: null,
      breakTimeReduction:0,
      minimumPace: 2,
      maximumPace: 5.5,
      paceIncreaseValue: .25,
      paceIncreaseInterval: 900, //15 minutes,
      increasePaceOnBreakValue: 0, //TODO: possible addon sleeping bag increases pace by this interval on breaks
      completedTrail: false,
      strikes: 0,
      penaltyValue: 1,
      continueSessionModal: false,
      totalDistanceHiked: 0.0,
      totalTokenBonus: 0,
      trailTokensEarned:0,
      sessionTokensEarned:0,
      isLoading: false,
      isError: false,
      backpack: [{addon: null, minimumTotalMiles:0.0}, {addon: null, minimumTotalMiles:75.0}, {addon: null, minimumTotalMiles:175.0}, {addon: null, minimumTotalMiles:375.0}]
    };
  });
}

//resume paused session
export function resumeSession(
  setTimer: React.Dispatch<React.SetStateAction<SetTimer>>
) {
  setTimer((prev) => {
    return {...prev, isPaused: false};
  });
}

//pause session
export async function pauseSession(
  timer: Timer,
  setTimer: React.Dispatch<React.SetStateAction<Timer>>,
  sessionDetails: SessionDetails,
  setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>
) {
  const isActive = !timer.isPaused && !timer.isBreak
  const minimumPace = sessionDetails.minimumPace
  const penaltyValue = sessionDetails.penaltyValue
  const newPace = timer.pace - penaltyValue < minimumPace ? minimumPace : timer.pace - penaltyValue

  try {
    if(isActive){
      setSessionDetails((prev) => ({...prev,strikes: prev.strikes+1}))
      setTimer((prev) => ({...prev,pace: newPace, isPaused: true}))
    }
    else{
      setTimer((prev) => ({...prev, isPaused: true}))

    }
  } catch (err) {
    handleError(err, "pauseSession");
  }
}

//end a session by caling reset session state
export async function endSession({
  user,
  setTimer,
  sessionDetails,
  setSessionDetails,
}:
  {
    user: User;
    setTimer: React.Dispatch<React.SetStateAction<SetTimer>>;
    sessionDetails: SessionDetails;
    setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
  }) {
  try {
    //check daily streak
    // @ts-ignore
    console.debug("sessionDetails", sessionDetails)
    console.debug("endSession checking daily streak")
    await checkDailyStreak(user, sessionDetails)
    resetSessionState(setSessionDetails);
    resetTimerState(setTimer)
  } catch (err: any) {
    handleError(err, "endSession");
    setSessionDetails((prev) => {
      return {...prev, isError: err.message};
    });
  }
}


export async function checkPaceIncrease({timer, setTimer, paceIncreaseInterval, paceIncreaseValue, maximumPace, minimumPace}:
  {  timer: Timer,
    setTimer: React.Dispatch<React.SetStateAction<SetTimer>>,
    paceIncreaseInterval: number,
    paceIncreaseValue: number,
    maximumPace: number,
    minimumPace: number }
) {

  const paceIncreaseTimeReached =  ( timer.time > 0  ) && ( timer.time % paceIncreaseInterval === 0 )

  //if time is less than initial pomodoro time and not a break
  const canModifyPace = paceIncreaseTimeReached && (timer.time < timer.focusTime)&& !timer.isBreak

  //if can modify pace
  if(canModifyPace){

    //New pace
    const newPace = timer.pace + paceIncreaseValue

    //check max pace is reached or if pace increase will exceed max pace
    const maxPaceReached = timer.pace >= maximumPace

    //check if new pace will exceed max pace
    const willExceedMaxPace = newPace > maximumPace

    //if max pace reached or will exceed max pace
    if (maxPaceReached || willExceedMaxPace) {
      //set pace equal to max pace
      setTimer((prev) => ({...prev, pace: maximumPace}));
    } else {
      //vibrate
      Vibration.vibrate([0, 500, 200, 500]);
      //increase pace
      setTimer((prev) => ({...prev, pace: newPace}));
    }
  }
}


//skip break
export function skipBreak({timer, setTimer}:
  { timer: Timer,
    setTimer: React.Dispatch<React.SetStateAction<SetTimer>>
  }
) {
  try {
    if (( timer.completedSets  ) < timer.sets) {
      setTimer((prev) => {
        return {
          ...prev,
          isBreak: false,
          time: prev.focusTime,
        };
      });
    } else {
        setTimer((prev) => {
        return {
          ...prev,
          isBreak: false,
          isCompleted: true,
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
  setSessionDetails,
  currentTrail,
  queuedTrails,
  achievementsWithCompletion,
  onAchievementEarned,
  onCompletedTrail,
}: {
    user: User;
    watermelonDatabase: Database;
    setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
    currentTrail: Trail;
    queuedTrails: User_Queued_Trail[];
    achievementsWithCompletion: AchievementsWithCompletion[];
    onAchievementEarned: (achievements: Achievement[]) => void;
    onCompletedTrail: (trail: Trail) => void;
  }) {
  try {
    if (user.trailProgress  >= Number(currentTrail.trailDistance)) {
      //checkif completed hike table has column with the current trail and username
      let calculatedReward = Math.ceil(Number(currentTrail.trailDistance));
      const reward = currentTrail.trailOfTheWeek ? calculatedReward * 10 : calculatedReward * 3 < 5 ? 5 : Math.ceil(calculatedReward * 3)

      //add trail rewards to session reward bank
      //add trail to sessions completed trail bank
      onCompletedTrail({setSessionDetails, trail: currentTrail, reward });

      //check if trail has been completed by user before
      const existingCompletedTrail:User_Completed_Trail = await user.hasTrailBeenCompleted(user.id, currentTrail.id);


      //set current date to now (YY-MM-DD H/H:mm:ss)
      const currentDateTime = formatDateTime(new Date());
      //get time difference in H:mm:ss from time trail started to now(finished)
      const timeToComplete = getTimeDifference(
        currentDateTime,
        user.trailStartedAt
      );

      //if completed trail existed keep first completed date else set to now
      const firstCompletedTime: string = existingCompletedTrail
        ? //@ts-ignore
        existingCompletedTrail.firstCompletedAt
        : currentDateTime;


      //if already completed find best time between theat time vs this time
      //else set it to the time it just took to finish from start date / time
      const betterTime: string = existingCompletedTrail
        ? //@ts-ignore
        getBetterTime(timeToComplete, existingCompletedTrail.bestCompletedTime)
        : timeToComplete;


      if (existingCompletedTrail) {
        //@ts-ignore
        const updatedHike: User_Completed_Trail = await user.updateCompletedTrail({
          completedTrailId: existingCompletedTrail.id,
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
      } else if (!existingCompletedTrail) {
        //@ts-ignore
        console.debug('adding completed trail...')
        const addedHike = await user.addCompletedTrail({
          trailId: user.trailId,
          bestCompletedTime: betterTime,
          firstCompletedAt: firstCompletedTime,
          lastCompletedAt: currentDateTime,
        });
        if (addedHike) {
          console.debug('completed trail added...')
          await updateUsersTrailAndQueue({
            watermelonDatabase,
            user,
            queuedTrails,
          });
        }
        const updatedCompletedTrails = await user.usersCompletedTrails;
        const achievementsEarned =
          await achievementManagerInstance.checkTrailCompletionAchievements(
            user,
            updatedCompletedTrails,
            achievementsWithCompletion
          );
        if (achievementsEarned && achievementsEarned.length > 0) {
          onAchievementEarned(achievementsEarned);
        }
      }
      return true;
    }
  } catch (err) {
    handleError(err, "isTrailCompleted")
  }
}

export async function updateSession({
  watermelonDatabase,
  user,
  userSession,
  setSessionDetails,
  sessionDetails,
  timer,
  setTimer,
  currentTrail,
  queuedTrails,
  completedTrails,
  achievementsWithCompletion,
  onAchievementEarned,
  onCompletedTrail,
}: {
    user: User;
    watermelonDatabase: Database;
    setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
    sessionDetails: SessionDetails;
    timer: Timer;
    setTimer: React.Dispatch<React.SetStateAction<Timer>>;
    userSession: User_Session;
    completedTrails: User_Completed_Trail[];
    currentTrail: Trail;
    queuedTrails: User_Queued_Trail[];
    achievementsWithCompletion: AchievementsWithCompletion[];
    onAchievementEarned: (achievements: Achievement[]) => void;
    onCompletedTrail: (trail: Trail) => void;
  }) {
  try {
    if(!timer.isBreak){
      //check if trail is completed
      await isTrailCompleted({
        watermelonDatabase,
        user,
        setSessionDetails,
        completedTrails,
        currentTrail,
        queuedTrails,
        achievementsWithCompletion,
        onAchievementEarned,
        onCompletedTrail
      });
      //modify Distance  & Session Time
      await increaseDistanceHiked({
        user,
        currentTrail,
        setSessionDetails,
        timer,
        sessionDetails,
        userSession,
        achievementsWithCompletion,
        completedTrails,
        onAchievementEarned,
      });

    }
  } catch (err) {
    handleError(err, "Hike")
  }
}
