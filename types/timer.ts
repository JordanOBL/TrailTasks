type Timer = {
  startTime: string | null;
  isCompleted: boolean;
  time: number;
  isRunning: boolean;
  isBreak: boolean; 
  isPaused: boolean;
  focusTime: number,
  shortBreakTime: number,
  longBreakTime: number,
  sets: number,
  completedSets: number,
  pace: number,
  autoContinue: boolean,
  elapsedTime: number
}

export default Timer
