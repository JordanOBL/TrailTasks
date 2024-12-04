// @ts-nocheck

import {Model, Q} from '@nozbe/watermelondb';
import {
  children,
  date,
  field,
  immutableRelation,
  lazy,
  readonly,
  relation,
  text,
  writer,
} from '@nozbe/watermelondb/decorators';

import formatDateTime from '../helpers/formatDateTime';
import handleError from '../helpers/ErrorHandler';

export class Park extends Model {
  static table = 'parks';
  static associations = {
    trails: {type: 'has_many', foreignKey: 'park_id'},
    parks_states: {type: 'has_many', foreignKey: 'park_id'},
    users_completed_parks: { type: 'has_many', foreignKey: 'park_id' }, // Link to users_parks for progress tracking
  };

  @field('park_name') parkName;
  @field('park_type') parkType;
  @field('park_image_url') parkImageUrl;

  @children('trails') trails;
  @children('users_compoleted_parks') usersCompletedParks; // Track users' progress in this park
}

export class Trail extends Model {
  static table = 'trails';
  static associations = {
    parks: {type: 'belongs_to', key: 'park_id'},
    users: {type: 'has_many', foreignKey: 'trail_id'},
    users_completed_trails: {type: 'has_many', foreignKey: 'trail_id'},
    queued_trails: {type: 'has_many', foreignKey: 'trail_id'},
    users_purchased_trails: {type: 'has_many', foreignKey: 'trail_id'},
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
  @field('is_free') isFree;
  @field('is_subscribers_only') isSubscribersOnly;
  @field('trail_of_the_week') trailOfTheWeek;

  @relation('parks', 'park_id') park;

  ////?possibly show all uses currently hiking the trail at the time
  @children('users') users;
  @children('users_completed_trails') usersCompletedTrails;
  @children('users_queued_trails') usersQueuedTrails;
  @children('users_purchased_trails') usersPurchasedTrails;

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
export class User extends Model {
  static table = 'users';
  static associations = {
    users_badges: {type: 'has_many', foreignKey: 'user_id'},
    users_achievements: {type: 'has_many', foreignKey: 'user_id'},
    users_sessions: {type: 'has_many', foreignKey: 'user_id'},
    trails: {type: 'belongs_to', key: 'trail_id'},
    users_completed_trails: {type: 'has_many', foreignKey: 'user_id'},
    users_queued_trails: {type: 'has_many', foreignKey: 'user_id'},
    users_subscriptions: {type: 'has_one', foreignKey: 'user_id'},
    users_purchased_trails: {type: 'has_many', foreignKey: 'user_id'},
    users_addons: {type: 'has_many', foreignKey: 'user_id'},
    users_completed_parks: { type: 'has_many', foreignKey: 'user_id' }, // Added for park-level tracking

  };

  @field('username') username;
  @field('first_name') firstName;
  @field('last_name') lastName;
  @field('email') email;
  @field('password') password;
  @field('daily_streak') dailyStreak;
  @date('last_daily_streak_date') lastDailyStreakDate;
  @field('push_notifications_enabled') pushNotificationsEnabled;
  @field('theme_preference') themePreference;
  @field('trail_id') trailId;
  @field('total_miles') totalMiles;
  @field('trail_progress') trailProgress;
  @field('trail_started_at') trailStartedAt;
  @field('trail_tokens') trailTokens;
  @field('is_subscribed') isSubscribed;
  @field('prestige_level') prestigeLevel;
  @readonly @date('created_at') createdAt;
  @readonly @date('updated_at') updatedAt;

  @relation('trails', 'trail_id') trail;

  @children('users_sessions') usersSessions;
  @children('users_badges') usersBadges;
  @children('users_achievements') usersAchievements;
  @children('users_completed_trails') usersCompletedTrails;
  @children('users_queued_trails') usersQueuedTrails;
  @children('users_purchased_trails') usersPurchasedTrails;
  @children('users_addons') usersAddons;
  @children('users_parks') usersParks; // Added to track user progress in parks


  @relation('users_subscriptions', 'subscription_id') userSubscription;

  @writer async purchaseTrail(trail, cost) {
    const results = await this.collections
      .get('users_purchased_trails')
      .create((purchased_trail) => {
        purchased_trail.userId = this.id;
        purchased_trail.trailId = trail.id;
        purchased_trail.purchasedAt = Date.now();
      });
    if (results) {
      await this.update(() => {
        this.trailTokens -= cost;
      });

      return true;
    }

    return null;
  }

  //create new session
  @writer async startNewSession(sessionDetails) {
    try {
      //get user addons
      const usersAddons = await this.usersAddons;

      console.debug(
        'in models startNewSession preparing to create new session'
      );
      //create a new session and get sessionID to add sessionaddons
      const newSession = this.collections
        .get('users_sessions')
        //@ts-ignore
        .prepareCreate((userSession) => {
          userSession.userId = this.id;
          userSession.sessionName = sessionDetails.sessionName;
          userSession.sessionDescription = '';
          userSession.sessionCategoryId = sessionDetails.sessionCategoryId;
          userSession.totalSessionTime = '0';
          userSession.totalDistanceHiked = '0.00';
          userSession.dateAdded = formatDateTime(new Date());
        });

      await this.batch(
        newSession,
        //create session addons
        ...sessionDetails.backpack.map((backpackAddon) => {
          if (backpackAddon.addon != null) {
            return this.collections
              .get('sessions_addons')
              .prepareCreate((sessionAddon) => {
                sessionAddon.sessionId = newSession.id;
                sessionAddon.addonId = backpackAddon.addon.id;
              });
          }
        }),
        //decrement users used addon
        ...usersAddons.map((backpackAddon) => {
          return backpackAddon.prepareUpdate((userAddon) => {
            userAddon.quantity = backpackAddon.quantity - 1;
          });
        })
      );
      usersAddons.forEach(async (backpackAddon) => {
        if (backpackAddon != null && backpackAddon.quantity - 1 <= 0) {
          return await backpackAddon.markAsDeleted();
        }
      });

      return {newSession, status: true};
    } catch (e) {
      handleError(e, 'Error user.startNewSession()');
      return {data: null, status: false};
    }
  }

  @writer async getTodaysTotalSessionTime() {
    const query = `SELECT SUM(total_session_time) AS total_time_today
FROM users_sessions
WHERE DATE(date_added) = DATE('now', 'localtime') AND user_id  = ?;
`;
    const totalTimeToday = await this.collections
      .get('users_sessions')
      .query(Q.unsafeSqlQuery(query, [this.id]))
      .unsafeFetchRaw();

    return totalTimeToday[0].total_time_today;
  }

  @lazy userSessionsWithCategory = this.usersSessions.extend(
    Q.on('session_categories', 'id', 'session_category_id')
  );
  @writer async getUserSessionsByCategoryCount(categoryId) {
    const userSessions = await this.collections
      .get('users_sessions')
      .query(Q.where('session_category_id', categoryId));
    return userSessions.length;
  }

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

  @writer async increaseDailyStreak() {
    //const subscription = await this.userSubscription;
    //only subscribers get daily streak reward
    // if (subscription.isActive) {
    return await this.update(() => {
      this.dailyStreak += 1;
      this.lastDailyStreakDate = new Date();
      this.trailTokens += 5;
    });
    // } else {
    //   return await this.update(() => {
    //     this.dailyStreak += 1;
    //     this.lastDailyStreakDate = new Date();
    //   });
  }

  @writer async resetDailyStreak() {
    return await this.update(() => {
      this.dailyStreak = 0;
    });
  }

  @writer async increaseDistanceHikedWriter({
    user,
    userSession,
    sessionDetails,
  }) {
    await this.batch(
      user.prepareUpdate((updatedUser) => {
        updatedUser.trailProgress = (Number(user.trailProgress) + 0.01).toFixed(
          2
        );
        updatedUser.totalMiles = (Number(user.totalMiles) + 0.01).toFixed(2);
      }),

      userSession.prepareUpdate((userSession) => {
        userSession.totalDistanceHiked = (
          Number(userSession.totalDistanceHiked) + 0.01
        ).toFixed(2);
        //new totalsessiontime = current time minus start time
        userSession.totalSessionTime = Math.floor(
          (new Date().getTime() -
            new Date(sessionDetails.startTime).getTime()) /
            1000
        );
      })
      //userSession.totalFocusTime = userSession.initialPomodoroTime * (( userSession.currentSet - 1  ) + timer.time)
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
    await this.update(() => {
      this.trailId = trailId;
      this.trailProgress = '0.00';
      this.trailStartedAt = trailStartedAt;
    });
    return;
  }

  @writer async awardFinalSessionTokens(reward) {
    try {
      await this.update((user) => {
        user.trailTokens += reward;
      });
      console.log('user Rewarded for session:', reward);
    } catch (e) {
      console.error(e);
    }
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
      user.dailyStreak = 0;
      user.lastDailyStreakDate = new Date();
      user.trailProgress = '0.00';
      user.traiStartedAt = trailStartedAt;
      user.trailTokens = 20;
      user.totalMiles = '0.00';
      user.prestigeLevel = 0;
    });
    console.debug('Watermelon User Model', newUser[0]);
    return newUser[0];
  }

  @writer async addUserSubscription() {
    const subscription = await this.collections
      .get('users_subscriptions')
      .create((user_subscription) => {
        //@ts-ignore
        user_subscription.userId = this.id;
        //@ts-ignore
        user_subscription.isActive = false;
        user_subscription.expiresAt = formatDateTime(new Date());
      });

    return subscription[0];
  }

  @writer async buyAddon(addon) {
    console.debug('buyAddon', addon.id);
    try {
      const userHasAddon = await this.usersAddons.extend(
        Q.where('addon_id', addon.id)
      );
      console.debug('userHasAddon', userHasAddon);
      if (userHasAddon.length == 0) {
        console.debug('user doenst have addon', userHasAddon);
        const userAddon = await this.collections
          .get('users_addons')
          .create((user_addon) => {
            console.debug('user id', this.id);
            user_addon.userId = this.id;
            user_addon.addonId = addon.id;
            user_addon.quantity = 1;
          });
        console.debug('new userAddon', userAddon);
      } else {
        console.debug('user has addon', userHasAddon);
      }
      console.log('user tokens', this.trailTokens);
      await this.update((user) => {
        user.trailTokens = this.trailTokens - addon.price;
      });
    } catch (err) {
      console.error('Error in buyAddon:', err);
      throw err; // Rethrow the error to handle it at the higher level
    }
  }

  @writer async unlockAchievements(userId, completedAchievements) {
    try {
      const unlockedAchievements = await Promise.all(
        //create user_achievment of all newly unlocked achievements
        completedAchievements.map(async (achievement) => {
          const newUserAchievement = this.collections
            .get('users_achievements')
            .prepareCreate((user_achievement) => {
              user_achievement.userId = userId;
              user_achievement.achievementId = achievement.achievementId;
              user_achievement.completedAt = formatDateTime(new Date());
            });
          if (newUserAchievement) {
            return newUserAchievement;
          }
          throw new Error(
            'Failed to prepare create new user achievement in unlocckAchievements writer'
          );
        })
      );

      await this.database.batch(unlockedAchievements);
      //returns {AcihevementName: string, achievementId: string}
      return completedAchievements;
    } catch (err) {
      console.error('Error in unlockAchievements:', err);
      throw err; // Rethrow the error to handle it at the higher level
    }
  }

  @writer async updateTotalUserMiles({miles}) {
    return await this.update((user) => {
      user.totalMiles = (Number(this.totalMiles) + miles).toFixed(2);
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
        user_session.userId = this.id;
        user_session.sessionName = sessionName;
        user_session.sessionDescription = sessionDescription;
        user_session.totalMilesHiked = '0.00';
        user_session.totalSessionTime = 0;
        user_session.sessionCategoryId = sessionCategoryId;
      });
  }
  //return number o sessions with category Id, only return enough to achieve
  //achievement condition
  @writer async getSessionsOfCategoryCount(categoryId, categoryCount) {
    const results = await this.collections
      .get('users_sessions')
      .query(
        Q.and(
          Q.where('user_id', this.id),
          Q.where('session_category_id', Q.eq(categoryId))
        ),
        Q.take(categoryCount)
      );
    console.debug('results of getSessionCategoryCount: ', results);
    return results.length;
  }
  //create completed_Trail
  @writer async addCompletedTrail({
    trailId,
    bestCompletedTime,
    firstCompletedAt,
    lastCompletedAt,
  }) {
    return await this.collections
      .get('users_completed_trails')
      .create((completedTrail) => {
        completedTrail.userId = this.id;
        completedTrail.trailId = trailId;
        completedTrail.bestCompletedTime = bestCompletedTime;
        completedTrail.firstCompletedAt = firstCompletedAt;
        completedTrail.lastCompletedAt = lastCompletedAt;
        completedTrail.completionCount = 1;
      });
  }
  //update completed hike
  @writer async updateCompletedTrail({
    completedTrailId,
    bestCompletedTime,
    lastCompletedAt,
  }) {
    const completedTrail = await this.collections
      .get('users_completed_trails')
      .find(completedTrailId);
    // eslint-disable-next-line no-shadow
    return await completedTrail.update((completedTrail) => {
      completedTrail.bestCompletedTime = bestCompletedTime;
      completedTrail.lastCompletedAt = lastCompletedAt;
      completedTrail.completionCount += 1;
    });
  }

  //create completed_hike
  @writer async hasTrailBeenCompleted(userId, trailId) {
    const completedTrail = await this.collections
      .get('users_completed_trails')
      .query(Q.and(Q.where('user_id', userId), Q.where('trail_id', trailId)));
    return completedTrail[0];
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
    parks: {type: 'belongs_to', foreignKey: 'park_id'},

  };
  @field('badge_type') badgeType;
  @field('badge_name') badgeName;
  @field('park_id') parkId;
  @field('badge_description') badgeDescription;
  @field('badge_image_url') badgeImageUrl;

  @immutableRelation('users_badges', 'badge_id') userBadge;
  @immutableRelation('park', 'park_id') park;

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
  @field('fact') achievementFact;

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

export class User_Purchased_Trail extends Model {
  static table = 'users_purchased_trails';
  static associations = {
    trails: {type: 'belongs_to', key: 'trail_id'},
    users: {type: 'belongs_to', key: 'user_id'},
  };
  @field('user_id') userId;
  @field('trail_id') trailId;
  @field('purchased_at') purchasedAt;
  @date('created_at') createdAt;
  @date('updated_at') updatedAt;

  @immutableRelation('users', 'user_id') user;
  @immutableRelation('trails', 'trail_id') trail;

  @children('users') users;
  @children('trails') trails;
}

export class User_Completed_Trail extends Model {
  static table = 'users_completed_trails';
  static associations = {
    users: {type: 'belongs_to', key: 'user_id'},
    trails: {type: 'belongs_to', key: 'trail_id'},
  };

  @field('user_id') userId;
  @field('trail_id') trailId;
  @field('first_completed_at') firstCompletedAt;
  @field('last_completed_at') lastCompletedAt;
  @field('best_completed_time') bestCompletedTime;
  @field('completion_count') completionCount;
  @date('created_at') createdAt;
  @date('updated_at') updatedAt;

  @immutableRelation('users', 'user_id') user;
  @immutableRelation('trails', 'trail_id') trail;

  @children('users') users;
  @children('trails') trails;

  // @lazy extendedTrail = this.trails.extend(Q.on('parks', 'park_id', 'park_id'));
}
export class User_Queued_Trail extends Model {
  static table = 'users_queued_trails';
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

export class User_Badge extends Model {
  static table = 'users_badges';
  static associations = {
    users: {type: 'belongs_to', key: 'user_id'},
    badges: {type: 'belongs_to', key: 'badge_id'},
  };
  @field('user_id') userId;
  @field('badge_id') badgeId;
  @field('completion_count') completionCount;
  @field('is_completed') isCompleted;
  @field('last_redeemed') lastRedeemed;
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

// @ts-ignore
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

// @ts-ignore
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

// @ts-ignore
export class Addon extends Model {
  static table = 'addons';
  static associations = {
    users_addons: {type: 'has_many', foreignKey: 'addon_id'},
    sessions_addons: {type: 'has_many', foreignKey: 'addon_id'},
  };

  @field('name') name;
  @field('description') description;
  @field('level') level;
  @field('price') price;
  @field('image_url') imageUrl;
  @field('required_total_miles') requiredTotalMiles;
  @field('effect_type') effectType;
  @field('effect_value') effectValue;
  @readonly @date('created_at') createdAt;
  @readonly @date('updated_at') updatedAt;
}

// @ts-ignore
export class User_Addon extends Model {
  static table = 'users_addons';
  static associations = {
    users: {type: 'belongs_to', key: 'user_id'},
    addons: {type: 'belongs_to', key: 'addon_id'},
  };

  @field('user_id') userId;
  @field('addon_id') addonId;
  @field('quantity') quantity;
  @readonly @date('created_at') createdAt;
  @readonly @date('updated_at') updatedAt;

  @relation('users', 'user_id') user;
  @relation('addons', 'addon_id') addon; //relation('addons', 'addon_id') addon;
}
// @ts-ignore
export class Session_Addon extends Model {
  static table = 'sessions_addons';
  static associations = {
    users_sessions: {type: 'belongs_to', key: 'session_id'},
    addons: {type: 'belongs_to', key: 'addon_id'},
  };

  @field('session_id') sessionId: any;
  @field('addon_id') addonId: any;
  @date('created_at') createdAt;
  @date('updated_at') updatedAt;

  @relation('users_sessions', 'session_id') userSession;
  @relation('addons', 'addon_id') addon; //relation('addons', 'addon_id') addon;
}

export class User_Completed_Park extends Model {
  static table = 'users_completed_parks';
  static associations = {
    parks: { type: 'belongs_to', foreignKey: 'park_id' }, // Links to specific parks
    users: { type: 'belongs_to', foreignKey: 'user_id' }, // Links to specific users
    badges: { type: 'belongs_to', foreignKey: 'badge_id' }, // Links to badges earned
  };

  @field('park_id') parkId;
  @field('user_id') userId;
  @field('park_level') parkLevel; // Tracks lifetime park completions
  @field('is_rewards_redeemed') isRewardsRedeemed; // Tracks reward redemption status
  @field('completion_count') completionCount; // Tracks park completions
  @field('last_completed') lastCompleted; // Timestamp of the last park completion

  @immutableRelation('parks', 'park_id') park;
  @immutableRelation('badges', 'badge_id') badge;
}

