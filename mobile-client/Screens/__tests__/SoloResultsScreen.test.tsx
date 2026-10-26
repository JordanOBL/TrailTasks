import { test, describe, jest, expect } from "@jest/globals";
import SoloResultScreen from "../SoloResultsScreen";
import { render, screen, userEvent } from "@testing-library/react-native";
import { SessionSnapshot } from "../../sessionEngine/sessionEngine";
import { Rewards } from "../../services/RewardService";
import formatTime from "../../helpers/formatTime";
import { ScrollView, StyleSheet } from "react-native";

jest.mock("../../contexts/ThemeProvider", () => {
  return {
    useTheme: jest.fn(() => {
      return { theme: {} };
    }),
  };
});

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

const resetSession = jest.fn(() => {});

const mockRewards = {
  trailRewards: 10,
  wildXpRewards: 10,
  timeRewards: 10,
  totalTokenRewards: 10,
};

describe("Solo Results Screen", () => {
  test("small viewports can scroll to a full-height accessible return action", () => {
    const result = render(
      <SoloResultScreen
        rewards={mockRewards}
        snapshot={mockSnapshot}
        resetSession={resetSession}
      />,
    );
    const scroll = result.UNSAFE_getByType(ScrollView);
    expect(StyleSheet.flatten(scroll.props.style)).toMatchObject({ flex: 1 });
    expect(StyleSheet.flatten(scroll.props.contentContainerStyle)).toMatchObject({ flexGrow: 1 });
    const button = screen.getByRole("button", { name: "Return to Lobby" });
    expect(StyleSheet.flatten(button.props.style)).toMatchObject({ minHeight: 48, flexShrink: 0 });
  });
  test("calculated rewards remain pending and failures never claim an award", () => {
    const { rerender } = render(
      <SoloResultScreen
        rewards={mockRewards}
        snapshot={mockSnapshot}
        resetSession={resetSession}
      />,
    );
    expect(screen.getByTestId("total-tokens-earned-text")).toHaveTextContent("Pending");
    rerender(
      <SoloResultScreen
        rewards={mockRewards}
        snapshot={mockSnapshot}
        resetSession={resetSession}
        persistenceFailed
      />,
    );
    expect(screen.getByTestId("rewards-persistence-status")).toHaveTextContent(
      /No award confirmed/,
    );
    expect(screen.getByTestId("total-tokens-earned-text")).toHaveTextContent("Pending");
  });
  test("renders fallback when rewards are missing", async () => {
    render(
      <SoloResultScreen
        rewards={undefined as unknown as Rewards}
        snapshot={mockSnapshot}
        resetSession={resetSession}
      />,
    );

    expect(await screen.findByText("Unable to load session rewards...")).toBeDefined();
  });

  test("renders fallback when snapshot is missing", async () => {
    render(<SoloResultScreen rewards={mockRewards} snapshot={null} resetSession={resetSession} />);

    expect(await screen.findByText("Unable to load session rewards...")).toBeDefined();
  });

  test("renders session summary and rewards from props", async () => {
    render(
      <SoloResultScreen
        rewards={mockRewards}
        committedRewards={{
          userId: "user-1",
          sessionId: "session-1",
          sessionTokens: 5,
          streakBonus: 15,
          totalTokens: 20,
          dailyStreakAward: null,
        }}
        snapshot={mockSnapshot}
        resetSession={resetSession}
      />,
    );

    expect((await screen.findByTestId("total-time-text")).props.children).toEqual(
      formatTime(mockSnapshot.totalElapsedSec),
    );
    expect((await screen.findByTestId("total-distance-text")).props.children).toEqual(
      mockSnapshot.totalDistanceMiles + " miles",
    );
    expect((await screen.findByTestId("sets-completed-text")).props.children).toEqual(
      mockSnapshot.completedSets,
    );
    expect((await screen.findByTestId("trail-tokens-earned-text")).props.children).toEqual(
      mockRewards.trailRewards,
    );
    expect((await screen.findByTestId("time-tokens-earned-text")).props.children).toEqual(
      mockRewards.timeRewards,
    );
    expect((await screen.findByTestId("total-tokens-earned-text")).props.children).toEqual(20);
  });

  test("pressing return to lobby calls resetSession", async () => {
    render(
      <SoloResultScreen
        rewards={mockRewards}
        committedRewards={{
          userId: "user-1",
          sessionId: "session-1",
          sessionTokens: 5,
          streakBonus: 15,
          totalTokens: 20,
          dailyStreakAward: null,
        }}
        snapshot={mockSnapshot}
        resetSession={resetSession}
      />,
    );
    const user = userEvent.setup();
    const backToLobbyButton = await screen.findByTestId("return-to-lobby-button");
    await user.press(backToLobbyButton);

    expect(resetSession).toHaveBeenCalled();
  });
});
