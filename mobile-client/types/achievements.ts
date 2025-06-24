export interface AchievementsWithCompletion {
  id: string;
  achievement_name: string;
  achievement_description: string;
  achievement_image_url: string;
  achievement_type: string;
  achievement_condition: string;
  achievement_fact?: string;
  completed: boolean;
}
