import {Model, Q} from '@nozbe/watermelondb';

import {
  relation,
  immutableRelation,
  children,
  field,
  text,
  writer,
  date,
  lazy,
} from '@nozbe/watermelondb/decorators';

import formatDateTime from '../helpers/formatTime';

export class Park extends Model {
  static table = 'parks';
  static associations = {
    trails: {type: 'has_many', foreignKey: 'park_id'},
    parks_states: {type: 'has_many', foreignKey: 'park_id'},
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
    users: {type: 'has_many', foreignKey: 'trail_id'},
    completed_hikes: {type: 'has_many', foreignKey: 'trail_id'},
    queued_trails: {type: 'has_many', foreignKey: 'trail_id'},
    basic_subscription_trails: {type: 'has_many', foreignKey: 'trail_id'},
  };
  //fields

  @field('trail_name') trailName;
  @field('trail_distance') trailDistance;
  @field('trail_lat') trailLat;
  @field('trail_long') trailLong;
  @field('trail_difficulty') trailDifficulty;
  @field('park_id') parkId;
  @field('trail_image_url') trailImageUrl;
  @field('all_trails_url') allTrailsUrl;
  @field('nps_url') npsUrl;
  @field('hiking_project_url') hikingProjectUrl;
  @field('trail_elevation') trailElevation;

  @relation('parks', 'park_id') park;

  ////?possibly show all uses currently hiking the trail at the time
  @children('users') users;
  @children('completed_hikes') completedHikes;
  @children('queued_trails') queuedTrails;
  @children('basic_subscription_trails') basicSubscriptionTrails;

  //Add To Hiking Queue
  @writer async addToQueuedTrails({userId}) {
    const addedHike = await this.collections
      .get('queued_trails')
      .create((hike) => {
        hike.trailId = this.id;
        hike.userId = userId;
      });
    return addedHike;
  }

  @writer async deleteFromQueuedTrails({userId}) {
    const deleteThisHike = await this.collections
      .get('queued_trails')
      .query(Q.and(Q.where('trail_id', this.id), Q.where('user_id', userId)));
    console.log('in queued Trails');
    await deleteThisHike[0].markAsDeleted();
  }
}

export class Basic_Subscription_Trail extends Model {
  static table = 'basic_subscription_trails';
  static associations = {
    trails: {type: 'belongs_to', key: 'trail_id'},
  };
  //fields
  @field('trail_id') trailId;
  @relation('trails', 'trail_id') trail;
  @children('trails') trails;
}

export class User extends Model {
  static table = 'users';
  static associations = {
    users_badges: {type: 'has_many', foreignKey: 'user_id'},
    users_achievements: {type: 'has_many', foreignKey: 'user_id'},
    users_sessions: {type: 'has_many', foreignKey: 'user_id'},
    trails: {type: 'belongs_to', key: 'trail_id'},
    completed_hikes: {type: 'has_many', foreignKey: 'user_id'},
    queued_trails: {type: 'has_many', foreignKey: 'user_id'},
    users_miles: {type: 'has_many', foreignKey: 'user_id'},
    users_subscriptions: {type: 'has_many', foreignKey: 'user_id'},
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
  @field('is_subscribed') isSubscribed;
  @date('created_at') createdAt;
  @date('updated_at') updatedAt;

  @relation('trails', 'trail_id') trail;

  @children('users_sessions') usersSessions;
  @children('users_badges') usersBadges;
  @children('users_achievements') usersAchievements;
  @children('users_miles') usersMiles;
  @children('completed_hikes') completedHikes;
  @children('queued_trails') queuedTrails;
  @children('users_subscriptions') usersSubscriptions;

  @lazy userMiles = this.usersMiles.extend(Q.where('user_id', this.id));
  @lazy userSessionsWithCategory = this.usersSessions.extend(
    Q.on('session_categories', 'id', 'session_category_id')
  );

  // getUser
  @writer async getUser() {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      username: this.username,
      email: this.email,
      id: this.id,
      password: this.password,
      push_notifications_enabled: this.pushNotificationsEnabled,
      theme_preference: this.themePreference,
      trail_id: this.trailId,
      trail_progress: this.trailProgress,
      trail_started_at: this.trailStartedAt,
      updated_at: this.updatedAt,
      created_at: this.createdAt,
    };
  }

