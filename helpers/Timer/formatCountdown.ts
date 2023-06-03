// //*Work Time
// const workMinutes = Math.floor(pomodoroTime! / 60);
// const workSeconds = pomodoroTime! % 60;
// const formattedPomodoroTime = `${
//   workMinutes < 10 ? '0' + workMinutes : workMinutes
// }:${workSeconds < 10 ? '0' + workSeconds : workSeconds}`;
// //*ShortBreak Time
// const breakMinutes = Math.floor(shortBreakTime / 60);
// const breakSeconds = shortBreakTime % 60;
// const formattedShortBreakTime = `${
//   breakMinutes < 10 ? '0' + breakMinutes : breakMinutes
// }:${breakSeconds < 10 ? '0' + breakSeconds : breakSeconds}`;
// //*LongBreak Time
// const longbreakMinutes = Math.floor(longBreakTime / 60);
// const longbreakSeconds = longBreakTime % 60;
// const formattedLongBreakTime = `${
//   longbreakMinutes < 10 ? '0' + longbreakMinutes : longbreakMinutes
// }:${longbreakSeconds < 10 ? '0' + longbreakSeconds : longbreakSeconds}`;

function formatCountdown(
  initialTimeInSeconds: number,
  elapsedTimeInSeconds: number
): string
{
  const Minutes = Math.floor(
    (initialTimeInSeconds - elapsedTimeInSeconds) / 60
  );
  const Seconds = (initialTimeInSeconds - elapsedTimeInSeconds) % 60;
  const formattedTime = `${Minutes < 10 ? '0' + Minutes : Minutes}:${
    Seconds < 10 ? '0' + Seconds : Seconds
  }`;
  return formattedTime;
}

export default formatCountdown;