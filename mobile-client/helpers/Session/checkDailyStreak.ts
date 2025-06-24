import {SessionDetails} from '../../types/session';
import {User} from '../../watermelon/models';
import isToday from '../isToday';
import isYesterday from '../isYesterday';


export default async function checkDailyStreak(user: User) {
  if (!user) {
    console.error('No user object available.');
    return null;
  }

  const lastDate = new Date(user.lastDailyStreakDate);
  const dailyThreshold = 300;

  // Early exit if user has already been rewarded today
  if (isToday(lastDate)) return false;

  if(!isToday(lastDate) && !isYesterday(lastDate)){
    await user.resetDailyStreak();
  }
  if(isYesterday(lastDate)){
    const totalToday = await user.getTodaysTotalSessionTime();

    if (totalToday < dailyThreshold) return false;

    // Consecutive day
    await user.increaseDailyStreak();
  }


  return true;
}

