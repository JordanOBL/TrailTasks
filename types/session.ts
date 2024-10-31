import {Addon} from "../watermelon/models";
export interface SessionDetails {
  startTime: string | null;
  sessionName: string;
  sessionDescription: string;
  sessionCategoryId: null;
  completedHike: boolean;
  breakTimeReduction: number;
  minimumPace: number;
  maximumPace: number;
  paceIncreaseValue: number;
  paceIncreaseInterval: number;
  penaltyValue: number;
  increasePaceOnBreakValue: number;
  strikes: number;
  endSessionModal: boolean;
  totalTokenBonus: number
  trailTokensEarned: number;
  sessionTokensEarned: number;
  totalDistanceHiked: number;
  isLoading: boolean;
  isError: boolean;
  backpack: {
    addon: null|Addon;
    minimumTotalMiles: number;
  }[];
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
