// //*Work Time
// const workMinutes = Math.floor(pomodoroTime! / 60);
// const workSeconds = pomodoroTime! % 60;
// const formattedPomodoroTime = `${
//   workMinutes < 10 ? '0' + workMinutes : workMinutes
// }:${workSeconds < 10 ? '0' + workSeconds : workSeconds}`;


function formatCountdown(
  timeInSeconds: number 
): string
{
  const Minutes = Math.floor(
    timeInSeconds / 60
  );
  const Seconds = timeInSeconds % 60;
  const formattedTime = `${Minutes < 10 ? '0' + Minutes : Minutes}:${
    Seconds < 10 ? '0' + Seconds : Seconds
  }`;
  return formattedTime;
}

export default formatCountdown;
