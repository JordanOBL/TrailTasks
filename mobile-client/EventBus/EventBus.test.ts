import { EventBus, SessionSnapshotPayload } from "./EventBus"
import { afterEach, describe, expect, jest, test } from '@jest/globals';

import { SessionSnapshot } from '../sessionEngine/sessionEngine';

describe("EventBus", () => {
    const fakeSnapshot: SessionSnapshot = {
      sessionId: "session-1",
      userId: "user-1",
      sessionName: "Test Session",
      sessionCategory: ["category-id", "Category"],
      phase: "FOCUS",
      totalElapsedSec: 0,
      elapsedInPhaseSec: 0,
      distanceNeeded: 1,
      currentSet: 1,
      completedSets: 0,
      totalSets: 1,
      currentPaceMph: 3,
      totalDistanceMiles: 0,
      focusTimeSec: 1500,
      shortBreakSec: 300,
      longBreakSec: 900,
      autoContinue: false,
      currentStrikes: 0,
      completedTrails: [],
      isPaused: false,
      tokenBonusFlat: 0,
      tokenBonusPercent: 0,
      startedAt: null,
    };

    afterEach(() => {
        EventBus.getInstance().clear();
    });
    
    test('singleton Pattern', async () => {
        const eb = EventBus.getInstance();
        const eb1 = EventBus.getInstance(); 
        expect(eb).toBe(eb1);
    });

    test('Subscribes to new event', () => {
        const eb = EventBus.getInstance();
        const cb = jest.fn();
        eb.on('UI_PAUSE_REQUESTED', cb);
        const subscribers = eb.getSubscribers();
        expect(subscribers['UI_PAUSE_REQUESTED']).not.toBeUndefined();
        expect(Object.keys(subscribers)).toHaveLength(1);
    });

    test('emit method calls callback with payload', async () => {
        const eb = EventBus.getInstance();
        const cb = jest.fn((payload: SessionSnapshotPayload) => {
            expect(payload.snapshot).toEqual(fakeSnapshot);
        });
        const payload = { snapshot: fakeSnapshot }
        eb.on('SESSION_STARTED', cb);
        eb.emit('SESSION_STARTED', payload);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenLastCalledWith(payload);
    });

    test('emit method does not call callback after unregister', async () => {
        //create event bus
        const eb = EventBus.getInstance();
        //create callback to spy on not called
        const cb1 = jest.fn();
        //create another callback to actually call
        const cb2 = jest.fn();
        //Create bus listener for event with callback 1
        const cb1Registry = eb.on('SESSION_STARTED', cb1);
        // create bus listener for same event with callback 2
        eb.on('SESSION_STARTED', cb2);
        // expect 2 event subscribers
        expect(Object.keys(eb.getSubscribers()['SESSION_STARTED'])).toHaveLength(2);
        // unregister callback 1
        cb1Registry.unregister();
        // emit event
        eb.emit('SESSION_STARTED', { snapshot: fakeSnapshot});
        // assert cb not called
        expect(cb1).not.toHaveBeenCalled();
        // assert cb2 still called;
        expect(cb2).toHaveBeenCalledWith({ snapshot: fakeSnapshot });
        // expect 1 event subscribers
        expect(Object.keys(eb.getSubscribers()['SESSION_STARTED'])).toHaveLength(1);

    });

    test("emitting event without listener doesnt crash", () => {
      const eb = EventBus.getInstance();
      // Do not create listner for event first
      // eb subscribers should be empty
      expect(eb.getSubscribers()).toEqual({});
      expect(() => {
        eb.emit("UI_PAUSE_REQUESTED");
      }).not.toThrowError();
    });

    test("One bad listener doesnt stop others", () => {
        //create event bus
        const eb = EventBus.getInstance();
        //create callback to spy on not called
        const cb1 = jest.fn(() => { throw new Error('Cb1 Failed') });
        //create another callback to actually call
        const cb2 = jest.fn();
        //Create bus listener for event with callback 1
        eb.on('SESSION_STARTED', cb1);
        //Create bus listener for event with callback 2
        eb.on('SESSION_STARTED', cb2);
        // expect 2 event subscribers
        expect(Object.keys(eb.getSubscribers()["SESSION_STARTED"])).toHaveLength(2);
        // emit event
        eb.emit('SESSION_STARTED', { snapshot: fakeSnapshot });
        // assert cb2 still called
        expect(cb2).toHaveBeenCalledWith({snapshot: fakeSnapshot});
    });

    test("Clear method removes subscribers/listeners and resets singleton", () => {
      //create event bus
        const eb = EventBus.getInstance();
        expect(eb).toBeInstanceOf(EventBus);
        //create callback to spy on not called
        const cb1 = jest.fn();
        //create another callback to actually call
        const cb2 = jest.fn();
        //Create bus listener for event with callback 1
        eb.on('SESSION_STARTED', cb1);
        //Create bus listener for event with callback 2
        eb.on('SESSION_STARTED', cb2);
        // expect 2 event subscribers
        expect(Object.keys(eb.getSubscribers()["SESSION_STARTED"])).toHaveLength(2);
        // clear instance
        eb.clear();
        const eb2 = EventBus.getInstance();

        expect(eb).toBeInstanceOf(EventBus);
        expect(eb2).not.toBe(eb)
        expect(eb.getSubscribers()).toEqual({});
    })
});