/// <reference types="jest" />

import { ServiceContext, ServiceProvider, useServices } from "./ServiceProvider";
import { act, render, waitFor } from "@testing-library/react-native";
import { AppState, AppStateStatus } from "react-native";
import { EventBus } from "../EventBus/EventBus";
import { SessionEngine } from "../sessionEngine/sessionEngine";
import { SessionCfg } from "../types/session";
import { createMockUserBase } from "../__mocks__/UserModel";
import { User } from "../watermelon/models";

const mockPersistenceCleanup = jest.fn();
const mockRewardCleanup = jest.fn();

const mockPersistenceRegister = jest.fn(() => mockPersistenceCleanup);
const mockRewardRegister = jest.fn(() => mockRewardCleanup);

const user = { id: "1" };
const mockDb = { adapter: {} };
let mockIsProMember = false;
let mockCurrentEngine: SessionEngine | null = null;

jest.mock("@nozbe/watermelondb/react", () => {
  return {
    useDatabase: jest.fn(() => mockDb),
  };
});

jest.mock("../services/AuthContext", () => ({
  useAuthContext: jest.fn(() => ({
    user: user as User,
    isProMember: mockIsProMember,
  })),
}));

jest.mock("../persistenceService/persistenceService", () => {
  return jest.fn().mockImplementation(() => ({
    register: mockPersistenceRegister,
  }));
});

jest.mock("../sessionEngine/SessionEngineManager", () => {
  return jest.fn().mockImplementation(() => ({
    id: "mock-session-engine-manager",
    getCurrent: () => mockCurrentEngine,
  }));
});

jest.mock("../services/RewardService", () => {
  return jest.fn().mockImplementation(() => ({
    register: mockRewardRegister,
    setIsProMember: jest.fn(),
  }));
});

describe("ServiceProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    user.id = "1";
    mockIsProMember = false;
  });
  afterEach(() => {
    jest.clearAllMocks();
    user.id = "1";
    mockIsProMember = false;
  });

  test("Initializes services for consumers after user and db are available", async () => {
    const observeServices = jest.fn();
    const TestConsumer = () => {
      const services = useServices();
      observeServices(services);
      return null;
    };
    render(
      <ServiceProvider>
        <TestConsumer />
      </ServiceProvider>,
    );

    let firstRenderedServices;

    await waitFor(() => {
      expect(observeServices).toHaveBeenCalled();
      firstRenderedServices = observeServices.mock.calls[observeServices.mock.calls.length - 1][0];

      expect(firstRenderedServices.persistenceService).not.toBeNull();
      expect(firstRenderedServices.sessionEngineMgr).not.toBeNull();
      expect(firstRenderedServices.rewardService).not.toBeNull();
    });
  });

  test("keeps the reward notification owner when membership changes", async () => {
    let latest: ServiceContext;
    const Consumer = () => {
      latest = useServices();
      return null;
    };
    const screen = render(
      <ServiceProvider>
        <Consumer />
      </ServiceProvider>,
    );
    await waitFor(() => expect(latest.rewardService).not.toBeNull());
    const first = latest!.rewardService;
    mockIsProMember = true;
    screen.rerender(
      <ServiceProvider>
        <Consumer />
      </ServiceProvider>,
    );
    await waitFor(() => {
      expect(latest.rewardService).toBe(first);
      expect(first!.setIsProMember).toHaveBeenCalledWith(true);
    });
    expect(mockRewardCleanup).not.toHaveBeenCalled();
  });

  test("recreates services after user changes", async () => {
    const observeServices = jest.fn();
    const TestConsumer = () => {
      const services = useServices();
      observeServices(services);
      return null;
    };
    const { rerender } = render(
      <ServiceProvider>
        <TestConsumer />
      </ServiceProvider>,
    );

    let firstRenderedServices: Omit<ServiceContext, "bus">;

    await waitFor(() => {
      expect(observeServices).toHaveBeenCalled();
      firstRenderedServices = observeServices.mock.calls[observeServices.mock.calls.length - 1][0];

      expect(firstRenderedServices.persistenceService).not.toBeNull();
      expect(firstRenderedServices.sessionEngineMgr).not.toBeNull();
      expect(firstRenderedServices.rewardService).not.toBeNull();
    });

    user.id = "2";

    rerender(
      <ServiceProvider>
        <TestConsumer />
      </ServiceProvider>,
    );

    let secondRenderedServices: Omit<ServiceContext, "bus">;

    await waitFor(() => {
      expect(observeServices).toHaveBeenCalled();
      secondRenderedServices = observeServices.mock.calls[observeServices.mock.calls.length - 1][0];

      expect(secondRenderedServices.persistenceService).not.toBeNull();
      expect(secondRenderedServices.sessionEngineMgr).not.toBeNull();
      expect(secondRenderedServices.rewardService).not.toBeNull();

      expect(firstRenderedServices?.persistenceService).not.toBe(
        secondRenderedServices?.persistenceService,
      );
      expect(firstRenderedServices?.sessionEngineMgr).not.toBe(
        secondRenderedServices?.sessionEngineMgr,
      );
      expect(firstRenderedServices?.rewardService).not.toBe(secondRenderedServices?.rewardService);
    });
  });
});


