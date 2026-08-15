import { EventBus, Registry } from "../EventBus/EventBus";
import { SessionEngine, SessionSnapshot } from "../sessionEngine/sessionEngine";
import { User, User_Session } from '../watermelon/models';

import {Database} from '@nozbe/watermelondb'
import { SessionCfg } from '../types/session';
import formatDateTime from '../helpers/formatDateTime';
import handleError from '../helpers/ErrorHandler';

type TRewardsCalculatedPayload = {
  finalSnapshot: SessionSnapshot;
  rewards: {
    trailRewards: number;
    timeRewards: number;
    totalTokenRewards: number;
    wildXpRewards: number;
  };
};  

export default class PersistenceService {
  private bus: EventBus;
  private db: Database;
  private user: User;

  constructor(user: User, db: Database, bus: EventBus) {
    this.db = db;
    this.bus = bus;
    this.user = user;
  }

  register(): Function {
    const unregisterList: Registry[] = [];
    unregisterList.push(
      this.bus.on("NEW_SESSION_REQUESTED", (cfg: SessionCfg) => this.createNewSession(cfg)),
    );
    unregisterList.push(
      this.bus.on(
        "SESSION_DISTANCE_INCREASED",
        (payload: { session: User_Session; snapshot: SessionSnapshot }) =>
          this.persistNewDistance({ session: payload.session, snapshot: payload.snapshot }),
      ),
    );
    unregisterList.push(
      this.bus.on(
        "SESSION_TRAIL_COMPLETED",
        (payload: { completedTrailId: string; isProMember: boolean; trailStartedAt: string }) =>
          this.persistCompletedTrail(payload),
      ),
    );
    unregisterList.push(
      this.bus.on("REWARDS_CALCULATED", (args: TRewardsCalculatedPayload) => this.persistCompletedSessionWithRewards(args)),
    );
    return () => unregisterList.forEach(obj => obj.unregister());
  }

  //--------------USER SESSION--------------//

  public async createNewSession(cfg: SessionCfg): Promise<User_Session | undefined> {
    try {
      console.log("Config in createnewsession", cfg);
      const s = await this.db.write(async () => {
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
      if (!s) {
        throw new Error("Error creating new session in persistenceService");
      }
      return s;
    } catch (e) {
      handleError(e, "Error creating new user session in PS");
    }
  }
  //Event: SESSION_DISTANCE_INCREASED
  public async persistNewDistance({
    session,
    snapshot,
  }: {
    session: User_Session;
    snapshot: SessionSnapshot;
  }) {
    try {
      console.log("In peristenceService inscreaseDistanceHiked()");

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
  }: {
    completedTrailId: string;
    isProMember: boolean;
    trailStartedAt: string;
  }) {
    try {
      console.log("In peristenceService sessionTrailCompleted()");

      const newTrailDistance:number = await this.user.assignNewTrail({ completedTrailId, isProMember });
      console.log("New trail distance:", newTrailDistance);
      this.bus.emit("NEW_TRAIL_ASSIGNED", newTrailDistance);
      await this.user.markTrailCompleted({
        trailId: completedTrailId,
        isProMember: isProMember,
        trailStartedAt: trailStartedAt,
      });

    } catch (e) {
      handleError(e, "PersistenceService increadeDistanceHiked");
    }
  }
  //EVENT: SESSION_COMPLETED
  public async persistCompletedSessionWithRewards(args: TRewardsCalculatedPayload) {
    try {
      console.log("In peristenceService persistCompletedSessionWithRewards()");
      console.log(args)
      await this.user.finalizeSessionWithRewardsWriter({
        user: this.user,
        snapshot: args.finalSnapshot,
        rewards: args.rewards,
      });

    } catch (e) {
      handleError(e, "PersistenceService persistCompletedSessionWithRewards");
    }
  }
}