import {
  Completed_Hike,
  User,
  User_Miles,
  User_Session,
} from '../../watermelon/models';

import {AchievementsWithCompletion} from '../../types/achievements';
import {SessionDetails} from '../../types/session';
import handleError from "../ErrorHandler";

interface AchievementNameId {
  achievementName: String;
  achievementId: String;
}
class AchievementManager {
  private static instance: AchievementManager;
  private checkTotalMilesAchievementsInProgress: boolean = false;
  private checkTrailCompletionAchievementsInProgress: boolean = false;
  private checkUserSessionAchievementsInProgress: boolean = false;

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static getInstance(): AchievementManager {
    if (!AchievementManager.instance) {
      AchievementManager.instance = new AchievementManager();
    }
    return AchievementManager.instance;
  }

  private async unlockAchievement(user: User, unlockAchievements: AchievementNameId[]) {
    try {
      const unlockedAchievements = await user.unlockAchievements(user.id, unlockAchievements);
      return unlockedAchievements.length > 0 ? unlockedAchievements : null;
    } catch (err) {
      handleError(err, "unlockAchievement");
      return null;
    }
  }

  public async checkTotalMilesAchievements(
      user: User,
      userMiles: User_Miles,
      achievementsWithCompletion: AchievementsWithCompletion[]
  ) {
    if (this.checkTotalMilesAchievementsInProgress) {
      console.log('Total miles achievement check is already in progress');
      return null;
    }
    this.checkTotalMilesAchievementsInProgress = true;

    try {
      const unlockAchievements = [];

      for (let [index, achievement] of achievementsWithCompletion.entries()) {
        if (
            !achievement.completed &&
            achievement.achievement_type === 'Total Miles' &&
            userMiles.totalMiles >= parseFloat(achievement.achievement_condition)
        ) {
          unlockAchievements.push({
            achievementName: achievement.achievement_name,
            achievementId: achievement.id,
          });
          achievementsWithCompletion[index].completed = true;
        }
      }

      return unlockAchievements.length > 0
          ? await this.unlockAchievement(user, unlockAchievements)
          : null;
    } catch (err) {
      handleError(err, "checkTotalMilesAchievements");
    } finally {
      this.checkTotalMilesAchievementsInProgress = false;
    }
  }

  public async checkTrailCompletionAchievements(
      user: User,
      completedHikes: Completed_Hike[],
      achievementsWithCompletion: AchievementsWithCompletion[]
  ) {
    if (this.checkTrailCompletionAchievementsInProgress) {
      console.log('Trail Completion achievement check is already in progress');
      return null;
    }
    this.checkTrailCompletionAchievementsInProgress = true;

    try {
      const unlockAchievementIds = [];
      const completedTrailIds = completedHikes.map((hike) => parseInt(hike.trailId));

      for (let achievement of achievementsWithCompletion) {
        if (
            !achievement.completed &&
            (achievement.achievement_type === 'Single Trail Completion' ||
                achievement.achievement_type === 'Group Trail Completion' ||
                achievement.achievement_type === 'Park Completion')
        ) {
          const conditionTrails: string[] = achievement.achievement_condition.split(':');
          const conditionTrailIds: number[] = conditionTrails[1]
              ? conditionTrails[1].split(',').map((id) => parseInt(id))
              : [parseInt(conditionTrails[0])];

          if (
              achievement.achievement_type === 'Single Trail Completion' &&
              completedTrailIds.includes(conditionTrailIds[0])
          ) {
            unlockAchievementIds.push({
              achievementName: achievement.achievement_name,
              achievementId: achievement.id,
            });
          }

          if (
              achievement.achievement_type === 'Group Trail Completion' &&
              conditionTrailIds.every((id) => completedTrailIds.includes(id))
          ) {
            unlockAchievementIds.push({
              achievementName: achievement.achievement_name,
              achievementId: achievement.id,
            });
          }

          if (
              achievement.achievement_type === 'Park Completion' &&
              completedTrailIds.filter((id) => conditionTrailIds.includes(id)).length >=
              parseInt(conditionTrails[0])
          ) {
            unlockAchievementIds.push({
              achievementName: achievement.achievement_name,
              achievementId: achievement.id,
            });
          }
        }
      }

      return unlockAchievementIds.length > 0
          ? await this.unlockAchievement(user, unlockAchievementIds)
          : null;
    } catch (err) {
      handleError(err, "checkTrailCompletionAchievements");
    } finally {
      this.checkTrailCompletionAchievementsInProgress = false;
    }
  }

  public async checkUserSessionAchievements(
      user: User,
      sessionDetails: SessionDetails,
      currentSessionCategory: string,
      achievementsWithCompletion: AchievementsWithCompletion[]
  ) {
    if (this.checkUserSessionAchievementsInProgress) {
      console.log('User Session achievement check is already in progress');
      return null;
    }
    this.checkUserSessionAchievementsInProgress = true;

    try {
      const unlockAchievementIds = [];

      for (let achievement of achievementsWithCompletion) {
        if (
            !achievement.completed &&
            achievement.achievement_type === 'User Session Category'
        ) {
          const [conditionAmount, conditionSessionCategory] = achievement.achievement_condition.split(':');

          if (
              conditionSessionCategory === currentSessionCategory &&
              (await user.getSessionsOfCategoryCount(
                  sessionDetails.sessionCategoryId,
                  parseInt(conditionAmount)
              )) >= parseInt(conditionAmount)
          ) {
            unlockAchievementIds.push({
              achievementName: achievement.achievement_name,
              achievementId: achievement.id,
            });
          }
        }
      }

      return unlockAchievementIds.length > 0
          ? await this.unlockAchievement(user, unlockAchievementIds)
          : null;
    } catch (err) {
      handleError(err, "checkUserSessionAchievements");
    } finally {
      this.checkUserSessionAchievementsInProgress = false;
    }
  }
}

// Export a single instance of the AchievementManager
export const achievementManagerInstance = AchievementManager.getInstance();