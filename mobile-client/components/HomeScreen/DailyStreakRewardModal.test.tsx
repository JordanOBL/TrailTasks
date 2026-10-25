import React from "react";
import { AccessibilityInfo, Animated, Modal } from "react-native";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import DailyStreakRewardModal from "./DailyStreakRewardModal";

jest.mock("../../contexts/ThemeProvider", () => ({
  useTheme: () => ({ theme: { background: "#fff", text: "#111", button: "#070" } }),
}));
const award = {
  transactionId: "txn-1",
  sessionId: "session-1",
  userId: "user-1",
  amount: 15,
  dailyStreak: 3,
};
let motionListener: (value: boolean) => void;
let remove: jest.Mock;
beforeEach(() => {
  remove = jest.fn();
  jest.spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockResolvedValue(true);
  // RN overloads the handler type for each event; this test stubs only reduceMotionChanged.
  jest.spyOn(AccessibilityInfo, "addEventListener").mockImplementation(((
    _event: string,
    listener: (value: boolean) => void,
  ) => {
    motionListener = listener;
    return { remove };
  }) as any);
  jest
    .spyOn(Animated, "timing")
    .mockReturnValue({ start: jest.fn(), stop: jest.fn(), reset: jest.fn() });
});
afterEach(() => jest.restoreAllMocks());

test("explains the committed daily award and supports button/native dismissal", async () => {
  const dismiss = jest.fn();
  const screen = render(<DailyStreakRewardModal award={award} onDismiss={dismiss} />);
  await waitFor(() => expect(AccessibilityInfo.isReduceMotionEnabled).toHaveBeenCalled());
  expect(screen.getByText("Daily streak reward!")).toBeTruthy();
  expect(screen.getByText("Day 3 streak")).toBeTruthy();
  expect(screen.getByText("+15 Trail Tokens")).toBeTruthy();
  expect(screen.getByText("Added to your token balance.")).toBeTruthy();
  fireEvent.press(screen.getByRole("button", { name: "Continue" }));
  expect(dismiss).toHaveBeenCalledTimes(1);
  screen.UNSAFE_getByType(Modal).props.onRequestClose();
  expect(dismiss).toHaveBeenCalledTimes(2);
});
test("respects reduced motion without hiding the award, and cleans listeners", async () => {
  const screen = render(<DailyStreakRewardModal award={award} onDismiss={jest.fn()} />);
  await waitFor(() => expect(AccessibilityInfo.isReduceMotionEnabled).toHaveBeenCalled());
  expect(screen.queryByTestId("streak-confetti", { includeHiddenElements: true })).toBeNull();
  expect(Animated.timing).not.toHaveBeenCalled();
  expect(screen.getByText("+15 Trail Tokens")).toBeTruthy();
  screen.unmount();
  expect(remove).toHaveBeenCalled();
});
test("animates decorative confetti only when reduced motion is disabled", async () => {
  (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(false);
  const screen = render(<DailyStreakRewardModal award={award} onDismiss={jest.fn()} />);
  await waitFor(() =>
    expect(screen.getByTestId("streak-confetti", { includeHiddenElements: true })).toBeTruthy(),
  );
  expect(Animated.timing).toHaveBeenCalled();
  act(() => motionListener(true));
  expect(screen.queryByTestId("streak-confetti", { includeHiddenElements: true })).toBeNull();
});
