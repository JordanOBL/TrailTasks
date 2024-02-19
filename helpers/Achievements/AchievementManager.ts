import {useDatabase} from '@nozbe/watermelondb/hooks';
import {Completed_Hike, User, User_Miles} from '../../watermelon/models';
import { AchievementsWithCompletion } from '../../types/achievements';


  interface AchievementNameId {
    achievementName: String;
    achievementId: String;
  }
export const AchievementManager = {
  //*This function adds a row to the the users_achievments database, unlocking a user Achievment

  async unlockAchievement( user: User, unlockAchievements: AchievementNameId[]){
    try
    {
    
      const unlockedAchievements = await user.unlockAchievements(
        user.id,
        unlockAchievements
      );
      if (unlockedAchievements.length > 0) {
        return unlockedAchievements;
      }
      return null;
    } catch (err) {
      console.error('Error in unlockAchievement() ', { err });
      return null
    }
  },

  //Create a function that checks for achievments about a users total miles
  async checkTotalMilesAchievements(
    user: User,
    userMiles: User_Miles,
    achievementsWithCompletion: AchievementsWithCompletion[]
  ) {
    const unlockAchievements = [];
    try {
      //loop through each achievement
      //select only locked achievements of type 'Total Miles'
      //if users total miles is >= current achievements condition (number), unlock achievement
      for (let achievement of achievementsWithCompletion) {
        if (
          !achievement.completed &&
          achievement.achievement_type === 'Total Miles'
        ) {
          if (
            userMiles.totalMiles >= parseInt(achievement.achievement_condition)
          ) {
            unlockAchievements.push({achievementName: achievement.achievement_name, achievementId: achievement.id});
          }
        }
      }
      //only hit the watermelon server if needed
      if (unlockAchievements.length > 0) {
        const unlockedAchievements = await this.unlockAchievement(
          user,
          unlockAchievements
        );
        return unlockedAchievements;
      }
    } catch (err) {
      console.error('Error in checkTotalMilesAchievements', {err});
    }
  },
  // Function to check for achievements related to trail completion
  async checkTrailCompletionAchievements(
    user: User,
    completedTrails: Completed_Hike[],
    achievementsWithCompletion: AchievementsWithCompletion[]
  ) {
    try {
      const unlockAchievementIds = [];
      const completedTrailIds = completedTrails.map((trail) => trail.trailId);

      for (let achievement of achievementsWithCompletion) {
        if (
          !achievement.completed &&
          (achievement.achievement_type === 'Single Trail Completion' ||
            achievement.achievement_type === 'Group Trail Completion' ||
            achievement.achievement_type === 'Partial Trail Completion')
        ) {
          const conditionTrails = achievement.achievement_condition.split(':');
          const conditionTrailIds = conditionTrails[1]
            ? conditionTrails[1].split(',').map((id) => parseInt(id))
            : [parseInt(conditionTrails[0])];

          // Check for Single Trail Completion
          if (achievement.achievement_type === 'Single Trail Completion') {
            const conditionTrailId = parseInt(conditionTrailIds[0]);
            if (completedTrailIds.includes(conditionTrailId)) {
              unlockAchievementIds.push(achievement.id);
            }
          }

          // Check for Group Trail Completion
          if (achievement.achievement_type === 'Group Trail Completion') {
            const completedCount = conditionTrailIds.filter((trailId) =>
              completedTrailIds.includes(trailId)
            ).length;
            if (completedCount === conditionTrailIds.length) {
              unlockAchievementIds.push(achievement.id);
            }
          }

          // Check for Partial Trail Completion
          if (achievement.achievement_type === 'Partial Trail Completion') {
            const requiredTrailCount = parseInt(conditionTrails[0]);
            const completedCount = conditionTrailIds.filter((trailId) =>
              completedTrailIds.includes(trailId)
            ).length;
            if (completedCount >= requiredTrailCount) {
              unlockAchievementIds.push(achievement.id);
            }
          }
        }
      }

      if (unlockAchievementIds.length > 0) {
        const unlockedAchievements = await this.unlockAchievement(user, unlockAchievementIds);
      }
    } catch (err) {
      console.error('Error in checkTrailCompletionAchievements', err);
    }
  },
  //create a function that checks for achievements about user sessions
  //Create a function that unlocks a specific achievement
};
