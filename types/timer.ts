
type Timer = {
  startTime: string | null;
  time: number;
  isRunning: boolean;
  isBreak: boolean; 
  isPaused: boolean;
  initialPomodoroTime: number,
  initialShortBreakTime: number,
  initialLongBreakTime: number,
  sets: number,
  currentSet: number,
  pace: number,

}

export default Timer
