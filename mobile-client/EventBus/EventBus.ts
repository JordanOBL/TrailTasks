import { NewTrailAssignedPayload, PersistenceStartedNewTrailPayload, SessionCompletedPayload, SessionDistanceIncreasedPayload, SessionPhaseChangedPayload, SessionSetCompletedPayload, SessionSnapshotPayload, SessionTrailCompletedPayload } from "../sessionEngine/sessionEngine";

export interface Registry {
    unregister: () => void;
}

export interface EventPayloadMap {
  SESSION_STARTED: SessionSnapshotPayload;
  SESSION_PHASE_CHANGED: SessionPhaseChangedPayload;
  SESSION_TICK: SessionSnapshotPayload;
  SESSION_SET_COMPLETED: SessionSetCompletedPayload;
  SESSION_COMPLETED: SessionCompletedPayload;
  SESSION_PAUSED: void;
  SESSION_DISTANCE_INCREASED: SessionDistanceIncreasedPayload;
  SESSION_TRAIL_COMPLETED: SessionTrailCompletedPayload;
  SESSION_BREAK_SKIPPED: void;
  SESSION_PACE_INCREASED: void;
  UI_NEW_SESSION_REQUESTED: void;
  UI_PAUSE_REQUESTED: void;
  UI_RESUME_REQUESTED: void;
  UI_QUIT_REQUESTED: void;
  UI_BREAK_SKIP_REQUESTED: void;
  PERSISTENCE_STARTED_NEW_TRAIL: PersistenceStartedNewTrailPayload;
  NEW_TRAIL_ASSIGNED: NewTrailAssignedPayload;
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

export interface IEventBus { 
    emit<T extends keyof EventPayloadMap>(event: T, ...args: EventPayloadMap[T] extends void ? [] : [payload:EventPayloadMap[T]]):void;
    on<K extends keyof EventPayloadMap>(event: K, callback: EventListenerCallback<K>): Registry;
}



export class EventBus implements IEventBus {
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

    public emit<T extends keyof EventPayloadMap>(event: T, ...args: EventPayloadMap[T] extends void ? [] : [payload:EventPayloadMap[T]]): void {
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

    public on<K extends keyof EventPayloadMap>(event: K, callback: EventListenerCallback<K>): Registry {
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