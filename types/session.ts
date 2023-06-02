export interface SessionDetails {
  isSessionStarted: boolean;
  isPaused: boolean;
  sessionName: string;
  sessionDescription: string;
  sessionCategoryId: null;
  initialPomodoroTime: number;
  initialShortBreakTime: number;
  initialLongBreakTime: number;
  elapsedPomodoroTime: number;
  elapsedShortBreakTime: number;
  elapsedLongBreakTime: number;
  sets: number;
  currentSet: number;
  pace: number;
  completedHike: boolean;
  strikes: number;
  endSessionModal: boolean;
  totalSessionTime: number;
  totalDistanceHiked: number;
  trailProgress: number;
  isLoading: boolean;
  isError: boolean;
}

