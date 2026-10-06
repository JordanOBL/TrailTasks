import React from "react";
import { act, render, screen } from "@testing-library/react-native";
import { SessionScreen } from "../SessionScreen";

const mockResetCurrentSessionEngine = jest.fn();
const busHandlers: Record<string, Function> = {};
const mockSnapshot = {
  sessionId: "session-1",
  userId: "user-1",
  sessionName: "Quit test",
  sessionCategory: ["focus", "Focus"],
  phase: "COMPLETED",
  totalElapsedSec: 120,
  elapsedInPhaseSec: 120,
  distanceNeeded: 1,
  currentSet: 1,
  completedSets: 0,
  totalSets: 1,
  currentPaceMph: 3,
  totalDistanceMiles: 0.1,
  currentTrailDistance: 1,
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

jest.mock("../NewSessionOptions", () => {
  const { Text } = require("react-native");

  return jest.fn(() => <Text testID="new-session-options">Options</Text>);
});

jest.mock("../SoloResultsScreen", () => {
  const { Text } = require("react-native");

  return jest.fn(({ snapshot }: any) => (
    <Text testID="solo-results-snapshot-name">{snapshot?.sessionName ?? "missing-snapshot"}</Text>
  ));
});

jest.mock("../../EventBus/useBusEvent", () => {
  return jest.fn((event: string, handler: Function) => {
    busHandlers[event] = handler;
  });
});

jest.mock("../../contexts/ServiceProvider", () => ({
  useServices: () => ({
    sessionEngineMgr: {
      resetCurrentSessionEngine: mockResetCurrentSessionEngine,
    },
  }),
}));

jest.mock("../../services/AuthContext", () => ({
  useAuthContext: () => ({ user: { id: "user-1" } }),
}));

jest.mock("../../contexts/ThemeProvider", () => {
  const { darkTheme } = require("../../theme");

  return {
    useTheme: () => ({ theme: darkTheme }),
  };
});

jest.mock("@sayem314/react-native-keep-awake", () => ({
  useKeepAwake: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => {
  const { View } = require("react-native");

  return {
    SafeAreaView: View,
  };
});

describe("SessionScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(busHandlers).forEach(key => delete busHandlers[key]);
  });

  test("keeps a final snapshot when an early quit completes before rewards are calculated", async () => {
    render(<SessionScreen />);

    expect(await screen.findByTestId("new-session-options")).toBeDefined();

    act(() => {
      busHandlers.SESSION_COMPLETED({ snapshot: mockSnapshot, reason: "ended_early" });
    });

    expect(await screen.findByTestId("solo-results-snapshot-name")).toHaveTextContent("Quit test");
  });
});
