import {Model} from '@nozbe/watermelondb';
import {
  relation,
  immutableRelation,
  children,
  field,
  text,
} from '@nozbe/watermelondb/decorators';

export class Park extends Model {
  static table = 'parks';
  static associations = {
    trails: {type: 'belongs_to', key: 'park_id'},
    parks_states: {type: 'belongs_to', key: 'park_id'},
  };

  @field('park_name') parkName;
  @field('park_type') parkType;
  @field('park_image_url') parkImageUrl;
}

export class Trail extends Model {
  static table = 'trails';
  static associations = {
    parks: {type: 'has_many', foriegnKey: 'park_id'},
    users: {type: 'belongs_to', key: 'trail_id'},
    completed_hikes: {type: 'belongs_to', key: 'trail_id'},
  };
  //fields

  @field('trail_name') trailName;
  @field('trail_distance') trailDistance;
  @field('trail_lat') trailLat;
  @field('trail_long') trailLong;
  @field('trail_difficulty') trailDifficulty;
  @field('park_id') parkId;
  @field('trail_image_url') trailImageUrl;
  @field('trail_elevation') trailElevation;

  @immutableRelation('parks', 'park_id') park;

  @children('parks') parks;
}
export class User extends Model {
  static table = 'users';
  static associations = {
    users_badges: {type: 'belongs_to', key: 'user_id'},
    users_achievements: {type: 'belogns_to', key: 'user'},
    users_miles: {type: 'belongs_to', key: 'user'},
    trails: {type: 'has_many', foreignKey: 'current_trail_id'},
  };

  @field('user_id') userId;
  @text('username') username;
  @text('first_name') firstName;
  @text('last_name') lastName;
  @text('email') email;
  @field('password') password;
  @field('push_notifications_enabled') pushNotificationsEnabled;
  @field('theme_preference') themePreference;
  @field('current_trail_id') currentTrailId;
  @field('current_trail_Progress') currentTrailProgress;
  @field('current_trail_start_at') currentTrailStartAt;

  @relation('trails', 'current_trail_id') trail;
}

export class Park_State extends Model {
  static table = 'park_states';
  static associations = {
    parks: {type: 'has_many', foriegnKey: 'park_id'},
  };

  @field('park_id') parkId;
  @field('state_code') stateCode;
  @field('state_name') stateName;

  @immutableRelation('parks', 'park_id') park;

  @children('parks') parks;
}
export class Badge extends Model {
  static table = 'badges';
  static associations = {
    users_badges: {type: 'belongs_to', key: 'badge_id'},
  };

  @field('badge_name') badgeName;
  @field('badge_description') badgeDescription;
  @field('badge_image_url') badgeImageUrl;
}

export class Achievement extends Model {
  static table = 'achievements';
  static associations = {
    users_achievements: {type: 'belongs_to', key: 'achievement_id'},
  };
  @field('achievement_name') achievementName;
  @field('uachievement_description') achievementDescription;
  @field('achievement_image_url') AchievementImageUrl;
}
export class User_Achievement extends Model {
  static table = 'user_achievements';
  static associations = {
    achievements: {type: 'has_many', foreignKey: 'achievement_id'},
    users: {type: 'has_many', foreignKey: 'user_id'},
  };
  @field('user_id') userId;
  @field('achievement_id') achievementId;
  @field('completed_at') completedAt;

  @immutableRelation('users', 'user_id') user;
  @immutableRelation('achievements', 'achievement_id') achievement;

  @children('users') users;
}

export class Completed_Hike extends Model {
  static table = 'completed_hikes';
  static associations = {
    users: {type: 'has_many', foreignKey: 'user_id'},
    trails: {type: 'has_many', foreignKey: 'trail_id'},
  };
  @field('user_id') userId;
  @field('trail_id') trailId;
  @field('first_completed_at') firstCompletedAt;
  @field('last_completed_at') lastCompletedAt;
  @field('best_completed_time') bestCompletedTime;

  @immutableRelation('users', 'user_id') user;
  @immutableRelation('trails', 'trail_id') trail;

  @children('users') users;
  @children('trails') trails;
}
export class Hiking_Queue extends Model {
  static table = 'hiking_queue';
  static associations = {
    trails: {type: 'has_many', foreignKey: 'trail_id'},
    users: {type: 'has_many', foreignKey: 'user_id'},
  };
  @field('user_id') userId;
  @field('trail_id') trailId;
  @field('created_at') createdAt;

  @immutableRelation('users', 'user_id') user;
  @immutableRelation('trails', 'trail_id') trail;

  @children('users') users;
  @children('trails') trails;
}
export class Users_Miles extends Model {
  static table = 'users_miles';
  static associations = {
    users: {type: 'has_many', foreignKey: 'user_id'},
  };

  @field('user_id') userId;
  @field('total_miles') totalMiles;

  @immutableRelation('users', 'user_id') user;

  @children('users') users;
}
export class User_Badge extends Model {
  static table = 'users_badges';
  static associations = {
    users: {type: 'has_many', foriegnKey: 'user_id'},
    badges: {type: 'has_many', foriegnKey: 'badge_id'},
  };
  @field('user_id') userId;
  @field('badge_id') badgeId;

  @immutableRelation('users', 'user_id') user;
  @immutableRelation('badges', 'badge_id') badge;

  @children('users') users;
  @children('badges') badges;
}

export class Session_Category extends Model {
  static table = 'session_categories';
  static associations = {
    users_sessions: {type: 'belongs_to', key: 'session_category_id'},
  };

  @field('session_category_name') sessionCategoryName;
}

export class User_Session extends Model {
  static table = 'user_sessions';
  static associations = {
    users: {type: 'has_many', foriegnKey: 'user_id'},
    session_categories: {
      type: 'has_many',
      forienKey: 'session_category_id',
    },
  };

  @field('user_session_id') userSessionId;
  @field('user_id') userId;
  @text('session_name') sessionName;
  @text('session_description') sessionDescription;
  @field('session_category_id') sessionCategoryId;
  @field('date_added') dateAdded;
  @field('total_session_time') totalSessionTime;
  @field('total_distance_hiked') totalDistanceHiked;

  @immutableRelation('users', 'user_id') user;
  @immutableRelation('session_categories', 'session_category_id')
  sessionCategory;

  @children('users') users;
}
