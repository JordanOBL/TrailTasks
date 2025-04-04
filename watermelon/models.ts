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
    users_parks: { type: 'has_many', foreignKey: 'park_id' }, // Link to users_parks for progress tracking
  };

  @field('park_name') parkName;
  @field('park_type') parkType;
  @field('park_image_url') parkImageUrl;

  @children('trails') trails;
  @children('users_parks') usersParks; // Track users' progress in this park
}

export class Trail extends Model {
  static table = 'trails';
  static associations = {
    parks: {type: 'belongs_to', key: 'park_id'},
    users: {type: 'has_many', foreignKey: 'trail_id'},
    users_completed_trails: {type: 'has_many', foreignKey: 'trail_id'},
    users_queued_trails: {type: 'has_many', foreignKey: 'trail_id'},
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
      .get('users_queued_trails')
      .create((hike) => {
        hike.trailId = this.id;
        hike.userId = userId;
      });
    return addedHike;
  }

  @writer async deleteFromQueuedTrails({userId}) {
    const deleteThisHike = await this.collections
      .get('users_queued_trails')
      .query(Q.and(Q.where('trail_id', this.id), Q.where('user_id', userId)));
    console.log('in queued Trails');
    await deleteThisHike[0].markAsDeleted();
  }
}
export class User extends Model {
  static table = 'users';
  static associations = {
    users_achievements: {type: 'has_many', foreignKey: 'user_id'},
    users_sessions: {type: 'has_many', foreignKey: 'user_id'},
    trails: {type: 'belongs_to', key: 'trail_id'},
    users_completed_trails: {type: 'has_many', foreignKey: 'user_id'},
    users_queued_trails: {type: 'has_many', foreignKey: 'user_id'},
    //users_subscriptions: {type: 'has_one', foreignKey: 'user_id'},
    users_purchased_trails: {type: 'has_many', foreignKey: 'user_id'},
    users_addons: {type: 'has_many', foreignKey: 'user_id'},
    users_parks: {type: 'has_many', foreignKey: 'user_id'}, // Added for park-level tracking

  };

  @field('username') username;
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
  @children('users_achievements') usersAchievements;
  @children('users_completed_trails') usersCompletedTrails;
  @children('users_queued_trails') usersQueuedTrails;
  @children('users_purchased_trails') usersPurchasedTrails;
  @children('users_addons') usersAddons;
  @children('users_parks') usersParks; // Added to track user progress in parks


  //@relation('users_subscriptions', 'subscription_id') userSubscription;

