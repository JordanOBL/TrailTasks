import {
  EventBus,
  Registry,
  RewardsCalculatedPayload,
  SessionDistanceIncreasedPayload,
  SessionTrailCompletedPayload,
} from "../EventBus/EventBus";
import { User, User_Session } from "../watermelon/models";

import { Database } from "@nozbe/watermelondb";
import { SessionCfg } from "../types/session";
import { SessionSnapshot } from "../sessionEngine/sessionEngine";
import formatDateTime from "../helpers/formatDateTime";
import handleError from "../helpers/ErrorHandler";

type TRewardsCalculatedPayload = {
  finalSnapshot: SessionSnapshot;
  rewards: {
    trailRewards: number;
    timeRewards: number;
    totalTokenRewards: number;
    wildXpRewards: number;
  };
};

export interface IPersistenceService {
  register: Function;
  persistNewDistance: (payload: SessionDistanceIncreasedPayload) => Promise<void>;
  persistCompletedTrail: (payload: SessionTrailCompletedPayload) => Promise<void>;
  persistCompletedSessionWithRewards: (payload: TRewardsCalculatedPayload) => Promise<void>;
}

interface DistanceIdempotencyCache {
  [key: string]: SessionDistanceIncreasedPayload;
}

interface CompletedTrailsIdemptencyCache {
  [key: string]: SessionTrailCompletedPayload;
}

interface SessionWithRewardsIdempotencyCache {
  [key: string]: RewardsCalculatedPayload | User;
}
export default class PersistenceService {
  private bus: EventBus;
  private db: Database;
  private user: User;
  private distanceIdempotencyCache: DistanceIdempotencyCache = {};
  private completedTrailsIdempotencyCache: CompletedTrailsIdemptencyCache = {};
  private sessionWithRewardsIdempotencyCache: SessionWithRewardsIdempotencyCache = {};

  constructor(user: User, db: Database, bus: EventBus) {
    this.db = db;
    this.bus = bus;
    this.user = user;
  }

  register(): Function {
    const unregisterList: Registry[] = [];
    // unregisterList.push(
    //   this.bus.on("NEW_SESSION_REQUESTED", (cfg: SessionCfg) => this.createNewSession(cfg)),
    // );
    unregisterList.push(
      this.bus.on(
        "SESSION_DISTANCE_INCREASED",
        async (payload: SessionDistanceIncreasedPayload) => {
          const { session, snapshot } = payload;
          if (!session) {
            throw new Error("Error: session is null in SESSION_DISTANCE_INCREASED event");
          }
          if (!snapshot) {
            throw new Error("Error: snapshot is null in SESSION_DISTANCE_INCREASED event");
          }
          const eventId: string = this.createDistanceIdempotentId(session);
          if (!this.distanceIdempotencyCache[eventId]) {
            this.persistNewDistance({ session, snapshot });
            this.distanceIdempotencyCache[eventId] = { session, snapshot };
          }
        },
      ),
    );
    unregisterList.push(
      this.bus.on("SESSION_TRAIL_COMPLETED", (payload: SessionTrailCompletedPayload) => {
        const { completedTrailId, isProMember, trailStartedAt } = payload;
        const idempotentId = this.createCompletedTrailIdempotentId(
          completedTrailId,
          trailStartedAt,
        );
        if (this.completedTrailsIdempotencyCache[idempotentId]) {
          return;
        }

        this.completedTrailsIdempotencyCache[idempotentId] = {
          completedTrailId,
          isProMember,
          trailStartedAt,
        };
        this.persistCompletedTrail(payload);
      }),
    );
    unregisterList.push(
      this.bus.on("REWARDS_CALCULATED", (payload: TRewardsCalculatedPayload) => {
        const { finalSnapshot, rewards } = payload;

        const idempotencyKey = finalSnapshot.sessionId;
        if (this.sessionWithRewardsIdempotencyCache[idempotencyKey]) {
          return;
        }

        this.sessionWithRewardsIdempotencyCache[idempotencyKey] = {
          finalSnapshot,
          rewards,
          user: { ...this.user },
        };
        this.persistCompletedSessionWithRewards(payload);
      }),
    );
    return () => unregisterList.forEach(obj => obj.unregister());
  }

  //--------------USER SESSION--------------//

  public async createNewSession(cfg: SessionCfg): Promise<User_Session> {
    console.log("Config in createnewsession", cfg);
    const newSession = await this.db.write(async () => {
      const newSession = await this.db.get<User_Session>("users_sessions").create(session => {
        session.userId = cfg.userId;
        session.sessionCategoryId = cfg.sessionCategory[0];
        session.sessionName = cfg.sessionName;
        session.totalDistanceHiked = "0.00";
        session.totalSessionTime = 0;
        session.dateAdded = formatDateTime(new Date());
      });
      return newSession;
    });
    if (!newSession) {
      throw new Error("Error creating new session in persistenceService");
    }
    return newSession;
  }
  //Event: SESSION_DISTANCE_INCREASED
  public async persistNewDistance({
    session,
    snapshot,
  }: SessionDistanceIncreasedPayload): Promise<void> {
    try {
      await this.user.increaseDistanceHikedWriter({
        user: this.user,
        userSession: session,
        snapshot: snapshot,
      });
    } catch (e) {
      handleError(e, "PersistenceService increadeDistanceHiked");
    }
  }
  //EVENT: SESSION_TRAIL_COMPLETED
  public async persistCompletedTrail({
    completedTrailId,
    isProMember,
    trailStartedAt,
  }: SessionTrailCompletedPayload): Promise<void> {
    try {
      if (!completedTrailId || !trailStartedAt) {
        throw new Error("Error, missing args, cannot persist trail completion");
      }

      const newTrailDistance: number = await this.user.assignNewTrail({
        completedTrailId,
        isProMember,
      });

      this.bus.emit("NEW_TRAIL_ASSIGNED", { newTrailDistance });
      await this.user.markTrailCompleted({
        trailId: completedTrailId,
        isProMember: isProMember,
        trailStartedAt: trailStartedAt,
      });
    } catch (e) {
      handleError(e, "PersistenceService persistCompletedTrail");
    }
  }
  //EVENT: SESSION_COMPLETED
  public async persistCompletedSessionWithRewards(args: TRewardsCalculatedPayload): Promise<void> {
    try {
      await this.user.finalizeSessionWithRewardsWriter({
        user: this.user,
        snapshot: args.finalSnapshot,
        rewards: args.rewards,
      });
    } catch (e) {
      handleError(e, "PersistenceService persistCompletedSessionWithRewards");
    }
  }

  private createDistanceIdempotentId(payload: User_Session): string {
    const id: string = `${payload.id}:${payload.totalDistanceHiked}`;
    return id;
  }

  private createCompletedTrailIdempotentId(trailId: string, trailStartedAt: string): string {
    const id: string = `${trailId}:${trailStartedAt}`;
    return id;
  }
}
