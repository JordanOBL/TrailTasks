import {SessionDetails} from '../../types/session';
import {User} from '../../watermelon/models';
import isToday from '../isToday';
import isYesterday from '../isYesterday';

async function checkDailyStreak(userPromise: Promise<User>, sessionDetails: SessionDetails) {
  // Wait for the user object to be resolved
  const user = await userPromise;

  // Ensure that the user object is valid
  if (!user) {
    console.error('No user object available.');
    return null; // Return early if user is null
  }

  const results = new Date(user.lastDailyStreakDate);
  console.log(user.lastDailyStreakDate);
  console.debug('isToday', isToday(user.lastDailyStreakDate));

  // Check if today's date matches the last daily streak date
  if (isToday(user.lastDailyStreakDate)) {
    return null; // Return early if the daily streak is already updated for today
  }

  const dailyStreakCondition = 300;
  console.debug({ sessionDetails });

  // Check if the session's total duration meets the daily streak condition
  if (sessionDetails.totalSessionTime >= dailyStreakCondition) {
    return await user.increaseDailyStreak();
  } else {
    // Check if the total session time for today meets the daily streak condition
    const todaysTotalSessionTime = await user.getTodaysTotalSessionTime();
    if (todaysTotalSessionTime >= dailyStreakCondition) {
      return await user.increaseDailyStreak();
    }
  }

  return null;
}

export default checkDailyStreak;