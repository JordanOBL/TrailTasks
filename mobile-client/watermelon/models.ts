// @ts-nocheck
import type { ParkRewardCommittedPayload, SessionRewardsPersistedPayload } from "../EventBus/EventBus";
import { Model, Q } from "@nozbe/watermelondb";
import { isSupportedSessionAddon, validateAddonFamilies } from "../helpers/Addons/sessionBackpack";
import {
  children,
  date,
  field,
  immutableRelation,
  lazy,
  reader,
  relation,
  text,
  writer,
} from "@nozbe/watermelondb/decorators";

import { Session } from "inspector/promises";
import { SessionCfg } from "../types/session";
import formatDateTime from "../helpers/formatDateTime";
import getBetterTime from "../helpers/Timer/getBetterTime";
import getTimeDifference from "../helpers/Timer/getTimeDifference";
import handleError from "../helpers/ErrorHandler";
import { write } from "fs";

const DAILY_STREAK_THRESHOLD_SECONDS = 300;
const DAILY_STREAK_TOKEN_REWARD = 15;
const TOKEN_RULE_VERSION = "mvp-v1";

function tokenMetadata(metadata: Record<string, unknown> = {}) {
  return JSON.stringify(metadata);
}

/** Watermelon 0.27 optimistically mutates cached raws before adapter.batch.
 * Restore only records owned by this writer when an atomic SQLite batch rejects;
 * otherwise a retry would apply XP twice or retain an uncommitted active Wild.
 * No observers are notified until batch succeeds. Keep this compatibility seam local.
 */
function checkpointModels(records: Model[]) {
  const snapshots = records.filter(Boolean).map(record => [record, { ...record._raw }]);
  return () => snapshots.forEach(([record, raw]) => {
    record._raw = raw;
    record._preparedState = null;
  });
}

function calendarDay(date: Date | string | number | null | undefined) {
  if (!date) return null;
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return null;
  return parsedDate.toLocaleDateString("en-CA");
}

function previousCalendarDay(date: Date) {
  const previousDate = new Date(date);
  previousDate.setDate(previousDate.getDate() - 1);
  return calendarDay(previousDate);
}

export class Park extends Model {
  static table = "parks";
  static associations = {
    trails: { type: "has_many", foreignKey: "park_id" },
    parks_states: { type: "has_many", foreignKey: "park_id" },
    users_parks: { type: "has_many", foreignKey: "park_id" }, // Link to users_parks for progress tracking
  };

  @field("park_name") parkName;
  @field("park_type") parkType;
  @field("park_image_url") parkImageUrl;
  @field("terrain_type") terrainType;
  @field("climate") climate;
  @field("wild_id") wildId;

  @children("trails") trails;
  @children("users_parks") usersParks; // Track users' progress in this park
}

export class Trail extends Model {
  static table = "trails";
  static associations = {
    parks: { type: "belongs_to", key: "park_id" },
    users: { type: "has_many", foreignKey: "trail_id" },
    users_completed_trails: { type: "has_many", foreignKey: "trail_id" },
    users_queued_trails: { type: "has_many", foreignKey: "trail_id" },
    users_purchased_trails: { type: "has_many", foreignKey: "trail_id" },
  };
  //fields

  @field("trail_name") trailName;
  @field("trail_distance") trailDistance;
  @field("trail_lat") trailLat;
  @field("trail_long") trailLong;
  @field("trail_difficulty") trailDifficulty;
  @field("park_id") parkId;
  @field("trail_image_url") trailImageUrl;
  @field("all_trails_url") allTrailsUrl;
  @field("nps_url") npsUrl;
  @field("hiking_project_url") hikingProjectUrl;
  @field("trail_elevation") trailElevation;
  @field("is_free") isFree;
  @field("is_pro_only") isProOnly;
  @field("trail_of_the_week") trailOfTheWeek;

  @relation("parks", "park_id") park;

  ////?possibly show all uses currently hiking the trail at the time
  @children("users") users;
  @children("users_completed_trails") usersCompletedTrails;
  @children("users_queued_trails") usersQueuedTrails;
  @children("users_purchased_trails") usersPurchasedTrails;
}
export class User extends Model {
  [x: string]: any;
  static table = "users";
  static associations = {
    users_achievements: { type: "has_many", foreignKey: "user_id" },
    users_sessions: { type: "has_many", foreignKey: "user_id" },
    trails: { type: "belongs_to", key: "trail_id" },
    users_completed_trails: { type: "has_many", foreignKey: "user_id" },
    users_queued_trails: { type: "has_many", foreignKey: "user_id" },
    users_purchased_trails: { type: "has_many", foreignKey: "user_id" },
    users_addons: { type: "has_many", foreignKey: "user_id" },
    users_parks: { type: "has_many", foreignKey: "user_id" }, // Added for park-level tracking
    users_friends: { type: "has_many", foreignKey: "user_id" },
    cached_friends: { type: "has_many", foreignKey: "user_id" },
    users_wilds: { type: "has_many", foreignKey: "user_id" },
    token_transactions: { type: "has_many", foreignKey: "user_id" },
  };

  @field("username") username;
  @field("email") email;
  @field("password") password;
  @field("daily_streak") dailyStreak;
  @date("last_daily_streak_date") lastDailyStreakDate;
  @field("push_notifications_enabled") pushNotificationsEnabled;
  @field("theme_preference") themePreference;
  @field("trail_id") trailId;
  @field("trail_progress") trailProgress;
  @field("trail_started_at") trailStartedAt;
  @field("prestige_level") prestigeLevel;
  @field("room_id") roomId;
  @date("created_at") createdAt;
  @date("updated_at") updatedAt;

  @relation("trails", "trail_id") trail;

