import { jest, describe, test, afterAll, afterEach, expect, beforeEach } from "@jest/globals";
import { render, screen, userEvent } from "@testing-library/react-native";
import { createMockUserBase } from "../../__mocks__/UserModel";
import EnhancedActiveSession from "./ActiveSession";
import formatCountdown from "../../helpers/Timer/formatCountdown";

const mockUser = createMockUserBase();
let mockSnapshot: any;
let mockBus: any;
let mockEngine: any;
let mockSessionEngineMgr: any;
let mockHandlers: Record<string, Function[]>;

beforeEach(() => {
  mockHandlers = {};

  mockSnapshot = {
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
  mockBus = {
    on: jest.fn((event: string, handler: Function) => {
      mockHandlers[event] ||= [];
      mockHandlers[event].push(handler);

      return {
        unregister: jest.fn(),
      };
    }),
    emit: jest.fn(),
  };
  mockEngine = {
    buildSnapshot: jest.fn(() => mockSnapshot),
  };

  mockSessionEngineMgr = {
    getCurrent: jest.fn(() => mockEngine),
  };
});

jest.mock("../../contexts/ServiceProvider", () => {
  return {
    useServices: () => ({
      bus: mockBus,
      sessionEngineMgr: mockSessionEngineMgr,
    }),
  };
});

jest.mock("../../components/DistanceProgressBar", () => {
  return jest.fn(() => {
    return <></>;
  });
});

jest.mock("@nozbe/watermelondb/react", () => {
  return {
    withObservables: jest.fn((deps: string[]) => (Component: any) => {
      return (props: any) => {
        const injectedProps: any = {};

        if (deps.includes("user")) {
          injectedProps.user = mockUser;
        }

        if (deps.includes("currentTrail")) {
          injectedProps.currentTrail = { id: "1", trailDistance: "5.00", trailName: "Test Trail" };
        }

        if (deps.includes("completedTrails")) {
          injectedProps.completedTrails = [];
        }

        if (deps.includes("queuedTrails")) {
          injectedProps.queuedTrails = [];
        }

        if (deps.includes("usersAchievements")) {
          injectedProps.usersAchievements = [];
        }

        if (deps.includes("userPurchasedTrails")) {
          injectedProps.userPurchasedTrails = [];
        }

        return <Component {...props} {...injectedProps} />;
      };
    }),
  };
});

jest.mock("@react-navigation/native", () => {
  return {
    ...jest.requireActual("@react-navigation/native"),
    useNavigation: jest.fn(() => ({ dispatch: jest.fn() })),
    usePreventRemove: jest.fn(),
  };
});

afterAll(() => {
  jest.useRealTimers();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("active Session UI screen", () => {
  test("renders visible session stats from the current engine snapshot", async () => {
    render(<EnhancedActiveSession />);

    const expectedDisplayedTime = formatCountdown(
      mockSnapshot.focusTimeSec - mockSnapshot.elapsedInPhaseSec,
    );

    const { currentPaceMph, totalSets, totalStrikes, totalDistanceMiles } = mockSnapshot;

    expect(await screen.findByText(expectedDisplayedTime)).toBeDefined();
    expect((await screen.findByTestId("pace")).props.children).toBe(currentPaceMph + " mph");
    expect((await screen.findByTestId("sets")).props.children).toBe("0 / " + totalSets);
    expect((await screen.findByTestId("strikes")).props.children).toBe(totalStrikes);
    expect((await screen.findByTestId("total-dist.")).props.children).toBe(
      totalDistanceMiles.toFixed(2) + " mi.",
    );
    expect((await screen.findByTestId("trails")).props.children).toBe(0);
  });
  test("The pause button emits the pause event", async () => {
    const user = userEvent.setup();

    render(<EnhancedActiveSession />);

    await user.press(await screen.findByTestId("pause-resume-button"));

    expect(mockBus.emit).toHaveBeenCalledWith("UI_PAUSE_REQUESTED");
  });
  test("ause/resume button emits UI_RESUME_REQUESTED when snapshot is paused", async () => {
    const user = userEvent.setup();
    mockSnapshot.isPaused = true;

    render(<EnhancedActiveSession />);

    await user.press(await screen.findByTestId("pause-resume-button"));
    expect(mockBus.emit).toHaveBeenCalledWith("UI_RESUME_REQUESTED");
  });
});
