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
Rewards.calculateSessionTokens = ({
    setSessionDetails,
    sessionDetails,
    timer,
  }: {
    setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
    sessionDetails: SessionDetails;
    timer: Timer;
  }): number => {
    // Convert elapsed time to minutes
    const totalMinutes = Math.floor(timer.elapsedTime / 60);

    // If total focus time is < 15 minutes, NO reward
    if (totalMinutes < 15) return 0;

    // Base Tokens: **10 per 15 minutes**
    const baseTokens = Math.floor(totalMinutes / 15) * 10;

    // Bonus Multiplier: Every **45 min → +10%**
    const bonusMultiplier = Math.floor(totalMinutes / 45) * 0.1;
    const bonusTokens = Math.floor(baseTokens * bonusMultiplier);

    // 🔹 **Adjusted Expected Sets (Prevents Cheating)**
    const adjustedExpectedSets = sessionDetails.continueSessionModal
      ? timer.sets * 2 // If they chose "Add Session," their expected sets double
      : timer.sets;

    // 🔹 **Continuation Bonus** (If user exceeds planned sets)
    let continuationBonus = 0;
    if (timer.completedSets > adjustedExpectedSets) {
      continuationBonus = (timer.completedSets - adjustedExpectedSets) * 5; // +5 per extra set
    }
    // 🔥 Final Token Calculation
    const totalTokens = baseTokens + bonusTokens + continuationBonus;

    console.debug('totalTokens', totalTokens);

    // **Update Session State**
    setSessionDetails((prevSessionDetails) => ({
      ...prevSessionDetails,
      sessionTokensEarned: totalTokens,
    }));

    return totalTokens;
  }

  Rewards.rewardFinalTokens = async ({
    sessionDetails,
    sessionTokensReward,
    user,
  }: {
    sessionDetails: SessionDetails;
    sessionTokensReward: number;
    user: User;
  }) => {
    try {
      let reward = sessionDetails.trailTokensEarned + sessionTokensReward;
      reward += sessionDetails.totalTokenBonus * reward; // Apply trail completion bonus

      await user.awardFinalSessionTokens(reward);
    } catch (error) {
      handleError(error, "Rewards.rewardFinalTokens");
    }
  }


export default Rewards;