  @children("users_sessions") usersSessions;
  @children("users_achievements") usersAchievements;
  @children("users_completed_trails") usersCompletedTrails;
  @children("users_queued_trails") usersQueuedTrails;
  @children("users_purchased_trails") usersPurchasedTrails;
  @children("users_addons") usersAddons;
  @children("users_parks") usersParks;
  @children("users_wilds") usersWilds; // Added to track user progress in parks
  @children("token_transactions") tokenTransactions;
  @children("users_friends") friends;
  @children("cached_friends") cachedFriends;

  @reader
  async calculateTotalMiles(): Promise<number> {
    const sessions = await this.usersSessions.fetch();
    const totalMiles = sessions.reduce((sum, session) => {
      return sum + Number(session.totalDistanceHiked || 0);
    }, 0);

    return Number(totalMiles.toFixed(2)) || 0;
  }

  @reader
  async calculateTrailTokenBalance(): Promise<number> {
    const transactions = await this.tokenTransactions.fetch();
    return transactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  }

  prepareTokenTransaction({
    amount,
    type,
    sourceType,
    sourceId,
    idempotencyKey,
    metadata = {},
  }: {
    amount: number;
    type: string;
    sourceType?: string;
    sourceId?: string;
    idempotencyKey: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.collections
      .get("token_transactions")
      .prepareCreate((transaction: Token_Transaction) => {
        transaction.userId = this.id;
        transaction.amount = amount;
        transaction.type = type;
        transaction.sourceType = sourceType || "";
        transaction.sourceId = sourceId || "";
        transaction.idempotencyKey = idempotencyKey;
        transaction.ruleVersion = TOKEN_RULE_VERSION;
        transaction.metadata = tokenMetadata(metadata);
        transaction.balanceAfter = null;
      });
  }

  @writer
  async addRoomId(roomId) {
    try {
      await this.update(() => {
        this.roomId = roomId;
      });
    } catch (err) {
      handleError("user.updateRoomId()", err);
    }
  }

  @writer
  async removeRoomId() {
    try {
      await this.update(() => {
        this.roomId = null;
      });
    } catch (err) {
      handleError("user.removeRoomId()", err);
    }
  }

  @writer
  async addFriend(friend) {
    console.log("in addFriend", friend);
    try {
      await this.batch(
        this.collections.get("users_friends").prepareCreate(userFriend => {
          userFriend.userId = this.id;
          userFriend.friendId = friend.friendId;
        }),

        this.collections.get("cached_friends").prepareCreate(cachedFriend => {
          cachedFriend.userId = this.id;
          cachedFriend.friendId = friend.friendId;
          cachedFriend.username = friend.username;
          cachedFriend.totalMiles = friend.totalMiles;
          cachedFriend.currentTrail = friend.currentTrail;
          cachedFriend.trailProgress = friend.trailProgress;
          cachedFriend.roomId = friend.roomId;
        }),
      );
      return { success: true };
    } catch (err) {
      handleError("user.addFriend()", err);
      return { success: false };
    }
  }

  //Add To Hiking Queue
  @writer async addToQueuedTrails({ trailId }) {
    const addedHike = await this.collections.get("users_queued_trails").create(hike => {
      hike.trailId = trailId;
      hike.userId = this.id;
    });
    return addedHike;
  }

  @writer async deleteFromQueuedTrails({ trailId }) {
    const deleteThisHike = await this.collections
      .get("users_queued_trails")
      .query(Q.and(Q.where("trail_id", trailId), Q.where("user_id", this.id)));
    console.log("in queued Trails");
    await deleteThisHike[0].markAsDeleted();
  }

  @writer
  async purchaseTrail(trail, cost) {
    const tokenBalance = await this.callReader(() => this.calculateTrailTokenBalance());
    if (tokenBalance < cost) {
      throw new Error(
        `You must have at least ${cost} tokens to unlock ${trail.trailName || trail.id}`,
      );
    }

    const existingTransactions = await this.tokenTransactions
      .extend(Q.where("idempotency_key", `trail_unlock:${this.id}:${trail.id}`))
      .fetch();
    if (existingTransactions.length > 0) {
      return true;
    }

    await this.database.batch(
      this.collections.get("users_purchased_trails").prepareCreate(purchased_trail => {
        purchased_trail.userId = this.id;
        purchased_trail.trailId = trail.id;
        purchased_trail.purchasedAt = new Date().toISOString();
      }),
      this.prepareTokenTransaction({
        amount: -cost,
        type: "trail_unlock",
        sourceType: "trail",
        sourceId: trail.id,
        idempotencyKey: `trail_unlock:${this.id}:${trail.id}`,
        metadata: { cost, trailDistance: trail.trailDistance },
      }),
    );

    return true;
  }

  prepareConsumeUserAddons(record) {
    if (record.quantity > 1) {
      return record.prepareUpdate(addon => {
        addon.quantity -= 1;
      });
    } else {
      return record.prepareMarkAsDeleted();
    }
  }

  //create new session
  @writer
  async startNewSession(sessionDetails) {
    // Resolve and validate ALL inventory before preparing mutations. A rejected
    // selection must not leave a cached Watermelon model with pending changes.
    const addonIds = [...new Set<string>(sessionDetails.backpack
      .filter(slot => slot.addon)
      .map(slot => slot.addon.id))];
    const inventory: User_Addon[] = [];
    const selectedAddons: Addon[] = [];
    for (const addonId of addonIds) {
      const [record] = await this.usersAddons.extend(Q.where("addon_id", addonId)).fetch();
      if (!record || !Number.isInteger(record.quantity) || record.quantity < 1) {
        throw new Error(`Addon is not available in owned inventory: ${addonId}`);
      }
      const addon = await record.addon.fetch();
      if (!isSupportedSessionAddon(addon)) {
        throw new Error(`${addon.name} is not supported for sessions yet.`);
      }
      inventory.push(record);
      selectedAddons.push(addon);
    }
    validateAddonFamilies(selectedAddons);
    const restoreInventory = checkpointModels(inventory);
    const newSession = this.collections.get("users_sessions").prepareCreate(userSession => {
      userSession.userId = this.id;
      userSession.sessionName = sessionDetails.sessionName;
      userSession.sessionDescription = sessionDetails.sessionDescription || "";
      userSession.sessionCategoryId = sessionDetails.sessionCategory?.[0] ?? sessionDetails.sessionCategoryId;
      userSession.totalSessionTime = "0";
      userSession.totalDistanceHiked = "0.00";
      userSession.dateAdded = formatDateTime(new Date());
    });

    const sessionAddonsPrepares = [];
    const consumePrepares = [];

    for (const addonRecord of inventory) {
      // create a session_addons record
      const sessionAddonPrepared = this.collections.get("sessions_addons").prepareCreate(sa => {
        sa.sessionId = newSession.id;
        sa.addonId = addonRecord.addonId;
      });
      sessionAddonsPrepares.push(sessionAddonPrepared);

      const consumePrepared = this.prepareConsumeUserAddons(addonRecord);
      consumePrepares.push(consumePrepared);
    }

    // Session facts, consumption receipts, and one inventory unit commit together.
    try {
      await this.batch(newSession, ...sessionAddonsPrepares, ...consumePrepares);
    } catch (error) {
      restoreInventory();
      throw error;
    }

    return { newSession, status: true };
  }

  @writer
  async getTodaysTotalSessionTime() {
    const query = `SELECT SUM(total_session_time) AS total_time_today
FROM users_sessions
WHERE DATE(date_added) = DATE('now', 'localtime') AND user_id  = ?;
`;
    const totalTimeToday = await this.collections
      .get("users_sessions")
      .query(Q.unsafeSqlQuery(query, [this.id]))
      .unsafeFetchRaw();

    return totalTimeToday[0].total_time_today;
  }

  @lazy userSessionsWithCategory = this.usersSessions.extend(
    Q.on("session_categories", "id", "session_category_id"),
  );

  @writer
  async getUserSessionsByCategoryCount(categoryId) {
    const userSessions = await this.collections
      .get("users_sessions")
      .query(Q.where("session_category_id", categoryId));
    return userSessions.length;
  }

  @writer
  async increaseDailyStreak() {
    const today = new Date();
    await this.database.batch(
      this.prepareUpdate(user => {
        user.dailyStreak += 1;
        user.lastDailyStreakDate = today.toISOString();
      }),
      this.prepareTokenTransaction({
        amount: DAILY_STREAK_TOKEN_REWARD,
        type: "daily_streak_reward",
        sourceType: "user",
        sourceId: this.id,
        idempotencyKey: `daily_streak_reward:${this.id}:${calendarDay(today)}`,
        metadata: { dailyStreak: Number(this.dailyStreak || 0) + 1 },
      }),
    );
  }

  @writer
  async resetDailyStreak() {
    return await this.update(() => {
      this.dailyStreak = 0;
      this.lastDailyStreakDate = new Date().toISOString();
    });
  }

  @writer
  async increaseDistanceHikedWriter({ user, userSession, snapshot }) {
    console.log("In increaseDistanceHiked Writer");
    await this.database.batch(
      user.prepareUpdate(updatedUser => {
        updatedUser.trailProgress = (Number(user.trailProgress) + 0.01).toFixed(2);
      }),

      userSession.prepareUpdate(session => {
        session.totalDistanceHiked = Number(
          (Number(session.totalDistanceHiked || 0) + 0.01).toFixed(2),
        );
        //new totalsessiontime = current time minus start time
        session.totalSessionTime = snapshot.totalElapseSec;
      }),
      //userSession.totalFocusTime = userSession.initialPomodoroTime * (( userSession.currentSet - 1  ) + timer.time)
    );
  }

  //update User Trail
  @writer
  async updateUserTrail({ trailId, trailStartedAt }) {
    try {
      await this.update(() => {
        this.trailId = trailId;
        this.trailProgress = "0.00";
        this.trailStartedAt = trailStartedAt;
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  @writer
  async assignNewTrail({
    completedTrailId,
    isProMember,
  }: {
    completedTrailId: string;
    isProMember: boolean;
  }): Promise<number> {
    let sameTrailAsCompleted = true;
    let chosenTrail: Trail | null = null;

    // Pro member: use queued trail if available
    if (isProMember) {
      // Expecting an array of User_Queued_Trail
      const queued: User_Queued_Trail[] = await this.usersQueuedTrails;
      const queuedTrail = queued?.[0];
      if (queuedTrail) {
        const queuedTrailRecord: Trail = await queuedTrail.trail; // relation
        // Update user + remove from queue
        await this.database.batch(
          this.prepareUpdate(user => {
            user.trailId = queuedTrailRecord.id;
            user.trailProgress = "0.00";
            user.trailStartedAt = formatDateTime(new Date());
          }),
          queuedTrail.prepareDestroyPermanently(), // destroy the QUEUE ITEM, not the Trail
        );
        return queuedTrailRecord.trailDistance;
      }
      // Fallthrough to random if nothing queued
    }

    // Pull candidate pools once
    const freeTrails: Trail[] = await this.collections
      .get("trails")
      .query(Q.where("is_free", true))
      .fetch();

    // Expecting an array of User_Purchased_Trail (records with a .trail relation)
    const purchased: User_Purchased_Trail[] = await this.usersPurchasedTrails;

    // Build a uniform selector of entries with an accessor to get the Trail record
    // so we can index without resolving everything up front.
    type Candidate =
      | { kind: "free"; trail: Trail }
      | { kind: "purchased"; ptr: User_Purchased_Trail };
    const candidates: Candidate[] = [
      ...freeTrails.map(t => ({ kind: "free", trail: t })),
      ...purchased.map(p => ({ kind: "purchased", ptr: p })),
    ];

    if (candidates.length === 0) {
      throw new Error("No available trails to assign.");
    }

    // Try a few times to avoid picking the just-completed trail
    for (let attempts = 0; attempts < Math.min(25, candidates.length * 2); attempts++) {
      const randomIndex = Math.floor(Math.random() * candidates.length); // 0..n-1
      const pick = candidates[randomIndex];

      // Resolve to a Trail record
      const pickedTrail = pick.kind === "free" ? pick.trail : await pick.ptr.trail;

      const pickedId = pickedTrail.id;
      if (pickedId !== completedTrailId) {
        chosenTrail = pickedTrail;
        break;
      }
    }

    // If we still somehow matched the same one each time, just take the first different one
    if (!chosenTrail) {
      for (const c of candidates) {
        const t = c.kind === "free" ? c.trail : await c.ptr.trail;
        if (t.id !== completedTrailId) {
          chosenTrail = t;
          break;
        }
      }
    }

    if (!chosenTrail) {
      // All candidates are the completed trail? then just pick something deterministic
      chosenTrail =
        candidates[0].kind === "free" ? candidates[0].trail : await candidates[0].ptr.trail;
    }

    // Update the user with new trail
    await this.update(user => {
      user.trailProgress = "0.00"; // fixed spelling
      user.trailId = chosenTrail!.id;
      user.trailStartedAt = formatDateTime(new Date());
    });

    return Number(chosenTrail.trailDistance);
  }

  @writer
  async markTrailCompleted({ trailId, isProMember, trailStartedAt }): Promise<ParkRewardCommittedPayload | null> {
    //get trail
    const [trail] = await this.collections.get("trails").query(Q.where("id", trailId)).fetch();
    if (!trail) {
      throw new Error("Completed Trail not found");
    }
    //check trail completed
    const [completedTrail] = await this.usersCompletedTrails.extend(Q.where("trail_id", trailId));
    if (!completedTrail) {
      const currentTime = new Date();
      const createdCompletedTrail = await this.collections
        .get("users_completed_trails")
        .create((uct: User_Completed_Trail) => {
          uct.userId = this.id;
          uct.trailId = trailId;
          uct.completionCount = 1;
          uct.firstCompletedAt = formatDateTime(new Date());
          uct.lastCompletedAt = formatDateTime(new Date());
          uct.bestCompletedTime = getTimeDifference(currentTime, trailStartedAt);
        });
      if (!createdCompletedTrail) throw new Error("DB failed to created new completed trail");
    } else if (new Date(completedTrail.lastCompletedAt).getTime() < new Date(trailStartedAt).getTime()) {
      // A retry after the trail write must still attempt the park grant, not count another hike.
      console.debug("Completed trail before trail, updating in markCompletedTrail Writer");
      await completedTrail.update(uct => {
        uct.completionCount += 1;
        uct.lastCompletedAt = formatDateTime(new Date());
        uct.bestCompletedTime = getBetterTime(
          getTimeDifference(new Date(), new Date(trailStartedAt)),
          completedTrail.bestCompletedTime,
        );
      });
    }

    const hasPass = await this.usersParks.extend(Q.where("park_id", trail.parkId)).fetchCount();
    return hasPass ? null : await this.callWriter(() => this.redeemParkPass(trail.parkId));
  }

  //Add User`
  @writer
  async addUser(username, email, password, trailStartedAt) {
    const newUser = await this.collections.get("users").create(user => {
      user.username = username.toLowerCase();
      user.email = email.toLowerCase();
      user.password = password;
      user.pushNotificationsEnabled = true;
      user.themePreference = "light";
      user.trailId = "1";
      user.dailyStreak = 0;
      user.lastDailyStreakDate = new Date().toISOString();
      user.trailProgress = "0.00";
      user.traiStartedAt = trailStartedAt;
      user.prestigeLevel = 0;
    });
    await this.collections.get("token_transactions").create((transaction: Token_Transaction) => {
      transaction.userId = newUser.id;
      transaction.amount = 20;
      transaction.type = "registration_bonus";
      transaction.sourceType = "user";
      transaction.sourceId = newUser.id;
      transaction.idempotencyKey = `registration_bonus:${newUser.id}`;
      transaction.ruleVersion = TOKEN_RULE_VERSION;
      transaction.metadata = tokenMetadata({ reason: "legacy addUser registration bonus" });
      transaction.balanceAfter = null;
    });
    console.debug("Watermelon User Model", newUser);
    return newUser;
  }

  @writer
  async buyAddon(addOn) {
    try {
      // 1. Check if user has enough miles:
      //    They need to have *at least* addOn.requiredTotalMiles.
      // 2. Check if the user's derived session mileage meets the required total miles
      const totalMiles = await this.callReader(() => this.calculateTotalMiles());

      if (totalMiles < addOn.requiredTotalMiles) {
        throw new Error(
          `You must have at least ${addOn.requiredTotalMiles} miles to purchase ${addOn.name}`,
        );
      }

      const tokenBalance = await this.callReader(() => this.calculateTrailTokenBalance());
      if (tokenBalance < addOn.price) {
        throw new Error(`You must have at least ${addOn.price} tokens to purchase ${addOn.name}`);
      }

      // 3. Prepare updates/transactions:
      //    Check if the user already has this addon in user_addons.
      const [existingAddon] = await this.usersAddons.extend(Q.where("addon_id", addOn.id));

      let transaction;
      if (!existingAddon) {
        // If user doesn't have this addon, create a new record with quantity = 1
        transaction = this.collections.get("users_addons").prepareCreate(userAddon => {
          userAddon.userId = this.id;
          userAddon.addonId = addOn.id;
          userAddon.quantity = 1;
        });
      } else {
        // If user already has this addon, increment the quantity
        transaction = existingAddon.prepareUpdate(userAddon => {
          userAddon.quantity += 1;
        });
      }

      await this.database.batch(
        transaction,
        this.prepareTokenTransaction({
          amount: -addOn.price,
          type: "addon_purchase",
          sourceType: "addon",
          sourceId: addOn.id,
          idempotencyKey: `addon_purchase:${this.id}:${addOn.id}:${Date.now()}`,
          metadata: { price: addOn.price, addonName: addOn.name },
        }),
      );

      // 5. Notify success
      return `You purchased ${addOn.name}`;
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
        completedAchievements.map(async achievement => {
          const newUserAchievement = this.collections
            .get("users_achievements")
            .prepareCreate(user_achievement => {
              user_achievement.userId = userId;
              user_achievement.achievementId = achievement.achievementId;
              user_achievement.completedAt = formatDateTime(new Date());
            });
          if (newUserAchievement) {
            return newUserAchievement;
          }
          throw new Error(
            "Failed to prepare create new user achievement in unlocckAchievements writer",
          );
        }),
      );

      await this.database.batch(unlockedAchievements);
      //returns {AcihevementName: string, achievementId: string}
      return completedAchievements;
    } catch (err) {
      console.error("Error in unlockAchievements:", err);
      throw err; // Rethrow the error to handle it at the higher level
    }
  }
  //add User Session
  @writer
  async addUserSession(cfg: SessionCfg) {
    return await this.collections.get("users_sessions").create(user_session => {
      user_session.userId = this.id;
      user_session.sessionName = cfg.sessionName;
      user_session.sessionDescription = cfg.sessionDescription;
      user_session.totalMilesHiked = "0.00";
      user_session.totalSessionTime = 0;
      user_session.sessionCategoryId = cfg.sessionCategory[0];
    });
  }

  //return number o sessions with category Id, only return enough to achieve
  //achievement condition
  @writer
  async getSessionsOfCategoryCount(categoryId, categoryCount) {
    const results = await this.collections
      .get("users_sessions")
      .query(
        Q.and(Q.where("user_id", this.id), Q.where("session_category_id", Q.eq(categoryId))),
        Q.take(categoryCount),
      );
    console.debug("results of getSessionCategoryCount: ", results);
    return results.length;
  }

  // Only local trail completion invokes redemption; sync does not emit celebrations.
  @writer
  async redeemParkWildCheck(parkId: string): Promise<boolean> {
    const park = await this.collections.get<Park>("parks").find(parkId);
    const trails = await park.trails.fetch();
    if (!trails.length) return false;
    const completed = await this.usersCompletedTrails
      .extend(Q.where("trail_id", Q.oneOf(trails.map(t => t.id)))).fetch();
    return trails.every(trail => completed.some(item => item.trailId === trail.id));
  }

  @writer
  async redeemParkPass(parkId: string): Promise<ParkRewardCommittedPayload | null> {
    if (!(await this.callWriter(() => this.redeemParkWildCheck(parkId)))) return null;
    const park = await this.collections.get<Park>("parks").find(parkId);
    const [existing] = await this.usersParks.extend(Q.where("park_id", parkId)).fetch();
    // Preserve existing prestige eligibility, but a no-op must not mint tokens.
    if (existing && Number(this.prestigeLevel) !== Number(existing.parkLevel)) return null;
    const parkLevel = existing ? Number(existing.parkLevel) + 1 : 1;
    const key = `park_reward:${this.id}:${parkId}:${parkLevel}`;
    const [previous] = await this.tokenTransactions.extend(Q.where("idempotency_key", key)).fetch();
    if (previous) return null;

    const reward = this.prestigeLevel * 100 + 200;
    const operations = [];
    let newWild = null;
    // Resolve all reads before preparing writes (including validation of the park Wild).
    const [parkWild] = await this.collections.get("wilds").query(Q.where("park_id", parkId)).fetch();
    if (!existing && !parkWild) throw new Error(`Park Wild not found for parkId: ${parkId}`);
    const ownedWilds = await this.usersWilds.fetch();
    const restore = checkpointModels([existing, ...ownedWilds]);
    if (!existing && !ownedWilds.some(w => w.wildId === parkWild.id)) {
      const unlocked = this.collections.get("users_wilds").prepareCreate(wild => {
        wild.userId = this.id;
        wild.wildId = parkWild.id;
        // Unlock ownership only; selecting a companion is an explicit user action.
        wild.isActive = false;
        wild.level = 1;
        wild.xp = 0;
        wild.xpToNext = 100;
        wild.unlockedAt = new Date();
      });
      operations.push(unlocked);
      newWild = { userWildId: unlocked.id, wildId: parkWild.id, wildName: parkWild.wildName };
    }
    operations.push(existing
      ? existing.prepareUpdate(pass => {
          pass.parkLevel = parkLevel;
          pass.lastCompleted = new Date().toISOString();
          pass.isRewardRedeemed = true;
        })
      : this.collections.get("users_parks").prepareCreate(pass => {
          pass.userId = this.id;
          pass.parkId = parkId;
          pass.parkLevel = parkLevel;
          pass.lastCompleted = new Date().toISOString();
          pass.isRewardRedeemed = true;
        }));
    const transaction = this.prepareTokenTransaction({ amount: reward, type: "park_reward",
      sourceType: "park", sourceId: parkId, idempotencyKey: key, metadata: { reward, parkLevel } });
    try {
      await this.database.batch(...operations, transaction);
    } catch (error) {
      restore();
      throw error;
    }
    return { userId: this.id, transactionId: transaction.id, parkId, parkName: park.parkName,
      parkLevel, amount: reward, newWild };
  }

  @writer
  async prestigeParkPasses() {
    const reward = (this.prestigeLevel + 1) * 1000;
    await this.database.batch(
      this.prepareUpdate(user => {
        user.prestigeLevel += 1;
      }),
      this.prepareTokenTransaction({
        amount: reward,
        type: "prestige_reward",
        sourceType: "user",
        sourceId: this.id,
        idempotencyKey: `prestige_reward:${this.id}:${Number(this.prestigeLevel || 0) + 1}`,
        metadata: { reward },
      }),
    );
  }

  @writer
  async finalizeSessionWithRewardsWriter(args: {
    user: User;
    snapshot: sessionSnapshot;
    rewards: {
      trailRewards: number;
      timeRewards: number;
      totalTokenRewards: number;
      wildXpRewards: number;
    };
  }): Promise<SessionRewardsPersistedPayload> {
    try {
      const batchOperations = [];
      const wildLevelUps = [];

      const [[currentSession], [activeWild], userSessions] = await Promise.all([
        this.usersSessions.extend(Q.where("id", args.snapshot.sessionId)).fetch(),
        this.usersWilds.extend(Q.where("is_active", true)).fetch(),
        this.usersSessions.fetch(),
      ]);

      if (!currentSession) {
        throw new Error(`Cannot finalize missing session ${args.snapshot.sessionId}`);
      }

      const existingTransactions: Token_Transaction[] = await this.tokenTransactions.fetch();
      const sessionKey = `session_reward:${this.id}:${currentSession.id}`;
      const existingSessionReward = existingTransactions.find(
        tx => tx.idempotencyKey === sessionKey,
      );
      let dailyStreakTransaction: Token_Transaction | null = null;
      const today = new Date();
      const todayKey = calendarDay(today);
      const yesterdayKey = previousCalendarDay(today);
      const lastStreakKey = calendarDay(this.lastDailyStreakDate);
      const todaySessionSeconds = userSessions.reduce((total, session) => {
        if (calendarDay(session.dateAdded) !== todayKey) return total;
        if (session.id === currentSession.id) {
          return total + Number(args.snapshot.totalElapsedSec || 0);
        }
        return total + Number(session.totalSessionTime || 0);
      }, 0);
      const hasQualifiedToday = todaySessionSeconds >= DAILY_STREAK_THRESHOLD_SECONDS;
      const existingDailyForSession = existingTransactions.find(
        tx => tx.type === "daily_streak_reward" && tx.sourceId === currentSession.id,
      );
      const alreadyAwardedToday = existingTransactions.some(
        tx => tx.type === "daily_streak_reward" && tx.idempotencyKey.endsWith(`:${todayKey}`),
      );
      const shouldAwardDailyStreak =
        hasQualifiedToday &&
        !existingDailyForSession &&
        !alreadyAwardedToday &&
        (lastStreakKey !== todayKey || Number(this.dailyStreak || 0) <= 0);
      const nextDailyStreak =
        lastStreakKey === yesterdayKey && Number(this.dailyStreak || 0) > 0
          ? Number(this.dailyStreak || 0) + 1
          : 1;

      // Read catalog before preparing any model: failed reads must leave writers retryable.
      const [activeWildCatalog] = activeWild && !existingSessionReward
        ? await this.collections.get("wilds").query(Q.where("id", activeWild.wildId)).fetch() : [];
      const restore = checkpointModels([this, currentSession, activeWild]);
      const userUpdate = this.prepareUpdate(updatedUser => {
        if (shouldAwardDailyStreak) {
          updatedUser.dailyStreak = nextDailyStreak;
          updatedUser.lastDailyStreakDate = today.toISOString();
        }
      });

      batchOperations.push(
        userUpdate,
        currentSession.prepareUpdate((session: Session) => {
          session.totalDistanceHiked = Number(args.snapshot.totalDistanceMiles.toFixed(2));
          session.totalSessionTime = args.snapshot.totalElapsedSec;
        }),
      );

      // Even zero-token sessions need a durable finalization marker so XP cannot replay.
      // Signed ledger sums are unchanged; amount=0 is not an additional reward.
      if (!existingSessionReward) {
        batchOperations.push(
          this.prepareTokenTransaction({
            amount: args.rewards.totalTokenRewards,
            type: "session_reward",
            sourceType: "users_session",
            sourceId: currentSession.id,
            idempotencyKey: `session_reward:${this.id}:${currentSession.id}`,
            metadata: { ...args.rewards, sessionFinalized: true },
          }),
        );
      }

      if (shouldAwardDailyStreak) {
        dailyStreakTransaction = this.prepareTokenTransaction({
          amount: DAILY_STREAK_TOKEN_REWARD,
          type: "daily_streak_reward",
          sourceType: "users_session",
          sourceId: currentSession.id,
          idempotencyKey: `daily_streak_reward:${this.id}:${currentSession.id}:${todayKey}`,
          metadata: { dailyStreak: nextDailyStreak },
        });
        batchOperations.push(dailyStreakTransaction);
      }

      if (activeWild && !existingSessionReward) {
        const nextProgress = calculateWildXpProgress({ currentXp: activeWild.xp,
          xpToNext: activeWild.xpToNext, level: activeWild.level, rewardXp: args.rewards.wildXpRewards });
        if (nextProgress.level > activeWild.level) {
          wildLevelUps.push({ userId: this.id, sessionId: currentSession.id,
            userWildId: activeWild.id, wildId: activeWild.wildId, wildName: activeWildCatalog?.wildName || "Your Wild",
            fromLevel: activeWild.level, toLevel: nextProgress.level });
        }
        batchOperations.push(
          activeWild.prepareUpdate(wild => {
            wild.xp = nextProgress.xp;
            wild.level = nextProgress.level;
            wild.xpToNext = nextProgress.xpToNext;
          }),
        );
      }

      try {
        await this.database.batch(...batchOperations);
      } catch (error) {
        restore();
        throw error;
      }
      const sessionTokens = existingSessionReward
        ? Number(existingSessionReward.amount)
        : args.rewards.totalTokenRewards;
      const streakBonus = Number(
        dailyStreakTransaction?.amount ?? existingDailyForSession?.amount ?? 0,
      );
      return {
        userId: this.id,
        sessionId: currentSession.id,
        sessionTokens,
        wildLevelUps,
        streakBonus,
        totalTokens: sessionTokens + streakBonus,
        dailyStreakAward: dailyStreakTransaction
          ? {
              userId: this.id,
              sessionId: currentSession.id,
              transactionId: dailyStreakTransaction.id,
              amount: streakBonus,
              dailyStreak: nextDailyStreak,
            }
          : null,
      };
    } catch (e) {
      handleError(e, "finalizeSessionWithRewardsWriter");
      throw new Error(`DB Failed to finalize session with rewards: ${e}`);
    }
  }

  @writer
  async setActiveWild(wildId: string) {
    try {
      const [newActiveWild] = await this.usersWilds.extend(Q.where("wild_id", wildId)).fetch();

      if (!newActiveWild) {
        throw new Error("User does not own the specified wild.");
      }

      if (newActiveWild.isActive) {
        return;
      }

      const activeWilds = await this.usersWilds.extend(Q.where("is_active", true)).fetch();

      const updates = activeWilds
        .filter(wild => wild.id !== newActiveWild.id)
        .map(wild =>
          wild.prepareUpdate(w => {
            w.isActive = false;
          }),
        );

      updates.push(
        newActiveWild.prepareUpdate(w => {
          w.isActive = true;
        }),
      );

      await this.database.batch(...updates);
    } catch (e) {
      handleError(e, "setActiveWild writer");
      throw e;
    }
  }
}

export class Park_State extends Model {
  static table = "park_states";
  static associations = {
    parks: { type: "belongs_to", key: "park_id" },
  };

  @field("park_id") parkId;
  @field("state_code") stateCode;
  @field("state_name") stateName;

  @immutableRelation("parks", "park_id") park;
}

export class User_Friend extends Model {
  static table = "users_friends";
  static associations = {
    users: { type: "belongs_to", key: "user_id" },
    users: { type: "belongs_to", key: "friend_id" },
  };
  @field("user_id") userId;
  @field("friend_id") friendId;
  @date("created_at") createdAt;
  @date("updated_at") updatedAt;
}

export class Cached_Friend extends Model {
  static table = "cached_friends";
  static associations = {
    users: { type: "belongs_to", key: "user_id" },
    users: { type: "belongs_to", key: "friend_id" },
  };
  @field("user_id") userId;
  @field("friend_id") friendId;
  @field("username") username;
  @field("total_miles") totalMiles;
  @field("current_trail") currentTrail;
  @field("trail_progress") trailProgress;
  @field("room_id") roomId;
  @date("created_at") createdAt;
  @date("updated_at") updatedAt;

  @immutableRelation("users", "user_id") user;
}

export function calculateWildXpProgress({
  currentXp,
  xpToNext,
  level,
  rewardXp,
}: {
  currentXp: number;
  xpToNext: number;
  level: number;
  rewardXp: number;
}) {
  let nextXp = Number(xpToNext);
  let totalXp = Number(currentXp) + Number(rewardXp);
  let nextLevel = Number(level);

  if (!Number.isFinite(totalXp)) {
    totalXp = 0;
  }
  if (!Number.isFinite(nextLevel) || nextLevel < 1) {
    nextLevel = 1;
  }
  if (!Number.isFinite(nextXp) || nextXp <= 0) {
    nextXp = 100;
  }

  while (totalXp >= nextXp) {
    totalXp -= nextXp;
    nextLevel += 1;
    nextXp = Math.max(1, Math.floor(nextXp * 1.5));
  }

  return { xp: totalXp, level: nextLevel, xpToNext: nextXp };
}

export class Wild extends Model {
  static table = "wilds";

  @field("wild_name") wildName;
  @field("species") species;
  @field("park_id") parkId;
  @field("perk_id") perkId;
  @field("rarity") rarity;
}

export class User_Wild extends Model {
  static table = "users_wilds";
  static associations = {
    users: { type: "has_many", foreignKey: "user_id" },
    wilds: { type: "has_many", foreignKey: "wild_id" },
  };

  @field("user_id") userId;
  @field("wild_id") wildId;
  @field("is_active") isActive;
  @field("level") level;
  @field("xp") xp;
  @field("xp_to_next") xpToNext;
  @date("unlocked_at") unlockedAt;
  @date("created_at") createdAt;
  @date("updated_at") updatedAt;
  @immutableRelation("users", "user_id") user;
  @immutableRelation("wilds", "wild_id") wild;
}

export class Achievement extends Model {
  static table = "achievements";
  static associations = {
    users_achievements: { type: "has_many", foreignKey: "achievement_id" },
  };
  @field("achievement_name") achievementName;
  @field("achievement_description") achievementDescription;
  @field("achievement_image_url") achievementImageUrl;
  @field("type") achievementType;
  @field("condition") achievementCondition;
  @field("fact") achievementFact;

  @immutableRelation("users_achievements", "achievement_id") achievement;

  @children("users_achievements") usersAchievements;

  @lazy
  achievementEarners = this.collections
    .get("users")
    .query(Q.on("users_achievements", "achievement_id", this.id));
}
export class User_Achievement extends Model {
  static table = "users_achievements";
  static associations = {
    achievements: { type: "belongs_to", key: "achievement_id" },
    users: { type: "belongs_to", key: "user_id" },
  };
  @field("user_id") userId;
  @field("achievement_id") achievementId;
  @field("completed_at") completedAt;
  @date("created_at") createdAt;
  @date("updated_at") updatedAt;

  @immutableRelation("users", "user_id") user;
  @immutableRelation("achievements", "achievement_id") achievement;

  @children("users") users;
  @children("achievements") achievements;
}

export class User_Purchased_Trail extends Model {
  static table = "users_purchased_trails";
  static associations = {
    trails: { type: "belongs_to", key: "trail_id" },
    users: { type: "belongs_to", key: "user_id" },
  };
  @field("user_id") userId;
  @field("trail_id") trailId;
  @field("purchased_at") purchasedAt;
  @date("created_at") createdAt;
  @date("updated_at") updatedAt;

  @immutableRelation("users", "user_id") user;
  @immutableRelation("trails", "trail_id") trail;

  @children("users") users;
  @children("trails") trails;
}

export class User_Completed_Trail extends Model {
  static table = "users_completed_trails";
  static associations = {
    users: { type: "belongs_to", key: "user_id" },
    trails: { type: "belongs_to", key: "trail_id" },
  };

  @field("user_id") userId;
  @field("trail_id") trailId;
  @field("first_completed_at") firstCompletedAt;
  @field("last_completed_at") lastCompletedAt;
  @field("best_completed_time") bestCompletedTime;
  @field("completion_count") completionCount;
  @date("created_at") createdAt;
  @date("updated_at") updatedAt;

  @immutableRelation("users", "user_id") user;
  @immutableRelation("trails", "trail_id") trail;

  @children("users") users;
  @children("trails") trails;
  completion_count: any;

  // @lazy extendedTrail = this.trails.extend(Q.on('parks', 'park_id', 'park_id'));
}
export class User_Queued_Trail extends Model {
  static table = "users_queued_trails";
  static associations = {
    trails: { type: "belongs_to", key: "trail_id" },
    users: { type: "belongs_to", key: "user_id" },
  };

  @field("user_id") userId;
  @field("trail_id") trailId;
  @date("created_at") createdAt;
  @date("updated_at") updatedAt;

  @relation("users", "user_id") user;
  @relation("trails", "trail_id") trail;

  @children("users") users;
  @children("trails") trails;

  @writer async deleteTrailFromQueue() {
    await this.markAsDeleted();
  }
}

export class Session_Category extends Model {
  static table = "session_categories";
  static associations = {
    users_sessions: { type: "has_many", foreignKey: "session_category_id" },
  };

  @field("session_category_name") sessionCategoryName;

  @children("users_sessions") usersSessions;
}

// @ts-ignore
export class User_Session extends Model {
  static table = "users_sessions";
  static associations = {
    users: { type: "belongs_to", key: "user_id" },
    session_categories: {
      type: "belongs_to",
      key: "session_category_id",
    },
  };

  @field("user_id") userId;
  @text("session_name") sessionName;
  @text("session_description") sessionDescription;
  @field("session_category_id") sessionCategoryId;
  @field("date_added") dateAdded;
  @field("total_session_time") totalSessionTime;
  @field("total_distance_hiked") totalDistanceHiked;
  @date("created_at") createdAt;
  @date("updated_at") updatedAt;

  @relation("users", "user_id") user;
  @immutableRelation("session_categories", "session_category_id")
  sessionCategory;

  @children("users") users;
}

// @ts-ignore
export class Addon extends Model {
  static table = "addons";
  static associations = {
    users_addons: { type: "has_many", foreignKey: "addon_id" },
    sessions_addons: { type: "has_many", foreignKey: "addon_id" },
  };

  @field("name") name;
  @field("description") description;
  @field("level") level;
  @field("price") price;
  @field("image_url") imageUrl;
  @field("required_total_miles") requiredTotalMiles;
  @field("effect_type") effectType;
  @field("effect_value") effectValue;
  @date("created_at") createdAt;
  @date("updated_at") updatedAt;
}

// @ts-ignore
export class User_Addon extends Model {
  static table = "users_addons";
  static associations = {
    users: { type: "belongs_to", key: "user_id" },
    addons: { type: "belongs_to", key: "addon_id" },
  };

  @field("user_id") userId;
  @field("addon_id") addonId;
  @field("quantity") quantity;
  @date("created_at") createdAt;
  @date("updated_at") updatedAt;

  @relation("users", "user_id") user;
  @relation("addons", "addon_id") addon; //relation('addons', 'addon_id') addon;
}
// @ts-ignore
export class Session_Addon extends Model {
  static table = "sessions_addons";
  static associations = {
    users_sessions: { type: "belongs_to", key: "session_id" },
    addons: { type: "belongs_to", key: "addon_id" },
  };

  @field("session_id") sessionId: any;
  @field("addon_id") addonId: any;
  @date("created_at") createdAt;
  @date("updated_at") updatedAt;

  @relation("users_sessions", "session_id") userSession;
  @relation("addons", "addon_id") addon; //relation('addons', 'addon_id') addon;
}

export class Token_Transaction extends Model {
  static table = "token_transactions";
  static associations = {
    users: { type: "belongs_to", key: "user_id" },
  };

  @field("user_id") userId;
  @field("amount") amount;
  @field("type") type;
  @field("source_type") sourceType;
  @field("source_id") sourceId;
  @field("idempotency_key") idempotencyKey;
  @field("balance_after") balanceAfter;
  @field("rule_version") ruleVersion;
  @field("metadata") metadata;
  @date("created_at") createdAt;
  @date("updated_at") updatedAt;

  @relation("users", "user_id") user;
}

export class User_Park extends Model {
  static table = "users_parks";
  static associations = {
    parks: { type: "belongs_to", foreignKey: "park_id" }, // Links to specific parks
    users: { type: "belongs_to", foreignKey: "user_id" }, // Links to specific users
    //badges: { type: 'belongs_to', foreignKey: 'badge_id' }, // Links to badges earned
  };

  @field("park_id") parkId;
  @field("user_id") userId;
  @field("park_level") parkLevel; // Tracks lifetime park completions
  @field("is_reward_redeemed") isRewardRedeemed; // Tracks reward redemption status
  @field("last_completed") lastCompleted; // Timestamp of the last park completion

  @immutableRelation("parks", "park_id") park;

  //@immutableRelation('badges', 'badge_id') badge;
}

export class Park_Wild extends Model {
  static table = "parks_wilds";
  static associations = {
    parks: { type: "belongs_to", foreignKey: "park_id" }, // Links to specific parks
    wilds: { type: "belongs_to", foreignKey: "wild_id" }, // Links to specific wilds
  };

  @field("park_id") parkId;
  @field("wild_id") wildId;

  @immutableRelation("parks", "park_id") park;
  @immutableRelation("wilds", "wild_id") wild;

  @date("created_at") createdAt;
  @date("updated_at") updatedAt;
}
