import { SessionPhase, SessionSnapshot } from "../sessionEngine/sessionEngine";

import { Rewards } from "../Screens/SessionScreen";
import { User_Session } from "../watermelon/models";

export interface Registry {
  unregister: () => void;
}

export interface SessionSnapshotPayload {
	snapshot: SessionSnapshot;
}
export interface SessionPhaseChangedPayload extends SessionSnapshotPayload {
	from: SessionPhase;
	to: SessionPhase;
	reason: string;
}

export interface SessionSetCompletedPayload extends SessionSnapshotPayload {
	setNumber: number;
}

export interface SessionDistanceIncreasedPayload extends SessionSnapshotPayload {
	session: User_Session | null;
}
export interface SessionCompletedPayload extends SessionSnapshotPayload {
	reason: "all_sets_completed" | "ended_early";
}

export interface SessionTrailCompletedPayload {
	completedTrailId: string;
	isProMember: boolean;
	trailStartedAt: string;
}

export interface PersistenceStartedNewTrailPayload {
		newTrailDistance: number;
	}
export interface NewTrailAssignedPayload {
		newTrailDistance: number;
	}
export interface EventPayloadMap {
  SESSION_STARTED: SessionSnapshotPayload;
  SESSION_PHASE_CHANGED: SessionPhaseChangedPayload;
  SESSION_TICK: SessionSnapshotPayload;
  SESSION_SET_COMPLETED: SessionSetCompletedPayload;
  SESSION_COMPLETED: SessionCompletedPayload;
  SESSION_PAUSED: SessionSnapshotPayload;
  SESSION_DISTANCE_INCREASED: SessionDistanceIncreasedPayload;
  SESSION_TRAIL_COMPLETED: SessionTrailCompletedPayload;
  SESSION_BREAK_SKIPPED: SessionSnapshotPayload;
  SESSION_PACE_INCREASED: SessionSnapshotPayload;
  UI_NEW_SESSION_REQUESTED: void;
  UI_PAUSE_REQUESTED: void;
  UI_RESUME_REQUESTED: void;
  UI_QUIT_REQUESTED: void;
  UI_BREAK_SKIP_REQUESTED: void;
  PERSISTENCE_STARTED_NEW_TRAIL: PersistenceStartedNewTrailPayload;
  NEW_TRAIL_ASSIGNED: NewTrailAssignedPayload;
	REWARDS_CALCULATED: RewardsCalculatedPayload;
}

export interface RewardsCalculatedPayload {
	rewards: Rewards;
	finalSnapshot: SessionSnapshot;
}
export interface Callable {
    [key: string]: Function;
}

//These are the subscribed Events from multible connected hosts
// Created when useBusEvent for a specific event is called in a domain
//{ "EVENT_NAME": { "0(persistanceServices event subscription)": callback, "1(sessionServiceEventsubscription": callback, ... } }
export interface Subscriber {
    [key: string]: Callable;
}

// Some event callbacks take a payload, others dont
export type EventListenerCallback<K extends keyof EventPayloadMap> = 
EventPayloadMap[K] extends void ? () => void : (payload: EventPayloadMap[K]) => void;

export interface EventBus { 
    emit<T extends keyof EventPayloadMap>(event: T, ...args: [EventPayloadMap[T]] extends [void] ? [] : [payload:EventPayloadMap[T]]):void;
    on<T extends keyof EventPayloadMap>(event: T, callback: EventListenerCallback<T>): Registry;
}
export class EventBus implements EventBus {
    private static instance?: EventBus = undefined;
    private subscribers: Subscriber;
    private nextId = 0;

    constructor(){
        this.subscribers = {};
    }

    //SINGLETON
    public static getInstance(): EventBus{
        if(this.instance === undefined){
            this.instance = new EventBus();
        }
        return this.instance;
    }

    public emit<T extends keyof EventPayloadMap>(event: T, ...args: [EventPayloadMap[T]] extends [void] ? [] : [payload:EventPayloadMap[T]]): void {
      const subscriberGroup = this.subscribers[event];

      if (subscriberGroup === undefined) return;
      // inside bus.emit/dispatch for 'SESSION_DISTANCE_INCREASED'
console.log('[Bus] listeners for SESSION_DISTANCE_INCREASED =', Object.keys(this.subscribers['SESSION_DISTANCE_INCREASED'] || {}).length);


      Object.keys(subscriberGroup).forEach(key => {
        try {
          subscriberGroup[key](args[0]);
        } catch (e) {
          console.log(`Error with a subscriber in EventBus for ${key}`);
        }
      });
    }

    public on<T extends keyof EventPayloadMap>(event: T, callback: EventListenerCallback<T>): Registry {
        const id = String(this.nextId++);
        if(!this.subscribers[event]) this.subscribers[event] = {};
        this.subscribers[event][id] = callback;

        return {
            unregister: () => {
               delete  this.subscribers[event][id];
               if(Object.keys(this.subscribers[event]).length === 0){
                delete this.subscribers[event];
               }
            }
        }
    }

    public getSubscribers(){
        return this.subscribers
    }

    public clear(){
        EventBus.instance = undefined;
    }
    
}