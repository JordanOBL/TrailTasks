// SessionEngine.ts

import { Addon, User, User_Session } from "../watermelon/models";

import PersistanceService from '../persistenceService/persistenceService'
import { SessionCfg } from "../types/session";
import handleError from "../helpers/ErrorHandler";

export type SessionPhase = 'IDLE' | 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK' | 'COMPLETED';
export type SessionType = 'SOLO' | 'GROUP'
export type SessionEvent =
  | 'SESSION_STARTED'
  | 'SESSION_PHASE_CHANGED'
  | 'SESSION_TICK'
  | 'SESSION_SET_COMPLETED'
  | 'SESSION_COMPLETED'
  | 'SESSION__STRIKE_APPLIED'
  | 'SESSION_PAUSED'
  | 'SESSION_RESUMED'
  | 'SESSION_DISTANCE_INCREASED'
  | 'SESSION_TRAIL_COMPLETED'
  | 'SESSION_BREAK_SKIPPED'
  | 'SESSION_PACE_INCREASED'

export interface SessionPhaseChangedPayload {
  snapshot: SessionSnapshot;
  from: SessionPhase;
  to: SessionPhase;
  reason: string;
}

export interface SessionSetCompletedPayload {
  snapshot: SessionSnapshot;
  setNumber: number;
}

export interface SessionDistanceIncreasedPayload {
  session: User_Session | null;
  snapshot: SessionSnapshot;
}
export interface SessionCompletedPayload {
  snapshot: SessionSnapshot;
  reason: "all_sets_completed" | "ended_early";
}

export interface SessionTrailCompletedPayload {
  completedTrailId: string;
  isProMember: boolean;
  trailStartedAt: string;
}

  export type UI_Event = 
  | 'UI_NEW_SESSION_REQUESTED'
  | 'UI_PAUSE_REQUESTED'
  | 'UI_RESUME_REQUESTED'
  | 'UI_QUIT_REQUESTED'
  | 'UI_BREAK_SKIP_REQUESTED'
 
  export type PersistenceEvent = 
  |'PERSISTENCE_STARTED_NEW_TRAIL'
  | 'NEW_TRAIL_ASSIGNED'
  
  export interface SessionSnapshot {
      sessionId: string;
      userId: string;
      sessionName: string;
      sessionCategory: [string, string];
      phase: string;
      totalElapsedSec: number;
      elapsedInPhaseSec: number;
      distanceNeeded: number;
      currentSet: number;
      completedSets: number;
      totalSets: number;
      currentPaceMph: number;
      totalDistanceMiles: number;
      focusTimeSec: number;
      shortBreakSec: number;
      longBreakSec: number;
      autoContinue: boolean;
      currentStrikes: number;
      completedTrails: {id: string, distance: number}[];
      isPaused: boolean;
      tokenBonusFlat: number;
      tokenBonusPercent: number;
      startedAt: number | null;
}

export interface EventBus {
  on(event: SessionEvent | UI_Event | PersistenceEvent, listener: (payload: any) => void): void;
  off?(event: SessionEvent | UI_Event | PersistenceEvent, listener: (payload: any) => void): void;
  emit(event: SessionEvent | UI_Event | PersistenceEvent, payload?: any): void;
}

export class SessionEngine {
  static instance: SessionEngine | null;
  private bus: EventBus;
  private phase: SessionPhase = "IDLE";
  private user : User
  private isProMember: boolean;


  // config
  private readonly session: User_Session | null;
  private readonly sessionId: string;
  private readonly userId: string;
  private readonly type: string;
  private readonly sessionName: string;
  private readonly sessionCategory: [string, string];
  private readonly totalSets: number;
  private readonly focusTimeSec: number;
  private readonly shortBreakSec: number;
  private readonly longBreakSec: number;
  private readonly autoContinue: boolean;

  // pacing
  private readonly minPaceMph: number;
  private readonly maxPaceMph: number;
  private readonly paceIncreaseIntervalSec: number;
  private readonly paceIncreaseValueMph: number;
  private readonly backpack: {addon: Addon | null, minimumTotalMiles: number}[];
  readonly tokenBonusFlat: number
  readonly tokenBonusPercent: number

  // runtime state
  private startTimestampMs: number | null = null;
  private totalElapsedSec = 0;
  private elapsedInPhaseSec = 0;
  private distanceNeeded: number
  private currentSet = 1;
  private completedSets = 0;
  private extraSets = 0;
  private isPaused = false;
  private currentPaceMph: number;
  private totalDistanceMiles = 0;
  private completedTrails:{ id: string, distance: number}[] = [];
  private currentStrikes = 0;
  private totalStrikes = 0;
  private strikePacePenaltyMph = 0.25

  // timer
  private tickTimer: ReturnType<typeof setInterval> | null = null;
  private readonly tickRateMs = 1000;

