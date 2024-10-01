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
import NextHundredthMileSeconds from './nextHundrethMileSeconds';
import checkDailyStreak from '../Session/checkDailyStreak';
import React from "react";


//increase distance hiked
export async function increaseDistanceHiked({
  user,
  timer, setTimer,
  currentTrail,
  sessionDetails,
  userSession,
  setSessionDetails,
  achievementsWithCompletion,
  completedHikes,
  onAchievementEarned
}: {
    user: User;
    timer: Timer;
    setTimer: React.Dispatch<React.SetStateAction<Timer>>;
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
    console.debug('updating in increaseDistanceHiked()');
    //update users distance on database && usersession
    await user.increaseDistanceHikedWriter({
      user,
      userSession,
      timer, 
      sessionDetails
    });
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
export const checkTimerIsZero = ({timer, setTimer}: {timer: Timer, setTimer: React.Dispatch<React.SetStateAction<Timer>>}) => {
  const timerIsZero = timer.time <= 0;
  console.debug('checkTimerIsZero', timerIsZero);
  if (timerIsZero) { 

    //Check if session is break time
    const completedSets = timer.currentSet > timer.sets;
    const timeForBreak =  timer.isBreak === false;
    const returnFromBreak = timer.isBreak === true;

    // if user has completed all sets
    if (completedSets) {
      Vibration.vibrate([0, 1000, 500, 1000]);
      setTimer((prev: Timer) => {
        return {
          ...prev,
          isRunning: false,
        };
      });
      return
      //TOD0: add modal to let user to do extra set or finish
    }
    Vibration.vibrate(1000);

    //if user has sets remaining and time for a break
    if (timeForBreak)
  {
      //Find out which break is due 
      const sessionHasRemaingShortBreaks = timer.currentSet < timer.sets;

      //if user still has more short breaks left until long break
      if (sessionHasRemaingShortBreaks) {
        //set and begin short break time
        setTimer((prev: Timer) => {
          return {
            ...prev,
            time: prev.initialShortBreakTime, isBreak: true,
          };
        });
      } else {
        //if user still has used all short breaks
        //set and begin long break time @ 0
        setTimer((prev: Timer) => {
          return {
            ...prev,
            time: prev.initialLongBreakTime, isBreak: true,
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
          time: prev.initialPomodoroTime,
          isBreak: false,
          currentSet: prev.currentSet + 1
        };
      });
    }
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
function resetTimerState(setTimer: React.Dispatch<React.SetStateAction<Timer>>) {
  setTimer((prev: Timer) => {
    return {
      ...prev,
      time: 0,
      isRunning: false,
      isBreak: false,
      isPaused: false,
      currentSet: 1,
      sets: 3,
      pace: 2,
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
      completedHike: false,
      strikes: 0,
      penaltyValue: 1,
      endSessionModal: false,
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
  timer, 
  setTimer,
  sessionDetails,
  setSessionDetails,
}: 
  {
    user: User;
    timer: Timer;
    setTimer: React.Dispatch<React.SetStateAction<SetTimer>>;
    sessionDetails: SessionDetails;
    setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
  }) {
  try {
    //check daily streak
    // @ts-ignore
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


export async function checkPaceIncrease(
  timer: Timer, 
  setTimer: React.Dispatch<React.SetStateAction<SetTimer>>, 
  paceIncreaseInterval: number,
  paceIncreaseValue: number,
  maximumPace: number,
  minimumPace: number
  
) {

  const paceIncreaseTimeReached = paceIncreaseInterval % timer.time === 0 

  //if time is less than initial pomodoro time and not a break
  const canModifyPace = paceIncreaseTimeReached && (timer.time < timer.initialPomodoroTime)&& !timer.isBreak

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
    if (timer.currentSet < timer.sets) {
      setTimer((prev) => {
        return {
          ...prev,
          isBreak: false,
          time: prev.initialPomodoroTime,
          currentSet: prev.currentSet + 1,
        };
      });
    } else {
        setTimer((prev) => {
        return {
          ...prev,
          isBreak: false,
          time: prev.initialPomodoroTime,
          currentSet: prev.currentSet + 1,
          sets: prev.sets + 1,
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
    if (user.trailProgress - .01 >= Number(currentTrail.trailDistance)) {
      //checkif completed hike table has column with the current trail and username
      let calculatedReward = Math.ceil(Number(currentTrail.trailDistance));
      const reward = currentTrail.trailOfTheWeek ? calculatedReward * 10 : calculatedReward * 3 < 5 ? 5 : Math.ceil(calculatedReward * 3)

      onCompletedTrail(currentTrail, reward);

      const existingCompletedHike:Completed_Hike = await user.hasTrailBeenCompleted(user.id, currentTrail.id);


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
  completedHikes,
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
    completedHikes: Completed_Hike[];
    currentTrail: Trail;
    queuedTrails: Queued_Trail[];
    achievementsWithCompletion: AchievementsWithCompletion[];
    onAchievementEarned: (achievements: Achievement[]) => void;
    onCompletedTrail: (trail: Trail) => void;
  }) {
  try {
    if(!timer.isBreak){
      //check if trail is completed
      console.debug( "checking isTrailCompleted")
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
      //modify Distance  & Session Time
      console.debug("increaseDistanceHiked")
      await increaseDistanceHiked({
        user,
        currentTrail,
        setSessionDetails,
        setTimer,
        timer,
        sessionDetails,
        userSession,
        achievementsWithCompletion,
        completedHikes,
        onAchievementEarned,
      });
      
      //modify Speed
    }
  } catch (err) {
    handleError(err, "Hike")
  }
}
