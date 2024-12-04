import React from 'react';
import {User} from '../../watermelon/models';
import {SessionDetails} from '../../types/session';
import {Timer} from '../../types/timer';
import handleError from '../ErrorHandler';
const Rewards = {}

Rewards.completedTrail = ({setSessionDetails, reward}: {setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>, reward: number}) => {
  setSessionDetails((prevSessionDetails) => ({
    ...prevSessionDetails,
    trailTokensEarned: prevSessionDetails.trailTokensEarned + reward,
  }))
}
//this is called after every long break / session is completed to update ui
//this is also called one last time when a session is ended
Rewards.calculateSessionTokens = ({setSessionDetails, sessionDetails, timer}: {setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>, sessionDetails: SessionDetails, timer: Timer}): number => {
  //Init FullSets, PartialSets, reward
  const fullSessions: number = Math.floor(timer.completedSets / 3)
  const partialSets: number = timer.completedSets % 3
  const chosenFocusTime: number = timer.focusTime / 60
  let fullSessionsReward: number = 0
  let partialSetsReward: number = 0
  let totalReward: number = 0

//User only completed 1 session, no bonus rewarded
  if(fullSessions === 1){
    totalReward = chosenFocusTime
  }
//user completed more than 1 full session
//bonus = 1.5 for complete sessions + .25 for every partial set completed
  if(fullSessions > 1){
     fullSessionsReward = Math.ceil( ( chosenFocusTime * (fullSessions - 1) ) * 1.5 ) + (chosenFocusTime * fullSessions) 
     partialSetsReward = Math.ceil( chosenFocusTime * 0.25 ) * partialSets
     totalReward = fullSessionsReward + partialSetsReward
  }

  
  setSessionDetails((prevSessionDetails) => ({
    ...prevSessionDetails,
    sessionTokensEarned: totalReward
  }))
  return totalReward

}

Rewards.rewardFinalTokens = async ({sessionDetails, sessionTokensReward, user}: {sessionDetails: SessionDetails, sessionTokensReward: number, user: User}) => {
  try{
    let reward: number = sessionDetails.trailTokensEarned + sessionTokensReward
    reward += sessionDetails.totalTokenBonus * reward

    await user.awardFinalSessionTokens(reward)

  } catch (error) {
    handleError(error, "Rewards.rewardFinalTokens")
  }
}

export default Rewards
