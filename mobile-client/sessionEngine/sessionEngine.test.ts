/// <reference types="jest" />
import { EventBus } from "../EventBus/EventBus";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";
import { SessionEngine } from "./sessionEngine";
import { createMockUserBase } from "../__mocks__/UserModel";
import { SessionCfg } from "../types/session";
import { User_Session } from "../watermelon/models";

afterAll(() => {
  jest.clearAllMocks();
});

describe("Session Engine", () => {
  const userMock = createMockUserBase();
  const sessionConfig: SessionCfg = {
    session: {} as User_Session,
    sessionId: "session-1",
    userId: "user-1",
    type: "SOLO",
    sessionName: "Test Session",
    sessionCategory: ["category-id", "Category"],
    distanceNeeded: 1,
    totalSets: 3,
    focusTimeSec: 1500,
    shortBreakSec: 300,
    longBreakSec: 900,
    autoContinue: false,
    completedTrails: 0,
    tokenBonusFlat: 0,
    tokenBonusPercent: 0,
    backpack: [],
  };
  const bus = EventBus.getInstance();

  const sessionStartedCb = jest.fn();
  const sessionPhaseChangeCb = jest.fn();
  const sessionTickCb = jest.fn();
  const sessionPausedCb = jest.fn();
  const sessionTrailCompletedCb = jest.fn();
  const sessionBreakSkippedCb = jest.fn();
  const sessionDistanceIncreasedCb = jest.fn();
  const sessionCompletedCb = jest.fn();

  bus.on("SESSION_STARTED", sessionStartedCb);
  bus.on("SESSION_PHASE_CHANGED", sessionPhaseChangeCb);
  bus.on("SESSION_TICK", sessionTickCb);
  bus.on("SESSION_PAUSED", sessionPausedCb);
  bus.on("SESSION_TRAIL_COMPLETED", sessionTrailCompletedCb);
  bus.on("SESSION_BREAK_SKIPPED", sessionBreakSkippedCb);
  bus.on("SESSION_DISTANCE_INCREASED", sessionDistanceIncreasedCb);
  bus.on("SESSION_COMPLETED", sessionCompletedCb);

  let engine: SessionEngine;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    engine = new SessionEngine(bus, sessionConfig, userMock, false);
    engine.register();
  });

  afterAll(() => {
    jest.useRealTimers();
    bus.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Start begins a session and emits SESSION_STARTED with an initial snapshot", async () => {
    engine.start();

    const snapshot = engine.buildSnapshot();

    expect(sessionStartedCb).toHaveBeenCalledTimes(1);
    expect(sessionTickCb).toHaveBeenCalledTimes(1);
    expect(sessionTickCb).toHaveBeenCalledWith({ snapshot: engine.buildSnapshot() });
    expect(sessionPhaseChangeCb).toHaveBeenCalledWith({
      snapshot: engine.buildSnapshot(),
      from: "IDLE",
      to: "FOCUS",
      reason: "start",
    });

    expect(snapshot.phase).toEqual("FOCUS");
    expect(snapshot.currentSet).toEqual(1);
    expect(snapshot.totalElapsedSec).toEqual(0);
    expect(snapshot.elapsedInPhaseSec).toEqual(0);
  });

  test("Timer updates session elaped time and total time after started", async () => {
    engine.start();

    let snapshot = engine.buildSnapshot();

    jest.advanceTimersByTime(engine.getTickRate());
    snapshot = engine.buildSnapshot();

    expect(snapshot.totalElapsedSec).toEqual(1);
    expect(snapshot.elapsedInPhaseSec).toEqual(1);
  });
  test("Session distance increased when paceIncreaseIntervalSec time elapses", async () => {
    let snapshot = engine.buildSnapshot();
    expect(snapshot.totalDistanceMiles).toEqual(0);
    expect(snapshot.elapsedInPhaseSec).toEqual(0);
    expect(snapshot.totalElapsedSec).toEqual(0);

    const elapsedSecNeededForDistanceIncrease = engine.getElapsedSecForTenthMileIncrease();

    engine.start();

    jest.advanceTimersByTime(elapsedSecNeededForDistanceIncrease * 1000);
    snapshot = engine.buildSnapshot();

    expect(snapshot.totalElapsedSec).toEqual(elapsedSecNeededForDistanceIncrease);
    expect(snapshot.elapsedInPhaseSec).toEqual(elapsedSecNeededForDistanceIncrease);
    expect(snapshot.totalDistanceMiles).toEqual(0.01);
  });
  test("Session pauses on pause event and gives 1 strike", async () => {
    let snapshot = engine.buildSnapshot();
    expect(snapshot.phase).toEqual("IDLE");

    engine.start();

    snapshot = engine.buildSnapshot();

    expect(snapshot.phase).toEqual("FOCUS");

    jest.advanceTimersByTime(5000);

    snapshot = engine.buildSnapshot();
    expect(snapshot.totalElapsedSec).toEqual(5);
    expect(snapshot.elapsedInPhaseSec).toEqual(5);

    bus.emit("UI_PAUSE_REQUESTED");

    snapshot = engine.buildSnapshot();
    expect(snapshot.currentStrikes).toEqual(1);
    expect(snapshot.totalStrikes).toEqual(1);
    expect(snapshot.isPaused).toBeTruthy();
    expect(sessionPausedCb).toBeCalledWith({ snapshot });
  });
  test("Session goes to short break when elapsed time equals focus time", async () => {
    let snapshot = engine.buildSnapshot();
    const focusTimeSec = engine.getFocusTimeSec();
    engine.start();

    snapshot = engine.buildSnapshot();

    expect(snapshot.phase).toEqual("FOCUS");

    jest.advanceTimersByTime(focusTimeSec * 1000);

    snapshot = engine.buildSnapshot();
    expect(snapshot.totalElapsedSec).toEqual(focusTimeSec);
    expect(snapshot.currentSet).toEqual(2);
    expect(snapshot.completedSets).toEqual(1);
    expect(snapshot.phase).toEqual("SHORT_BREAK");

    expect(sessionPhaseChangeCb).toBeCalledWith({
      snapshot,
      from: "FOCUS",
      to: "SHORT_BREAK",
      reason: "set_completed",
    });
  });
  test("Session goes to long break after final focus set completed", async () => {
    let snapshot = engine.buildSnapshot();
    const focusTimeSec = engine.getFocusTimeSec();
    const shortBreakTimeSec = engine.getShortBreakTimeSec();
    const longBreakTimeSec = engine.getLongBreakTimeSec();
    engine.start();

    snapshot = engine.buildSnapshot();

    expect(snapshot.phase).toEqual("FOCUS");

    for (let i = 0; i < 2; i++) {
      jest.advanceTimersByTime(focusTimeSec * 1000);
      jest.advanceTimersByTime(shortBreakTimeSec * 1000);
    }
    jest.advanceTimersByTime(focusTimeSec * 1000);

    snapshot = engine.buildSnapshot();
    expect(snapshot.totalElapsedSec).toEqual(focusTimeSec * 3 + shortBreakTimeSec * 2);
    expect(snapshot.currentSet).toEqual(4);
    expect(snapshot.completedSets).toEqual(3);
    expect(snapshot.phase).toEqual("LONG_BREAK");

    expect(sessionPhaseChangeCb).toBeCalledWith({
      snapshot,
      from: "FOCUS",
      to: "LONG_BREAK",
      reason: "set_completed",
    });
  });
  test("Session ends after long break time completed is autocontinue false", async () => {
    let snapshot = engine.buildSnapshot();
    const focusTimeSec = engine.getFocusTimeSec();
    const shortBreakTimeSec = engine.getShortBreakTimeSec();
    const longBreakTimeSec = engine.getLongBreakTimeSec();
    engine.start();

    snapshot = engine.buildSnapshot();

    expect(snapshot.phase).toEqual("FOCUS");

    for (let i = 0; i < 2; i++) {
      jest.advanceTimersByTime(focusTimeSec * 1000);
      jest.advanceTimersByTime(shortBreakTimeSec * 1000);
    }
    jest.advanceTimersByTime(focusTimeSec * 1000);
    jest.advanceTimersByTime(longBreakTimeSec * 1000);

    snapshot = engine.buildSnapshot();
    expect(snapshot.totalElapsedSec).toEqual(
      focusTimeSec * 3 + shortBreakTimeSec * 2 + longBreakTimeSec,
    );
    expect(snapshot.currentSet).toEqual(4);
    expect(snapshot.completedSets).toEqual(3);
    expect(snapshot.phase).toEqual("COMPLETED");

    expect(sessionCompletedCb).toBeCalledWith({
      snapshot,
      reason: "all_sets_completed",
    });
  });
});
