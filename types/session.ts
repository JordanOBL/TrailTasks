export interface SessionDetails {
  startTime: string;
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
  isLoading: boolean;
  isError: boolean;
}

export interface JoinedUserTrail {
  _changed: string;
  _status: string;
  created_at: number;
  email: string;
  first_name: string;
  id: string;
  last_name: string;
  park_id: string;
  park_name: string;
  park_type: string;
  password: string;
  push_notifications_enabled: boolean;
  theme_preference: string;
  trail_difficulty: string;
  trail_distance: string;
  trail_elevation: number;
  trail_id: string;
  trail_image_url: string;
  trail_lat: string;
  trail_long: string;
  trail_name: string;
  trail_progress: string;
  trail_started_at: string;
  updated_at: number;
  username: string;
}
