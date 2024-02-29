import {
  Completed_Hike,
  User,
  User_Miles,
  User_Session,
} from '../../watermelon/models';

import {AchievementsWithCompletion} from '../../types/achievements';
import {SessionDetails} from '../../types/session';

interface AchievementNameId {
  achievementName: String;
  achievementId: String;
}
export const AchievementManager = {
  //*This function adds a row to the the users_achievments database, unlocking a user Achievment
  checkTotalMilesAchievementsInProgress: false,
  checkTrailCompletionAchievementsInProgress: false,
  checkUserSessionAchievementsInProgress: false,

  async unlockAchievement(user: User, unlockAchievements: AchievementNameId[]) {
    try {
      //call the watermelinDB writer
      //returns {AcihevementName: string, achievementId: string}
      const unlockedAchievements = await user.unlockAchievements(
        user.id,
        unlockAchievements
      );
      if (unlockedAchievements.length > 0) {
        return unlockedAchievements;
      }
      return null;
    } catch (err) {
      console.error('Error in unlockAchievement() ', {err});
      return null;
    }
  },

  //Create a function that checks for achievments about a users total miles
  async checkTotalMilesAchievements(
    user: User,
    userMiles: User_Miles,
    achievementsWithCompletion: AchievementsWithCompletion[]
  ) {
    if (this.checkTotalMilesAchievementsInProgress) {
      console.log('Total miles achievement check is already in progress');
      return null;
    }
// console.debug({achievementsWithCompletion});
try {
  this.checkTotalMilesAchievementsInProgress = true;
  const unlockAchievements = [];
  // Loop through each achievement
  // Select only locked achievements of type 'Total Miles'
  // If user's total miles is >= current achievement's condition (number), unlock achievement
  for (let [index, achievement] of achievementsWithCompletion.entries()) {
    if (
      !achievement.completed &&
      achievement.achievement_type === 'Total Miles'
    ) {
      if (
        userMiles.totalMiles >= parseFloat(achievement.achievement_condition)
      ) {
        unlockAchievements.push({
          achievementName: achievement.achievement_name,
          achievementId: achievement.id,
        });
        // Mark the achievement as completed in the achievementsWithCompletion array
        achievementsWithCompletion[index].completed = true;
      }
    }
  }
  // Only hit the watermelon server if needed
  if (unlockAchievements.length > 0) {
    const unlockedAchievements = await this.unlockAchievement(
      user,
      unlockAchievements
    );
    return unlockedAchievements;
  }
} catch (err) {
  console.error('Error in checkTotalMilesAchievements', {err});
} finally {
  // Set the flag to false after try or catch block execution
  this.checkTotalMilesAchievementsInProgress = false;
}

  },
  // Function to check for achievements related to trail completion
  async checkTrailCompletionAchievements(
    user: User,
    completedHikes: Completed_Hike[],
    achievementsWithCompletion: AchievementsWithCompletion[]
  ) {
    if (this.checkTrailCompletionAchievementsInProgress) {
      console.log('Trail Completion achievement check is already in progress');
      return null;
    }
    try {
      this.checkTrailCompletionAchievementsInProgress = true;
      const unlockAchievementIds = [];
      const completedTrailIds = completedHikes.map((hike) =>
        parseInt(hike.trailId)
      );

      for (let achievement of achievementsWithCompletion) {
        if (
          !achievement.completed &&
          (achievement.achievement_type === 'Single Trail Completion' ||
            achievement.achievement_type === 'Group Trail Completion' ||
            achievement.achievement_type === 'Park Completion')
        ) {
          const conditionTrails: string[] =
            achievement.achievement_condition.split(':');
          const conditionTrailIds: number[] = conditionTrails[1]
            ? conditionTrails[1].split(',').map((id) => parseInt(id))
            : [parseInt(conditionTrails[0])];

          // Check for Single Trail Completion
          if (achievement.achievement_type === 'Single Trail Completion') {
            const conditionTrailId: number = conditionTrailIds[0];
            if (completedTrailIds.includes(conditionTrailId)) {
              unlockAchievementIds.push({
                achievementName: achievement.achievement_name,
                achievementId: achievement.id,
              });
            }
          }

          // Check for Group Trail Completion
          if (achievement.achievement_type === 'Group Trail Completion') {
            const completedCount = conditionTrailIds.filter((trailId) =>
              completedTrailIds.includes(trailId)
            ).length;
            if (completedCount === conditionTrailIds.length) {
              unlockAchievementIds.push({
                achievementName: achievement.achievement_name,
                achievementId: achievement.id,
              });
            }
          }

          // Check for Partial Trail Completion
          if (achievement.achievement_type === 'Park Completion') {
            const requiredTrailCount = parseInt(conditionTrails[0]);

            const completedCount = conditionTrailIds.filter((trailId) =>
              completedTrailIds.includes(trailId)
            ).length;

            if (completedCount >= requiredTrailCount) {
              unlockAchievementIds.push({
                achievementName: achievement.achievement_name,
                achievementId: achievement.id,
              });
            }
          }
        }
      }

      if (unlockAchievementIds.length > 0) {
        const unlockedAchievements = await AchievementManager.unlockAchievement(
          user,
          unlockAchievementIds
        );
        this.checkTrailCompletionAchievementsInProgress = false;
        return unlockedAchievements;
      }
      this.checkTrailCompletionAchievementsInProgress = false;
    } catch (err) {
      console.error(
        'Error in checkTrailCompletionAchievementsOnTrailCompletion',
        err
      );
    } finally {
      this.checkTrailCompletionAchievementsInProgress = false;
    }
  },
  //create a function that checks for achievements about user sessions
  async checkUserSessionAchievements(
    user: User,
    sessionDetails: SessionDetails,
    currentSessionCategory: string,
    achievementsWithCompletion: AchievementsWithCompletion[]
  ) {
    if (this.checkUserSessionAchievementsInProgress) {
      console.log('Trail Completion achievement check is already in progress');

      return null;
    }
    try {
      this.checkUserSessionAchievementsInProgress = true;
      const unlockAchievementIds = [];
      //get an array of only session Category Ids
      for (let achievement of achievementsWithCompletion) {
        if (
          !achievement.completed &&
          (achievement.achievement_type === 'User Session Category' ||
            achievement.achievement_type === 'User Session Duration' ||
            achievement.achievement_type === 'User Session Name' ||
            achievement.achievement_type === 'User Session Strikes')
        ) {
          // Check for Categorys
          if (achievement.achievement_type === 'User Session Category') {
            const achievementConditions =
              achievement.achievement_condition.split(':');
            const conditionAmount: number = parseInt(achievementConditions[0]);
            const conditionSessionCategory: string = achievementConditions[1];
            //get sessions via category, limit by amount
            if (conditionSessionCategory === currentSessionCategory) {
              //@user.writer
              const sessionsByCount: number =
                await user.getSessionsOfCategoryCount(
                  sessionDetails.sessionCategoryId,
                  conditionAmount
                );
              //check if number returned by writer is equal to achievement codition aomunt
              if (sessionsByCount >= conditionAmount) {
                unlockAchievementIds.push({
                  achievementName: achievement.achievement_name,
                  achievementId: achievement.id,
                });
              }
            }
          }
        }
      }
      //once all achievements have been checked
      //send possible achievement in a array to be unlocked
      if (unlockAchievementIds.length > 0) {
        const unlockedAchievements = await AchievementManager.unlockAchievement(
          user,
          unlockAchievementIds
        );
        console.log({unlockedAchievements});
        this.checkUserSessionAchievementsInProgress = false;
        return unlockedAchievements;
      }
      this.checkUserSessionAchievementsInProgress = false;
      return null;
    } catch (err) {
      console.error('Error in checkUsersSessionsAchievements', err);
    } finally {
      this.checkUserSessionAchievementsInProgress = false;
    }
  },
  //Create a function that unlocks a specific achievement
};
