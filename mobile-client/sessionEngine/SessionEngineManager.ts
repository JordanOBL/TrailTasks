import { Trail, User, User_Session } from "../watermelon/models";

import { Database } from "@nozbe/watermelondb";
import { EventBus } from "../EventBus/EventBus";
import PersistenceService from "../persistenceService/persistenceService";
import { SessionCfg } from "../types/session";
import { SessionEngine } from "./sessionEngine";

export default class SessionEngineManager {
  private current: SessionEngine | null = null;
  private bus: EventBus;
  private persistenceService: PersistenceService;
  private user: User;
  private isProMember: boolean;
  private db: Database;

  constructor(
    user: User,
    db: Database,
    ps: PersistenceService,
    bus: EventBus,
    isProMember: boolean,
  ) {
    this.bus = bus;
    this.user = user;
    this.isProMember = isProMember;
    this.db = db;
    this.persistenceService = ps;
  }

  async requestNewSession(cfg: SessionCfg): Promise<User_Session> {
    if (!this.persistenceService)
      throw new Error("Cannot request new session, no persistence service");
    //persistance service create row in sqlite
    // return it
    const s: User_Session = await this.persistenceService.createNewSession(cfg);
    return s;
  }

  async createSessionEngine(cfg: SessionCfg, createdSession: User_Session): Promise<SessionEngine> {
    //setDistance needed for trail
    const trail: Trail = await this.user.trail;
    if (!trail) {
      throw new Error("Cannot creat session, current user has no trail assigned");
    }

    //add session and sessionId to cfg
    cfg.session = createdSession;
    cfg.sessionId = createdSession.id;
    cfg.distanceNeeded = Number(trail.trailDistance) - Number(this.user.trailProgress);
    cfg.currentTrailDistance = trail.trailDistance;

    // 2) make a new engine with full config
    this.current = new SessionEngine(this.bus, cfg, this.user, this.isProMember);

    if (!this.current) {
      throw new Error("New SessionEngine did not return a SessionEngine");
    }

    //register the needed event listeners on the event bus
    this.current.register();
    //return the sessionEngine
    return this.current;
  }

  public resetCurrentSessionEngine() {
    this.current = null;
  }

  public getCurrent() {
    return this.current;
  }
}
