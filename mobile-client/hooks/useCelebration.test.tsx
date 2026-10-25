import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { act, fireEvent, render } from "@testing-library/react-native";
import { EventBus } from "../EventBus/EventBus";
import RewardService from "../services/RewardService";
import { useCelebration } from "./useCelebration";
let mockFocused = false;
let mockService: RewardService;
let mockBus: EventBus;
jest.mock("@react-navigation/native", () => ({ useIsFocused: () => mockFocused }));
jest.mock("../contexts/ServiceProvider", () => ({ useServices: () => ({ rewardService: mockService, bus: mockBus }) }));
function Probe({ userId = "u" }) {
  const { award, dismiss } = useCelebration(userId);
  return <><Text testID="award">{award?.kind ?? "none"}</Text><TouchableOpacity onPress={dismiss} testID="dismiss"><Text>Continue</Text></TouchableOpacity></>;
}
test("all kinds wait for Home focus, sequence across remount, and never replay acknowledged awards", () => {
  mockFocused = false;
  mockBus = new EventBus();
  mockService = new RewardService(mockBus, {} as any, { id: "u" } as any, false);
  const dispose = mockService.register();
  mockBus.on("DAILY_STREAK_REWARD_COMMITTED", jest.fn());
  mockBus.on("CELEBRATION_QUEUED", jest.fn());
  const park = { userId: "u", transactionId: "p", parkId: "p", parkName: "Acadia", amount: 200, parkLevel: 1, newWild: null };
  mockBus.emit("PARK_REWARD_COMMITTED", park);
  mockBus.emit("SESSION_REWARDS_PERSISTED", { userId: "u", sessionId: "s", sessionTokens: 0, streakBonus: 15, totalTokens: 15,
    dailyStreakAward: { userId: "u", sessionId: "s", transactionId: "t", amount: 15, dailyStreak: 2 },
    wildLevelUps: [{ userId: "u", sessionId: "s", userWildId: "uw", wildId: "w", wildName: "Scout", fromLevel: 1, toLevel: 3 }] });
  const screen = render(<Probe />);
  expect(screen.getByTestId("award")).toHaveTextContent("none");
  mockFocused = true;
  screen.rerender(<Probe />);
  expect(screen.getByTestId("award")).toHaveTextContent("park");
  fireEvent.press(screen.getByTestId("dismiss"));
  expect(screen.getByTestId("award")).toHaveTextContent("daily_streak");
  screen.unmount();
  const remount = render(<Probe />);
  expect(remount.getByTestId("award")).toHaveTextContent("daily_streak");
  fireEvent.press(remount.getByTestId("dismiss"));
  expect(remount.getByTestId("award")).toHaveTextContent("wild_level");
  mockFocused = false;
  remount.rerender(<Probe />);
  expect(remount.getByTestId("award")).toHaveTextContent("none");
  mockFocused = true;
  remount.rerender(<Probe userId="other" />);
  expect(remount.getByTestId("award")).toHaveTextContent("none");
  remount.rerender(<Probe />);
  fireEvent.press(remount.getByTestId("dismiss"));
  act(() => mockBus.emit("PARK_REWARD_COMMITTED", park));
  expect(remount.getByTestId("award")).toHaveTextContent("none");
  act(() => dispose());
});