  @writer
  async purchaseTrail(trail, cost) {
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

  prepareConsumeUserAddons(record){
    if(record.quantity > 1){
      return record.prepareUpdate((addon) => {
        addon.quantity -= 1;
      });
    }else{
      return record.prepareMarkAsDeleted();
    }
  }

  //create new session
  @writer
  async startNewSession(sessionDetails) {
    try {

      const newSession = this.collections
      .get('users_sessions')
      .prepareCreate((userSession) => {
        userSession.userId = this.id
        userSession.sessionName = sessionDetails.sessionName
        userSession.sessionDescription = sessionDetails.sessionDescription || ''
        userSession.sessionCategoryId = sessionDetails.sessionCategoryId
        userSession.totalSessionTime = '0'
        userSession.totalDistanceHiked = '0.00'
        userSession.dateAdded = formatDateTime(new Date())
      })

      const sessionAddonsPrepares = []
      const consumePrepares = []

      for (const slot of sessionDetails.backpack) {
        if (!slot.addon) continue

        // create a session_addons record
        const sessionAddonPrepared = this.collections
        .get('sessions_addons')
        .prepareCreate((sa) => {
          sa.sessionId = newSession.id
          sa.addonId = slot.addon.id
        })
        sessionAddonsPrepares.push(sessionAddonPrepared)

        const [addonRecord] = await this.usersAddons.extend(Q.where('addon_id', slot.addon.id))

        if (!addonRecord) {
          // handle "user doesn't actually have this addon"? 
          // or skip, or throw an error
          continue
        }

        const consumePrepared = this.prepareConsumeUserAddons(addonRecord)
        consumePrepares.push(consumePrepared)
      }

      // 3) batch everything
      await this.batch(newSession, ...sessionAddonsPrepares, ...consumePrepares)

      return { newSession, status: true }    
    } catch (e) {
      handleError(e, 'Error user.startNewSession()')
      return { data: null, status: false }
    }
  }


  @writer
  async getTodaysTotalSessionTime() {
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

  @writer
  async getUserSessionsByCategoryCount(categoryId) {
    const userSessions = await this.collections
        .get('users_sessions')
        .query(Q.where('session_category_id', categoryId));
    return userSessions.length;
  }

  // getUser
  @writer
  async getUser() {
    return {
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

  @writer
  async increaseDailyStreak() {
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

  @writer
  async resetDailyStreak() {
    return await this.update(() => {
      this.dailyStreak = 0;
    });
  }

  @writer
  async increaseDistanceHikedWriter({
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
  @writer
  async updateTrailProgress({miles}) {
    return await this.update(() => {
      this.trailProgress = (Number(this.trailProgress) + miles).toFixed(2);
    });
  }

  //update User Trail
  @writer
  async updateUserTrail({trailId, trailStartedAt}) {
    await this.update(() => {
      this.trailId = trailId;
      this.trailProgress = '0.00';
      this.trailStartedAt = trailStartedAt;
    });
    return;
  }

  @writer
  async awardFinalSessionTokens(reward) {
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
  @writer
  async addUser(
      username,
      email,
      password,
      trailStartedAt
  ) {
    const newUser = await this.collections.get('users').create((user) => {
      user.username = username;
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

//  @writer
//  async addUserSubscription() {
//    const subscription = await this.collections
//        .get('users_subscriptions')
//        .create((user_subscription) => {
//          //@ts-ignore
//          user_subscription.userId = this.id;
//          //@ts-ignore
//          user_subscription.isActive = false;
//          user_subscription.expiresAt = formatDateTime(new Date());
//        });
//
//    return subscription[0];
//  }

@writer
async buyAddon(addOn) {
  try {
    // 1. Check if user has enough miles:
    //    They need to have *at least* addOn.requiredTotalMiles.
    //    If user.totalMiles < requiredTotalMiles, they don't qualify.
    if (this.totalMiles < addOn.requiredTotalMiles) {
      throw new Error(`You must have at least ${addOn.requiredTotalMiles} miles to purchase ${addOn.name}`);
    }

    // 2. Check if user has enough tokens:
    //    Similarly, they need at least addOn.price tokens.
    //    If user.trailTokens < price, they cannot buy.
    if (this.trailTokens < addOn.price) {
      throw new Error(`You must have at least ${addOn.price} tokens to purchase ${addOn.name}`);
    }

    // 3. Prepare updates/transactions:
    //    Check if the user already has this addon in user_addons.
    const [existingAddon] = await this.usersAddons.extend(
      Q.where('addon_id', addOn.id)
    );

    let transaction;
    if (!existingAddon) {
      // If user doesn't have this addon, create a new record with quantity = 1
      transaction = this.collections
        .get('users_addons')
        .prepareCreate((userAddon) => {
          userAddon.userId = this.id;
          userAddon.addonId = addOn.id;
          userAddon.quantity = 1;
        });
    } else {
      // If user already has this addon, increment the quantity
      transaction = existingAddon.prepareUpdate((userAddon) => {
        userAddon.quantity += 1;
      });
    }

    // 4. Execute the DB updates in a single batch:
    //    a) Create/Update the user's_addons entry
    //    b) Deduct the tokens from the user
    await this.database.batch(
      transaction,
      this.prepareUpdate((user) => {
        user.trailTokens = this.trailTokens - addOn.price;
      })
    );

    // 5. Notify success
    return `You purchased ${addOn.name}`
  } catch (err) {
    console.error("Error in buyAddon:", err);
    // Rethrow to handle it at a higher level if needed
    throw err;
  }
}
@writer
  async unlockAchievements(userId, completedAchievements) {
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

  @writer
  async updateTotalUserMiles({miles}) {
    return await this.update((user) => {
      user.totalMiles = (Number(this.totalMiles) + miles).toFixed(2);
    });
  }

  //add User Session
  @writer
  async addUserSession({
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
  @writer
  async getSessionsOfCategoryCount(categoryId, categoryCount) {
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
  @writer
  async addCompletedTrail({
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
  @writer
  async updateCompletedTrail({
                               completedTrailId,
                               bestCompletedTime,
                               lastCompletedAt,
                             }) {
    const completedTrail = await this.collections
        .get('users_completed_trails')
        .find(completedTrailId);
    // eslint-disable-next-line no-shadow
    return await completedTrail.update((existingTrail) => {
      existingTrail.bestCompletedTime = bestCompletedTime;
      existingTrail.lastCompletedAt = lastCompletedAt;
      existingTrail.completionCount += 1;
    });
  }

  //create completed_hike
  @writer
  async hasTrailBeenCompleted(userId, trailId) {
    const completedTrail = await this.collections
        .get('users_completed_trails')
        .query(Q.and(Q.where('user_id', userId), Q.where('trail_id', trailId)));
    return completedTrail[0];
  }

  @writer
  async redeemParkPass(parkId) {
    const reward = ( this.prestigeLevel * 100 ) + 200;
    let newUserPark
    const userParkPass = await this.collections
        .get('users_parks')
        .query(Q.and(Q.where('user_id', this.id), Q.where('park_id', parkId)))
        .fetch();

    // If park pass does not exist, create it
    if (userParkPass.length === 0) {
      newUserPark = this.collections.get('users_parks').prepareCreate((parkPass) => {
        parkPass.userId = this.id;
        parkPass.parkId = parkId;
        parkPass.lastCompleted = new Date().toISOString();
        parkPass.parkLevel = 1;
        parkPass.isRewardRedeemed = true;
      });

    } else if (this.prestigeLevel === existingPass.parkLevel) {
      const existingPass = userParkPass[0];
      console.log('existingPass:', existingPass);
       newUserPark = existingPass.prepareUpdate((pass) => {
          pass.parkLevel += 1;
          pass.lastCompleted = new Date().toISOString();
          pass.isRewardRedeemed = true;
        })
    }
  await this.database.batch(
      this.prepareUpdate((user) => {
        user.trailTokens += reward;
      }),
      newUserPark,
    )

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

//// @ts-ignore
//export class Subscription extends Model {
//  static table = 'users_subscriptions';
//  static associations = {
//    users: {type: 'belongs_to', key: 'user_id'},
//  };
//  @field('user_id') userId;
//  @field('is_active') isActive;
//  @field('expires_at') expiresAt;
//  @date('created_at') createdAt;
//  @date('updated_at') updatedAt;
//
//  @relation('users', 'user_id') user;
//
//  @children('users') users;
//}

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

export class User_Park extends Model {
  static table = 'users_parks';
  static associations = {
    parks: { type: 'belongs_to', foreignKey: 'park_id' }, // Links to specific parks
    users: { type: 'belongs_to', foreignKey: 'user_id' }, // Links to specific users
    //badges: { type: 'belongs_to', foreignKey: 'badge_id' }, // Links to badges earned
  };

  @field('park_id') parkId;
  @field('user_id') userId;
  @field('park_level') parkLevel; // Tracks lifetime park completions
  @field('is_reward_redeemed') isRewardRedeemed; // Tracks reward redemption status
  @field('last_completed') lastCompleted; // Timestamp of the last park completion

  @immutableRelation('parks', 'park_id') park;
  //@immutableRelation('badges', 'badge_id') badge;
}

