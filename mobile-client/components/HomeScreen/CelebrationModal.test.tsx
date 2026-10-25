import React from "react";
import { AccessibilityInfo, Animated, Modal } from "react-native";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import CelebrationModal from "./CelebrationModal";

jest.mock("../../contexts/ThemeProvider", () => ({
  useTheme: () => ({ theme: { background: "#fff", text: "#111", button: "#070" } }),
}));
jest.mock("../Wilds/WildAvatar", () => {
  const { View } = require("react-native");
  return (props: any) => <View testID="celebration-wild" {...props} />;
});
const award = { kind: "park" as const, id: "park:t", userId: "u", transactionId: "t", parkId: "p", parkName: "Acadia", parkLevel: 1, amount: 200,
  newWild: { userWildId: "uw", wildId: "w", wildName: "Scout" } };
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

test("explains the combined committed park and Wild award and supports button/native dismissal", async () => {
  const dismiss = jest.fn();
  const screen = render(<CelebrationModal award={award} onDismiss={dismiss} />);
  await waitFor(() => expect(AccessibilityInfo.isReduceMotionEnabled).toHaveBeenCalled());
  expect(screen.getByText("Park complete!")).toBeTruthy();
  expect(screen.getByText("Acadia · Pass level 1")).toBeTruthy();
  expect(screen.getByText("+200 Trail Tokens")).toBeTruthy();
  expect(screen.getByText("Scout unlocked!")).toBeTruthy();
  fireEvent.press(screen.getByRole("button", { name: "Continue" }));
  expect(dismiss).toHaveBeenCalledTimes(1);
  screen.UNSAFE_getByType(Modal).props.onRequestClose();
  expect(dismiss).toHaveBeenCalledTimes(2);
});
test("respects reduced motion without hiding the award, and cleans listeners", async () => {
  const screen = render(<CelebrationModal award={award} onDismiss={jest.fn()} />);
  await waitFor(() => expect(AccessibilityInfo.isReduceMotionEnabled).toHaveBeenCalled());
  expect(screen.queryByTestId("celebration-confetti", { includeHiddenElements: true })).toBeNull();
  expect(Animated.timing).not.toHaveBeenCalled();
  expect(screen.getByText("+200 Trail Tokens")).toBeTruthy();
  screen.unmount();
  expect(remove).toHaveBeenCalled();
});
test("animates decorative confetti only when reduced motion is disabled", async () => {
  (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(false);
  const screen = render(<CelebrationModal award={award} onDismiss={jest.fn()} />);
  await waitFor(() =>
    expect(screen.getByTestId("celebration-confetti", { includeHiddenElements: true })).toBeTruthy(),
  );
  expect(Animated.timing).toHaveBeenCalled();
  act(() => motionListener(true));
  expect(screen.queryByTestId("celebration-confetti", { includeHiddenElements: true })).toBeNull();
});

test("level-up shows coherent old-to-new levels without claiming tokens or unlock", async () => {
  const screen = render(<CelebrationModal award={{ kind: "wild_level", id: "l", userId: "u", sessionId: "s", userWildId: "uw", wildId: "w", wildName: "Scout", fromLevel: 1, toLevel: 3 }} onDismiss={jest.fn()} />);
  await waitFor(() => expect(screen.getByText("Scout leveled up!")).toBeTruthy());
  expect(screen.getByText("Level 1 → 3")).toBeTruthy();
  expect(screen.queryByText(/Trail Tokens/)).toBeNull();
  expect(screen.queryByText(/unlocked/)).toBeNull();
});
test("repeat pass shows no false Wild unlock", async () => {
  const screen = render(<CelebrationModal award={{ ...award, parkLevel: 2, newWild: null }} onDismiss={jest.fn()} />);
  await waitFor(() => expect(screen.getByText("Acadia · Pass level 2")).toBeTruthy());
  expect(screen.queryByText(/unlocked/)).toBeNull();
});

test("new Wild and level-up use static existing artwork", async () => {
  const screen = render(<CelebrationModal award={award} onDismiss={jest.fn()} />);
  await waitFor(() => expect(screen.getByTestId("celebration-wild")).toBeTruthy());
  expect(screen.getByTestId("celebration-wild").props).toMatchObject({ id: "w", pose: "still", animated: false });
  screen.rerender(<CelebrationModal award={{ kind: "wild_level", id: "l", userId: "u", sessionId: "s", userWildId: "uw", wildId: "other", wildName: "Ember", fromLevel: 2, toLevel: 3 }} onDismiss={jest.fn()} />);
  expect(screen.getByTestId("celebration-wild").props).toMatchObject({ id: "other", pose: "still", animated: false });
});
