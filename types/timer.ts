
type Timer = {
  startTime: string | null;
  isCompleted: boolean;
  time: number;
  isRunning: boolean;
  isBreak: boolean; 
  isPaused: boolean;
  initialPomodoroTime: number,
  initialShortBreakTime: number,
  initialLongBreakTime: number,
  sets: number,
  completedSets: number,
  pace: number,
  autoContinue: boolean

}

export default Timer
