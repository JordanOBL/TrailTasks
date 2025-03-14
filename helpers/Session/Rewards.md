🏆 Trail Tasks Token System
The Trail Tasks app rewards users with Trail Tokens based on their focus time and trail progress. These tokens can be used to unlock new trails, buy add-ons, and compete on leaderboards.

This document explains how the token system works for users and provides technical details for developers maintaining the reward logic.

🏅 How Users Earn Trail Tokens
Users earn Trail Tokens in two primary ways:

Trail Completion Rewards

Users receive tokens when they fully complete a trail.
The number of tokens depends on the trail distance (longer trails reward more tokens).
Session Rewards

Tokens are earned based on total focused time during a session.
15 minutes minimum focus time is required to receive tokens.
Users get 10 tokens per 15 minutes of focus time.
Longer focus times earn bonus multipliers:
+10% extra for every 45 minutes of total focus time.
Continuation Bonus for extending sessions.
🎯 Example Rewards
Total Focus Time	Base Tokens Earned	Bonus Multiplier	Final Reward
15 min	10 tokens	0%	10
30 min	20 tokens	0%	20
45 min	30 tokens	+10%	33
60 min	40 tokens	+10%	44
75 min	50 tokens	+20%	60
90 min	60 tokens	+20%	72
120 min	80 tokens	+30%	104
180 min	120 tokens	+40%	168
🎖 Continuation Bonus
If a user exceeds their expected sets by continuing a session:

+5 extra tokens per additional completed set.
This prevents users from setting low expected sets just to farm continuation bonuses.
🛠 Developer Guide: How Rewards Are Calculated
The reward system is implemented in Rewards.calculateSessionTokens inside /helpers/Rewards.ts.

Core Calculation Logic
typescript
Copy
Edit
const Rewards = {
  calculateSessionTokens: ({
    setSessionDetails,
    sessionDetails,
    timer,
  }: {
    setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
    sessionDetails: SessionDetails;
    timer: Timer;
  }): number => {
    const totalMinutes = Math.floor(timer.elapsedTime / 60);

    if (totalMinutes < 15) return 0; // No tokens if < 15 min focus

    const baseTokens = Math.floor(totalMinutes / 15) * 10; // 10 tokens per 15 min

    const bonusMultiplier = Math.floor(totalMinutes / 45) * 0.1;
    const bonusTokens = Math.floor(baseTokens * bonusMultiplier);

    const adjustedExpectedSets = sessionDetails.continueSessionModal
      ? timer.sets * 2 // Double expected sets for full session continuation
      : timer.sets;

    let continuationBonus = 0;
    if (timer.completedSets > adjustedExpectedSets) {
      continuationBonus = (timer.completedSets - adjustedExpectedSets) * 5; // +5 tokens per extra set
    }

    const totalTokens = baseTokens + bonusTokens + continuationBonus;

    setSessionDetails((prevSessionDetails) => ({
      ...prevSessionDetails,
      sessionTokensEarned: totalTokens,
    }));

    return totalTokens;
  },
};
🔥 How Users Can Maximize Tokens
Choose a longer focus time per set
More focus time = more tokens per session.
Continue sessions when possible
Completing more than expected sets grants continuation bonuses.
Hike longer trails
Trail completion tokens scale with distance.
❗ Important Notes for Developers
Token rewards should be fair but motivating
Users should not feel penalized for short sessions, but long focus should be highly rewarding.
Continuation bonuses should not be exploitable
Users can only get them if they exceed 3 full sets (45 min) in a single session.
Session state should be updated correctly
Tokens must be stored in WatermelonDB after each session.
🎯 Summary
Users earn 10 tokens per 15 min focus.
+10% bonus per 45 min total focus time.
Continuation bonus: +5 tokens per extra completed set.
Tokens can be used for trails, add-ons, and leaderboard ranking.

