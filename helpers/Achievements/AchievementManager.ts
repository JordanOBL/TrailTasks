import {useDatabase} from '@nozbe/watermelondb/hooks';
import {Completed_Hike, User, User_Miles} from '../../watermelon/models';
import {AchievementsWithCompletion} from '../../types/achievements';
export const AchievementManager = {
  //*This function adds a row to the the users_achievments database, unlocking a user Achievment
  async unlockAchievement(user: User, completedAchievementIds: string[]) {
    try
    {
      console.debug({ user, completedAchievementIds });
      const unlockedAchievements = await user.unlockAchievements(
        user.id,
        completedAchievementIds
      );
      if (unlockedAchievements.length > 0) console.debug('successfuly added user achievement', { unlockedAchievements })
      return unlockedAchievements;
    } catch (err) {
      console.error('Error in unlockAchievement() ', {err});
    }
  },

  //Create a function that checks for achievments about a users total miles
  async check_total_miles_achievements(
    user: User,
    userMiles: User_Miles,
    achievementsWithCompletion: AchievementsWithCompletion[]
  ) {
    const unlockAchievementIds = [];
    try {
      //loop through each achievement
      //select only locked achievements of type 'Total Miles'
      //if users total miles is >= current achievements condition (number), unlock achievement
      for (let achievement of achievementsWithCompletion) {
        if (!achievement.completed && achievement.achievement_type === 'Total Miles') {
          if (userMiles.totalMiles > parseInt(achievement.achievement_condition)) {
            unlockAchievementIds.push(achievement.id);
          }
        }
      }
      //only hit the watermelon server if needed
      if (unlockAchievementIds.length > 0) {
        const unlockedAchievements = await this.unlockAchievement(
          user,
          unlockAchievementIds
        );
      }
    } catch (err) {
      console.error('Error in check_total_miles_achievements', {err});
    }
  },
  //Create a function that checks for achievements about a users completed trails
  async check_completed_trails_achievements(
    user: User,
    completedTrails: Completed_Hike[],
    achievementsWithCompletion: AchievementsWithCompletion[]
  ) {
    try {
      //array of achievement ids to send to the writer to unlock
      const unlockAchievementIds = [];
      //set of only completed Trail ids
      const completedTrailIdCache: Map<string, boolean> = new Map<
        string,
        boolean
      >();
      completedTrails.forEach((trail: Completed_Hike) => {
        completedTrailIdCache.set(trail.trailId, true);
      });

      for (let achievement of achievementsWithCompletion) {
        //if achievement isnt completed by user and achievement is of type Trail completeion
        if (!achievement.completed && achievement.achievement_type === 'Trail Completion') {
          let unlockAchievementFlag = true;
          //condition is CSV where values are trail ids
          //get array of trail ids needed to be completed for single achievement
          const conditionTrails = achievement.achievement_condition.split(',');
          //for each needed trail(id)
          // Inside check_completed_trails_achievements
          for (const trailId of conditionTrails) {
            if (!completedTrailIdCache.get(trailId)) {
              unlockAchievementFlag = false;
              break; // Exit the loop early if a condition trail is not found in completed trails
            }
          }

          //if all condition ids are found in completed trails -- Unlock flag still true, unlock achievement
          if (unlockAchievementFlag) unlockAchievementIds.push(achievement.id);
        }
      }
      //only hit the watermelon server if needed
      if (unlockAchievementIds.length > 0) {
        const unlockedAchievements = await this.unlockAchievement(
          user,
          unlockAchievementIds
        );
      }
    } catch (err) {
      console.error('Error in check_trail_completion_achievements', {err});
    }
  },
  //create a function that checks for achievements about user sessions
  //Create a function that unlocks a specific achievement
};
