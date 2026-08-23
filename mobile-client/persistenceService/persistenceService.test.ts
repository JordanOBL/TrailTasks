import { jest, describe, beforeEach, test, expect, afterEach } from "@jest/globals";
import { SessionSnapshot } from "../sessionEngine/sessionEngine";
import { createMockUserBase } from "../__mocks__/UserModel";
import PersistenceService, { IPersistenceService } from "../persistenceService/persistenceService";
import { EventBus } from "../EventBus/EventBus";
import { Database } from "@nozbe/watermelondb";
import { User_Session } from "../watermelon/models";
import formatDateTime from "../helpers/formatDateTime";

const mockUser = createMockUserBase();
const mockSnapshot: SessionSnapshot = {
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
  completedTrails: [],
  totalStrikes: 0,
  isPaused: false,
  tokenBonusFlat: 0,
  tokenBonusPercent: 0,
  startedAt: null,
  consecutiveSecWithoutStrikes: 0,
  extraSets: 0,
};

const mockSession: User_Session = {
  id: "PEjX0oRJTqv0OwZb",
  userId: "qUgvdULB53guzJqa",
  sessionName: "ll",
  sessionDescription: null,
  sessionCategoryId: 2,
  dateAdded: "2025-11-27 17:48:37",
  totalSessionTime: 46.0,
  totalDistanceHiked: 0.02,
  createdAt: 1764283717420,
  updatedAt: 1764303340518,
} as User_Session;

const mockDatabase = jest.fn(() => {
  return {
    write: jest.fn(async () => Promise.resolve()),
    get: jest.fn(() => {
      return {
        create: jest.fn(() => {}),
      };
    }),
  };
}) as unknown as Database;

describe("Persistence Service", () => {
  let bus = EventBus.getInstance();
  let user = createMockUserBase();
  let persistenceService: IPersistenceService;

  beforeEach(() => {
    bus = EventBus.getInstance();
    persistenceService = new PersistenceService(user, mockDatabase, bus);
    persistenceService.register();
  });

  afterEach(() => {
    jest.clearAllMocks();
    bus.clear();
  });

  test("it doesnt recall increaseDistance on the same snapshot", () => {
    const persistNewDistanceSpy = jest.spyOn(persistenceService, "persistNewDistance");

    const payload = { session: mockSession, snapshot: mockSnapshot };
    bus.emit("SESSION_DISTANCE_INCREASED", payload);
    expect(persistNewDistanceSpy).toHaveBeenCalledTimes(1);
    bus.emit("SESSION_DISTANCE_INCREASED", payload);
    expect(persistNewDistanceSpy).toHaveBeenCalledTimes(1);
  });

  test("it doesnt attempt to persist the same completed trail event more than once", () => {
    const persistCompletedTrailSpy = jest.spyOn(persistenceService, "persistCompletedTrail");
    const startedAt = new Date();

    const payload = {
      completedTrailId: "1",
      isProMember: false,
      trailStartedAt: formatDateTime(startedAt),
    };
    bus.emit("SESSION_TRAIL_COMPLETED", payload);
    expect(persistCompletedTrailSpy).toHaveBeenCalledTimes(1);
    bus.emit("SESSION_TRAIL_COMPLETED", payload);
    expect(persistCompletedTrailSpy).toHaveBeenCalledTimes(1);
  });

  test("it doesnt attempt to save the same completed session & rewards", () => {
    const persistCompletedSessionSpy = jest.spyOn(
      persistenceService,
      "persistCompletedSessionWithRewards",
    );

    const payload = {
      finalSnapshot: mockSnapshot,
      rewards: {
        trailRewards: 1,
        timeRewards: 1,
        totalTokenRewards: 2,
        wildXpRewards: 1,
      },
    };
    bus.emit("REWARDS_CALCULATED", payload);
    expect(persistCompletedSessionSpy).toHaveBeenCalledTimes(1);
    bus.emit("REWARDS_CALCULATED", payload);
    expect(persistCompletedSessionSpy).toHaveBeenCalledTimes(1);
  });
});