  @writer async increaseDistanceHikedWriter({user, userMiles, userSession}) {
    await this.batch(
      user.prepareUpdate((user) => {
        user.trailProgress = (Number(user.trailProgress) + 0.01).toFixed(2);
      }),
      userMiles.prepareUpdate((userMiles) => {
        userMiles.totalMiles = (Number(userMiles.totalMiles) + 0.01).toFixed(2);
      }),
      userSession.prepareUpdate((userSession) => {
        userSession.totalDistanceHiked = (
          Number(userSession.totalDistanceHiked) + 0.01
        ).toFixed(2);
      })
    );
  }

  //update User Trail
  //miles: number
  @writer async updateTrailProgress({miles}) {
    return await this.update(() => {
      this.trailProgress = (Number(this.trailProgress) + miles).toFixed(2);
    });
  }
  //update User Trail
  @writer async updateUserTrail({trailId, trailStartedAt}) {
    return await this.update(() => {
      this.trailId = trailId;
      this.trailProgress = '0.00';
      this.trailStartedAt = trailStartedAt;
    });
  }
  //Add User`
  @writer async addUser(
    username,
    firstName,
    lastName,
    email,
    password,
    trailStartedAt
  ) {
    const newUser = await this.collections.get('users').create((user) => {
      user.username = username;
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      user.password = password;
      user.pushNotificationsEnabled = true;
      user.themePreference = 'light';
      user.trailId = '1';
      user.trailProgress = '0.0';
      user.traiStartedAt = trailStartedAt;
    });
    return newUser;
  }
  //add user miles
  @writer async addUserMile() {
    return await this.collections.get('users_miles').create((user_miles) => {
      user_miles.user_id.set(this);
      user_miles.totalMiles = '0.00';
    });
  }

  //add user achievnments Batch
  // @writer async unlockAchievements(completedAchievementIds) {
  //   const unlockedAchievements = await completedAchievementIds.map(
  //     (achievementId) =>
  //       this.collections
  //         .get('users_achievements')
  //         .prepareCreate((user_achievement) => {
  //           user_achievement.userId = this.userId;
  //           user_achievement.achievementId = achievementId;
  //         })
  //   );
  //   await this.database.batch(...unlockedAchievements);
  //   return unlockedAchievements;
  // }
  @writer async unlockAchievements(userId, completedAchievementIds) {
    try {
      console.debug('Unlocking achievements:', completedAchievementIds);
      const unlockedAchievements = await Promise.all(
        completedAchievementIds.map(async (achievementId) => {
          const newAchievement = this.collections
            .get('users_achievements')
            .prepareCreate((user_achievement) => {
              user_achievement.userId = userId;
              user_achievement.achievementId = achievementId;
              user_achievement.completedAt = formatDateTime(new Date());
            });
          return newAchievement;
        })
      );
      await this.database.batch(...unlockedAchievements);
      console.debug(
        'Successfully unlocked achievements:',
        unlockedAchievements
      );
      return unlockedAchievements;
    } catch (err) {
      console.error('Error in unlockAchievements:', err);
      throw err; // Rethrow the error to handle it at the higher level
    }
  }

  @writer async updateTotalUserMiles({miles}) {
    return await this.usersMiles.update((userMile) => {
      userMile.totalMiles = (Number(userMile.totalMiles) + miles).toFixed(2);
    });
  }
  //add User Session
  @writer async addUserSession({
    sessionName,
    sessionDescription,
    sessionCategoryId,
  }) {
    return await this.collections
      .get('users_sessions')
      .create((user_session) => {
        user_session.user_id.set(this);
        user_session.sessionName = sessionName;
        user_session.sessionDescription = sessionDescription;
        user_session.totalMilesHiked = '0.00';
        user_session.totalSessionTime = 0;
        user_session.sessionCategoryId = sessionCategoryId;
      });
  }
  //create completed_hike
  @writer async addCompletedHike({
    trailId,
    bestCompletedTime,
    firstCompletedAt,
    lastCompletedAt,
  }) {
    return await this.collections
      .get('completed_hikes')
      .create((completedHike) => {
        completedHike.userId = this.id;
        completedHike.trailId = trailId;
        completedHike.bestCompletedTime = bestCompletedTime;
        completedHike.firstCompletedAt = firstCompletedAt;
        completedHike.lastCompletedAt = lastCompletedAt;
      });
  }
  //update completed hike
  @writer async updateCompletedHike({
    completedHikeId,
    bestCompletedTime,
    lastCompletedAt,
  }) {
    const completedHike = await this.collections
      .get('completed_hikes')
      .find(completedHikeId);
    // eslint-disable-next-line no-shadow
    return await completedHike.update((completedHike) => {
      completedHike.bestCompletedTime = bestCompletedTime;
      completedHike.lastCompletedAt = lastCompletedAt;
    });
  }