describe("ServiceProvider session app lifecycle", () => {
  let change: (next: AppStateStatus) => void;
  const remove = jest.fn();
  const originalAppState = AppState.currentState;
  const cfg: SessionCfg = {
    session: null, sessionId: "lifecycle-1", userId: "1", type: "SOLO",
    sessionName: "Lifecycle", sessionCategory: ["study", "Study"],
    distanceNeeded: 10, currentTrailDistance: 10, totalSets: 3,
    focusTimeSec: 5, shortBreakSec: 10, longBreakSec: 15,
    autoContinue: false, completedTrails: 0, backpack: [],
  };
  let engine: SessionEngine;
  let bus: EventBus;

  beforeEach(() => {
    jest.useFakeTimers();
    AppState.currentState = "active";
    // Without a native listener, dispatching a state change does nothing (RED).
    change = () => {};
    remove.mockClear();
    jest.spyOn(AppState, "addEventListener").mockImplementation((_type, listener) => {
      change = listener;
      return { remove };
    });
    bus = EventBus.getInstance();
    bus.clear();
    // Real engine events are observed, not replaced; avoid missing-consumer noise.
    bus.on("SESSION_STARTED", () => {});
    bus.on("SESSION_PHASE_CHANGED", () => {});
    bus.on("SESSION_TICK", () => {});
    bus.on("SESSION_PAUSED", () => {});
    bus.on("SESSION_SET_COMPLETED", () => {});
    bus.on("SESSION_COMPLETED", () => {});
    engine = new SessionEngine(bus, cfg, createMockUserBase(), false);
    engine.register();
    mockCurrentEngine = engine;
  });

  afterEach(() => {
    mockCurrentEngine = null;
    jest.clearAllTimers();
    bus?.clear();
    AppState.currentState = originalAppState;
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it("pauses focus with one strike per departure and resumes only lifecycle-paused work", () => {
    render(<ServiceProvider>{null}</ServiceProvider>);
    engine.start();
    act(() => { jest.advanceTimersByTime(1000); });
    act(() => { change("background"); });
    expect(engine.buildSnapshot()).toMatchObject({ isPaused: true, totalStrikes: 1 });
    act(() => { change("background"); jest.advanceTimersByTime(2000); });
    expect(engine.buildSnapshot()).toMatchObject({ totalElapsedSec: 1, totalStrikes: 1 });
    act(() => { change("active"); jest.advanceTimersByTime(1000); });
    expect(engine.buildSnapshot()).toMatchObject({ isPaused: false, totalElapsedSec: 2, totalStrikes: 1 });
    act(() => { change("inactive"); change("background"); });
    expect(engine.buildSnapshot().totalStrikes).toBe(2);
  });

  it("does not add a strike or auto-resume a manually paused focus session", () => {
    render(<ServiceProvider>{null}</ServiceProvider>);
    engine.start();
    bus.emit("UI_PAUSE_REQUESTED");
    act(() => { change("background"); change("active"); });
    expect(engine.buildSnapshot()).toMatchObject({ isPaused: true, totalStrikes: 1 });
  });

  it("pauses and resumes a break without penalizing it", () => {
    render(<ServiceProvider>{null}</ServiceProvider>);
    engine.start();
    act(() => { jest.advanceTimersByTime(5000); });
    expect(engine.buildSnapshot().phase).toBe("SHORT_BREAK");
    act(() => { change("background"); });
    expect(engine.buildSnapshot()).toMatchObject({ isPaused: true, totalStrikes: 0 });
    act(() => { change("active"); });
    expect(engine.buildSnapshot()).toMatchObject({ isPaused: false, totalStrikes: 0 });
  });

  it("ignores idle, completed and absent sessions", () => {
    render(<ServiceProvider>{null}</ServiceProvider>);
    act(() => { change("background"); change("active"); });
    expect(engine.buildSnapshot()).toMatchObject({ phase: "IDLE", isPaused: false, totalStrikes: 0 });
    engine.start();
    engine.quit();
    act(() => { change("background"); change("active"); });
    expect(engine.buildSnapshot()).toMatchObject({ phase: "COMPLETED", isPaused: false, totalStrikes: 0 });
    mockCurrentEngine = null;
    expect(() => { change("background"); change("active"); }).not.toThrow();
  });

  it("does not resume a replacement session after returning to the foreground", () => {
    render(<ServiceProvider>{null}</ServiceProvider>);
    engine.start();
    act(() => { change("background"); });
    const replacement = new SessionEngine(bus, { ...cfg, sessionId: "replacement" }, createMockUserBase(), false);
    replacement.start();
    replacement.pause();
    mockCurrentEngine = replacement;
    act(() => { change("active"); change("active"); });
    expect(replacement.buildSnapshot()).toMatchObject({ phase: "FOCUS", isPaused: true, totalStrikes: 1 });
    expect(engine.buildSnapshot().isPaused).toBe(true);
  });

  it("unsubscribes the app-state listener on provider unmount", () => {
    const screen = render(<ServiceProvider>{null}</ServiceProvider>);
    expect(AppState.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    screen.unmount();
    expect(remove).toHaveBeenCalled();
  });
});
