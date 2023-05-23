import {Model} from '@nozbe/watermelondb';
import {
  relation,
  immutableRelation,
  children,
  field,
  text,
  writer,
  date,
  readonly,
} from '@nozbe/watermelondb/decorators';

export class Park extends Model {
  static table = 'parks';
  static associations = {
    trails: {type: 'has_many', foriegnKey: 'park_id'},
    parks_states: {type: 'has_many', foriegnKey: 'park_id'},
  };

  @field('park_name') parkName;
  @field('park_type') parkType;
  @field('park_image_url') parkImageUrl;

  @children('trails') trails;
}

export class Trail extends Model {
  static table = 'trails';
  static associations = {
    parks: {type: 'belongs_to', key: 'park_id'},
    users: {type: 'has_many', foriegnKey: 'trail_id'},
    completed_hikes: {type: 'has_many', foriegnkey: 'trail_id'},
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

  @relation('parks', 'park_id') park;
  //@immutableRelation('parks', 'park_id') park;
  @children('users') users;
}
export class User extends Model {
  static table = 'users';
  static associations = {
    users_badges: {type: 'has_many', foriegnKey: 'user_id'},
    users_achievements: {type: 'has_many', foriegnKey: 'user_id'},
    users_miles: {type: 'has_many', key: 'user_id'},
    trails: {type: 'belongs_to', key: 'trail_id'},
  };

  @field('username') username;
  @field('first_name') firstName;
  @field('last_name') lastName;
  @field('email') email;
  @field('password') password;
  @field('push_notifications_enabled') pushNotificationsEnabled;
  @field('theme_preference') themePreference;
  @field('trail_id') trailId;
  @field('trail_progress') trailProgress;
  @field('trail_started_at') trailStartedAt;
  @date('created_at') createdAt;
  @date('updated_at') updatedAt;

  @relation('trails', 'trail_id') trail;

  @children('users_sessions') users_sessions;
  @children('users_badges') users_badges;
  @children('users_achievements') users_achievements;
  @children('users_miles') users_miles;

  @writer async addUser(
    username,
    first_name,
    last_name,
    email,
    password,
    push_notifications_enabled,
    theme_preference,
    trail_id,
    trail_progress,
    trail_started_at
  ) {
    const newUser = await this.collections.get('users').create((user) => {
      user.username = username;
      user.first_name.set(first_name);
      user.last_name.set(last_name);
      user.email.set(email);
      user.password.set(password);
      user.push_notifications_enabled.set(true);
      user.theme_preference.set('light');
      user.trail_id.set('1');
      user.trail_progress.set('0.0');
      user.trail_started_at.set(trail_started_at);
    });
    return newUser;
  }
}

export class Park_State extends Model {
  static table = 'park_states';
  static associations = {
    parks: {type: 'belongs_to', key: 'park_id'},
  };

  @field('park_id') parkId;
  @field('state_code') stateCode;
  @field('state_name') stateName;

  @immutableRelation('parks', 'park_id') park;
}
export class Badge extends Model {
  static table = 'badges';
  static associations = {
    users_badges: {type: 'has_many', foriegnKey: 'badge_id'},
  };

  @field('badge_name') badgeName;
  @field('badge_description') badgeDescription;
  @field('badge_image_url') badgeImageUrl;

  @immutableRelation('users_badges', 'badge_id') badge;

  @children('users_badges') users_badges;
}

export class Achievement extends Model {
  static table = 'achievements';
  static associations = {
    users_achievements: {type: 'has_many', foriegnKey: 'achievement_id'},
  };
  @field('achievement_name') achievementName;
  @field('achievement_description') achievementDescription;
  @field('achievement_image_url') AchievementImageUrl;

  @immutableRelation('users_achievements', 'achievement_id') achievement;

  @children('users_achievements') users_achievements;
}
export class User_Achievement extends Model {
  static table = 'users_achievements';
  static associations = {
    achievements: {type: 'belongs_to', key: 'achievement_id'},
    users: {type: 'belongs_to', key: 'user_id'},
  };
  @field('user_id') userId;
  @field('achievement_id') achievementId;
  @field('completed_at') completedAt;

  @immutableRelation('users', 'user_id') user;
  @immutableRelation('achievements', 'achievement_id') achievement;

  @children('users') users;
  @children('achievements') achievements;
}

export class Completed_Hike extends Model {
  static table = 'completed_hikes';
  static associations = {
    users: {type: 'belongs_to', key: 'user_id'},
    trails: {type: 'belongs_to', key: 'trail_id'},
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
    trails: {type: 'belongs_to', key: 'trail_id'},
    users: {type: 'belongs_to', key: 'user_id'},
  };

  @field('user_id') userId;
  @field('trail_id') trailId;
  @field('created_at') createdAt;

  @immutableRelation('users', 'user_id') user;
  @immutableRelation('trails', 'trail_id') trail;

  @children('users') users;
  @children('trails') trails;
}
export class User_Miles extends Model {
  static table = 'users_miles';
  static associations = {
    users: {type: 'belongs_to', key: 'user_id'},
  };

  @field('user_id') userId;
  @field('total_miles') totalMiles;
  @date('created_at') createdAt;
  @date('updated_at') updatedAt;

  @immutableRelation('users', 'user_id') user;

  @children('users') users;
}
export class User_Badge extends Model {
  static table = 'users_badges';
  static associations = {
    users: {type: 'belongs_to', key: 'user_id'},
    badges: {type: 'belongs_to', key: 'badge_id'},
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

  @children('users_sessions') user_sessions;
}

export class User_Session extends Model {
  static table = 'users_sessions';
  static associations = {
    users: {type: 'belongs_to', key: 'user_id'},
    session_categories: {
      type: 'belongs_to',
      key: 'session_category_id',
    },
  };

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