  constructor(bus: EventBus, cfg: SessionCfg, user: User, isProMember: boolean) {
    this.bus = bus;
    this.session = cfg.session;
    this.sessionId = cfg.sessionId;
    this.type = cfg.type;
    this.user = user;
    this.isProMember = isProMember;
    this.userId = cfg.userId;
    this.sessionName = cfg.sessionName;
    this.sessionCategory = cfg.sessionCategory ?? null;
    this.distanceNeeded = cfg.distanceNeeded
    this.totalSets = cfg.totalSets ?? 3;
    this.focusTimeSec = cfg.focusTimeSec ?? 1500;
    this.shortBreakSec = cfg.shortBreakSec ?? 300;
    this.longBreakSec = cfg.longBreakSec ?? 900;
    this.autoContinue = cfg.autoContinue ?? true;
    this.tokenBonusFlat = cfg.tokenBonusFlat ?? 0;
    this.tokenBonusPercent =  cfg.tokenBonusPercent ?? 1;
    this.minPaceMph = cfg.minPaceMph ?? 2;
    this.maxPaceMph = cfg.maxPaceMph ?? 5;
    this.paceIncreaseIntervalSec = cfg.paceIncreaseIntervalSec ?? 900;
    this.paceIncreaseValueMph = cfg.paceIncreaseValueMph ?? 0.25;

    this.strikePacePenaltyMph = 0;

    this.currentPaceMph = this.minPaceMph;
    this.backpack = cfg.backpack
  }

  /* -------------------- public commands -------------------- */
 
 
  register(){
    this.bus.on('UI_PAUSE_REQUESTED', () => this.pause())
    this.bus.on('UI_RESUME_REQUESTED', () => this.resume()) 
    this.bus.on('UI_QUIT_REQUESTED', () => this.quit())
    this.bus.on('UI_BREAK_SKIP_REQUESTED', () => this.skipBreak())
    this.bus.on('NEW_TRAIL_ASSIGNED', (newTrailDistance) => {
      console.log("SessionEngine received NEW_TRAIL_ASSIGNED with distance:", newTrailDistance, 'Of type:', typeof newTrailDistance);
      this.distanceNeeded += newTrailDistance
    }) 
  }

  start() {
    if (this.phase !== "IDLE") return;
  
    this.phase = "FOCUS";
    this.startTimestampMs = Date.now();
    this.totalElapsedSec = 0;
    this.elapsedInPhaseSec = 0;
    this.currentSet = 1;
    this.completedSets = 0;
    this.currentPaceMph = this.minPaceMph;

    // announce
    this.bus.emit("SESSION_STARTED", this.buildSnapshot());
    this.bus.emit("SESSION_PHASE_CHANGED", {
      ...this.buildSnapshot(),
      from: "IDLE",
      to: "FOCUS",
      reason: "start",
    });

    // emit initial tick so UI can render immediately
    this.bus.emit("SESSION_TICK", this.buildSnapshot());

    // start tick loop
    this.startTickLoop();
  }

  pause() {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
    if(this.phase === 'FOCUS'){
      this.currentStrikes++;
      this.totalStrikes++;
      let next = this.currentPaceMph - this.strikePacePenaltyMph
      this.currentPaceMph = Math.max(this.minPaceMph, next)
    }
    // could emit a PAUSED event later if you want
    this.isPaused = true;
    
    this.bus.emit("SESSION_PAUSED", this.buildSnapshot())
  }

  resume() {
    if (this.tickTimer) return;
    if (this.phase === "COMPLETED" || this.phase === "IDLE") return;
    this.isPaused = false
    this.startTickLoop();
  }

  quit() {
    this.finishSession("ended_early");
  }

  beginBreak(isLong: boolean = false) {
    if (this.phase !== "FOCUS") return;
    this.phase = isLong ? "LONG_BREAK" : "SHORT_BREAK";
    this.elapsedInPhaseSec = 0;
    this.bus.emit("SESSION_PHASE_CHANGED", {
      ...this.buildSnapshot(),
      from: "FOCUS",
      to: this.phase,
      reason: "set_completed",
    });
  }

  trailCompleted(){
    this.completedTrails.push({id: this.user.trailId, distance: this.user.trailProgress})
    this.bus.emit("SESSION_TRAIL_COMPLETED", {completedTrailId: this.user.trailId, isProMember:this.isProMember, trailStartedAt: this.user.trailStartedAt})
  }

  skipBreak() {
    if (this.phase !== "SHORT_BREAK" && this.phase !== "LONG_BREAK") return;

    if(this.phase === 'SHORT_BREAK'){
      this.elapsedInPhaseSec = this.shortBreakSec
    }
    else if(this.phase === 'LONG_BREAK'){
      this.elapsedInPhaseSec = this.longBreakSec
    }

    this.bus.emit("SESSION_BREAK_SKIPPED", this.buildSnapshot())
  }

  async increaseDistance(){
    this.totalDistanceMiles += 0.01
    //check if trail complete

    if(this.totalDistanceMiles.toFixed(2) >= this.distanceNeeded.toFixed(2)){
      this.trailCompleted()
    }

    this.bus.emit("SESSION_DISTANCE_INCREASED", {session: this.session, snapshot:{...this.buildSnapshot()}})
  }

