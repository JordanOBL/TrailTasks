export function getBetterTime(newTime: string, currentBestTime: string): string
{
  // Convert newTime to seconds
  const [newHours, newMinutes, newSeconds] = newTime
    .split(':')
    .map(Number);
  const newTotalSeconds = newHours * 3600 + newMinutes * 60 + newSeconds;

  // Convert currentBestTime to seconds
  const [currentHours, currentMinutes, currentSeconds] = currentBestTime
    .split(':')
    .map(Number);
  const currentTotalSeconds =
    currentHours * 3600 + currentMinutes * 60 + currentSeconds;

  // Compare the times
  return newTotalSeconds < currentTotalSeconds
    ? newTime
    : currentBestTime;
}

export default getBetterTime