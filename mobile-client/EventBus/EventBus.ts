export interface Registry {
    unregister: () => void;
}

export interface Callable {
    [key: string]: Function;
}

//These are the subscribed Events from multible connected hosts
export interface Subscriber {
    [key: string]: Callable;
}

export interface IEventBus { 
    emit<T>(event: string, arg?:T):void;
    on(event: string, callback: Function): Registry;

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

    public emit<T>(event:string, arg?: T): T| void{
      const subscriberGroup = this.subscribers[event];

      if (subscriberGroup === undefined) return;
      // inside bus.emit/dispatch for 'SESSION_DISTANCE_INCREASED'
console.log('[Bus] listeners for SESSION_DISTANCE_INCREASED =', Object.keys(this.subscribers['SESSION_DISTANCE_INCREASED'] || {}).length);


      Object.keys(subscriberGroup).forEach(key => {
        try {
          const res = subscriberGroup[key](arg);
        } catch (e) {
          console.log(`Error with a subscriber in EventBus for ${key}`);
        }
      });
    }

    public on(event: string, callback: Function): Registry {
        const id = String(this.nextId++);
        if(!this.subscribers[event]) this.subscribers[event] = {};
        this.subscribers[event][id] = callback;

        return {
            unregister: () => {
               delete  this.subscribers[event][id]
               if(Object.keys(this.subscribers[event]).length === 0){
                delete this.subscribers[event]
               }
            }
        }
    }

    public getSubscribers(){
        return this.subscribers
    }

    public clear(){
        EventBus.instance = undefined
    }
    
}