  /* -------------------- private ticking logic -------------------- */

  private startTickLoop() {
    this.tickTimer = setInterval(() => this.onTick(), this.tickRateMs);
  }

  private onTick() {
    this.totalElapsedSec += 1;
    this.elapsedInPhaseSec += 1;
    // distance = speed (mph) * hours
    //this.totalDistanceMiles += this.currentPaceMph * (1 / 3600);

    // emit tick snapshot
    this.bus.emit("SESSION_TICK", this.buildSnapshot());
    console.log(this.buildSnapshot())

    if (this.phase === "FOCUS") {
      // pace increase?
      if (
        this.paceIncreaseIntervalSec > 0 &&
        this.elapsedInPhaseSec > 0 &&
        this.elapsedInPhaseSec % this.paceIncreaseIntervalSec === 0 && 
        this.currentStrikes === 0
      ) {
        this.bumpPace();
      }

      if (
        this.paceIncreaseIntervalSec > 0 &&
        this.elapsedInPhaseSec % this.paceIncreaseIntervalSec === 0 &&
        this.currentStrikes > 0
      ) {
        this.skipPaceBump();
      }

      //increaseDistance
      if(this.elapsedInPhaseSec > 0 && this.elapsedInPhaseSec % Math.floor((.01 / this.currentPaceMph) * 3600) === 0){
        this.increaseDistance()
      }

      // end of focus set?
      if (this.elapsedInPhaseSec >= this.focusTimeSec) {
        this.handleSetComplete();
      }
    } else if (this.phase === "SHORT_BREAK" || this.phase === "LONG_BREAK") {
      const breakTarget = this.phase === "SHORT_BREAK" ? this.shortBreakSec : this.longBreakSec;
      if (this.elapsedInPhaseSec >= breakTarget) {
        if (this.phase == 'SHORT_BREAK') {
          this.phase = "FOCUS";
          this.elapsedInPhaseSec = 0;
          this.bus.emit("SESSION_PHASE_CHANGED", {
            ...this.buildSnapshot(),
            to: "FOCUS",
            reason: "break_ended",
          });
        } else {
          if(this.autoContinue){}
          else{
            this.finishSession('all_sets_completed')
          }
        }
      }
    }
  }

  private bumpPace() {
    const next = this.currentPaceMph + this.paceIncreaseValueMph;
    this.currentPaceMph = Math.min(next, this.maxPaceMph);
    this.bus.emit("SESSION_PACE_INCREASED", this.buildSnapshot());
  }

  private skipPaceBump() {
    if (this.currentStrikes === 0) return;
    this.currentStrikes--;
    //this.bus.emit("SKIPPED_PACE_INCREASE");
  }

  private handleSetComplete() {
    this.completedSets += 1;
    this.bus.emit("SESSION_SET_COMPLETED", {
      ...this.buildSnapshot(),
      setNumber: this.currentSet,
    });

    // if (this.completedSets >= this.totalSets) {
    //   this.finishSession("all_sets_completed");
    //   return;
    // }

    // prepare next set
    this.currentSet += 1;
    this.elapsedInPhaseSec = 0;

    // go to break
    const isLong = this.shouldTakeLongBreak();
    this.phase = isLong ? "LONG_BREAK" : "SHORT_BREAK";
    this.bus.emit("SESSION_PHASE_CHANGED", {
      ...this.buildSnapshot(),
      to: this.phase,
      reason: "set_completed",
    });
  }

  private shouldTakeLongBreak(): boolean {
    // example rule: every 3rd set → long break
    return this.completedSets % 3 === 0;
  }

  private finishSession(reason: "all_sets_completed" | "ended_early") {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
    this.phase = "COMPLETED";
    this.bus.emit("SESSION_COMPLETED", {
      //send final snapshot so the rewardsService can send rewards and final snapshot of session to ui and persistenceService
      snapshot: this.buildSnapshot(),
      reason,
    });
  }

  // Getters

  public getType() {
    return this.type;
  }

  /* -------------------- snapshot -------------------- */

  public buildSnapshot(): SessionSnapshot {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      sessionName: this.sessionName,
      sessionCategory: this.sessionCategory,
      phase: this.phase,
      isPaused: this.isPaused,
      totalElapsedSec: this.totalElapsedSec,
      distanceNeeded: this.distanceNeeded,
      elapsedInPhaseSec: this.elapsedInPhaseSec,
      currentSet: this.currentSet,
      completedSets: this.completedSets,
      totalSets: this.totalSets,
      currentPaceMph: this.currentPaceMph,
      completedTrails: this.completedTrails,
      totalDistanceMiles: Number(this.totalDistanceMiles.toFixed(2)),
      focusTimeSec: this.focusTimeSec,
      shortBreakSec: this.shortBreakSec,
      longBreakSec: this.longBreakSec,
      autoContinue: this.autoContinue,
      currentStrikes: this.currentStrikes,
      tokenBonusFlat: this.tokenBonusFlat,
      tokenBonusPercent:this.tokenBonusPercent,
      startedAt: this.startTimestampMs,
    };
  }
}