  //create completed_hike
  @writer async hasTrailBeenCompleted() {
    const completedHike = await this.collections
      .get('completed_hikes')
      .query(
        Q.and(Q.where('user_id', this.id), Q.where('trail_id', this.trailId))
      );
    return completedHike[0];
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
    users_badges: {type: 'has_many', foreignKey: 'badge_id'},
  };

  @field('badge_name') badgeName;
  @field('badge_description') badgeDescription;
  @field('badge_image_url') badgeImageUrl;

  @immutableRelation('users_badges', 'badge_id') badge;

  @children('users_badges') users_badges;

  @lazy
  badgeEarners = this.collections
    .get('users')
    .query(Q.on('users_badges', 'badge_id', this.id));
}

export class Achievement extends Model {
  static table = 'achievements';
  static associations = {
    users_achievements: {type: 'has_many', foreignKey: 'achievement_id'},
  };
  @field('achievement_name') achievementName;
  @field('achievement_description') achievementDescription;
  @field('achievement_image_url') achievementImageUrl;
  @field('type') achievementType;
  @field('condition') achievementCondition;

  @immutableRelation('users_achievements', 'achievement_id') achievement;

  @children('users_achievements') usersAchievements;

  @lazy
  achievementEarners = this.collections
    .get('users')
    .query(Q.on('users_achievements', 'achievement_id', this.id));
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
  @date('created_at') createdAt;
  @date('updated_at') updatedAt;

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
  @date('created_at') createdAt;
  @date('updated_at') updatedAt;

  @immutableRelation('users', 'user_id') user;
  @immutableRelation('trails', 'trail_id') trail;

  @children('users') users;
  @children('trails') trails;

  // @lazy extendedTrail = this.trails.extend(Q.on('parks', 'park_id', 'park_id'));
}
export class Queued_Trail extends Model {
  static table = 'queued_trails';
  static associations = {
    trails: {type: 'belongs_to', key: 'trail_id'},
    users: {type: 'belongs_to', key: 'user_id'},
  };

  @field('user_id') userId;
  @field('trail_id') trailId;
  @date('created_at') createdAt;
  @date('updated_at') updatedAt;

  @relation('users', 'user_id') user;
  @relation('trails', 'trail_id') trail;

  @children('users') users;
  @children('trails') trails;

  @writer async deleteTrailFromQueue() {
    await this.markAsDeleted();
  }
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

  @writer async updateTotalMiles({miles}) {
    return await this.update(() => {
      this.totalMiles = (Number(this.totalMiles) + miles).toFixed(2);
    });
  }
}
export class User_Badge extends Model {
  static table = 'users_badges';
  static associations = {
    users: {type: 'belongs_to', key: 'user_id'},
    badges: {type: 'belongs_to', key: 'badge_id'},
  };
  @field('user_id') userId;
  @field('badge_id') badgeId;
  @date('created_at') createdAt;
  @date('updated_at') updatedAt;

  @immutableRelation('users', 'user_id') user;
  @immutableRelation('badges', 'badge_id') badge;

  @children('users') users;
  @children('badges') badges;
}

export class Session_Category extends Model {
  static table = 'session_categories';
  static associations = {
    users_sessions: {type: 'has_many', foreignKey: 'session_category_id'},
  };

  @field('session_category_name') sessionCategoryName;

  @children('users_sessions') usersSessions;
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
  @date('created_at') createdAt;
  @date('updated_at') updatedAt;

  @relation('users', 'user_id') user;
  @immutableRelation('session_categories', 'session_category_id')
  sessionCategory;

  @children('users') users;

  @writer async updateTotalDistanceHiked({miles}) {
    return await this.update(() => {
      this.totalDistanceHiked = (
        Number(this.totalDistanceHiked) + miles
      ).toFixed(2);
    });
  }

  @writer async updateTotalSessionTime() {
    return await this.update(() => {
      this.totalSessionTime = this.totalSessionTime + 1;
    });
  }
}

export class Subscription extends Model {
  static table = 'users_subscriptions';
  static associations = {
    users: {type: 'belongs_to', key: 'user_id'},
  };
  @field('user_id') userId;
  @field('is_active') isActive;
  @field('expires_at') expiresAt;
  @date('created_at') createdAt;
  @date('updated_at') updatedAt;

  @relation('users', 'user_id') user;

  @children('users') users;
}
