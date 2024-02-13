import { useDatabase } from "@nozbe/watermelondb/hooks"
import { User, User_Miles } from "../../watermelon/models";
import { AchievementsWithCompletion } from "../../types/achievements";
const AchievmentManager = 
{
  //*This function adds a row to the the users_achievmenets database, unlocking a user Achievment
  async unlockAchievement(user: User, achievement_id: string)
  {
    try
    {
      const completedAchievement = await user.unlockAchievement(achievement_id)
      return completedAchievement
    } catch (err)
    {
      console.error('Error in unlockAchievement() ', {err})
   }
  },

  //Create a function that checks for achievments about a users total miles
  async check_total_miles_achievements(userMiles: User_Miles[], achievementsWithCompletion: AchievementsWithCompletion[])
  {
    try
    {
      for (let achievement of achievementsWithCompletion)
      {
        if (!achievement.completed)
        {
           //check if user miles > achievement.conditions
         }
       }        
    } catch (err)
    {
      console.error('Error in check_total_milles_achievements', {err})
    }

  }
  //Create a function that checks for achievements about a users completed hikes
  //create a function that checks for achievements about user sessions
  //Create a function that unlocks a specific achievement

}