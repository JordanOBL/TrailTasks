import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { act, fireEvent, render } from "@testing-library/react-native";
import { useDailyStreakReward } from "./useDailyStreakReward";

let mockFocused = true;
let mockService: any;
let mockBus: any;
jest.mock("@react-navigation/native", () => ({ useIsFocused: () => mockFocused }));
jest.mock("../contexts/ServiceProvider", () => ({
  useServices: () => ({ rewardService: mockService, bus: mockBus }),
}));

function service() {
  let pending: any[] = [];
  return {
    getPending: () => pending,
    acknowledge: jest.fn((id: string) => {
      pending = pending.filter(a => a.transactionId !== id);
    }),
    enqueue: (award: any) => {
      pending = [...pending, award];
      mockBus.emit(award);
    },
    listenerCount: () => mockBus.listeners.size,
  };
}
const award = {
  transactionId: "transaction-1",
  userId: "user-1",
  sessionId: "session-1",
  amount: 15,
  dailyStreak: 3,
};
function Probe({ userId = "user-1" }: { userId?: string }) {
  const reward = useDailyStreakReward(userId);
  return (
    <>
      <Text testID="award">
        {reward.award ? `${reward.award.amount}:${reward.award.dailyStreak}` : "none"}
      </Text>
      <TouchableOpacity testID="dismiss" onPress={reward.dismiss}>
        <Text>Dismiss</Text>
      </TouchableOpacity>
    </>
  );
}

beforeEach(() => {
  mockFocused = true;
  const listeners = new Set<() => void>();
  mockBus = {
    listeners,
    on: jest.fn((_event, listener) => {
      listeners.add(listener);
      return { unregister: jest.fn(() => listeners.delete(listener)) };
    }),
    emit: (_award: any) => listeners.forEach(fn => fn()),
  };
  mockService = service();
});

test("receives an award queued before Home mounts, and waits until Home is focused", () => {
  mockService.enqueue(award);
  mockFocused = false;
  const screen = render(<Probe />);
  expect(screen.getByTestId("award")).toHaveTextContent("none");
  mockFocused = true;
  screen.rerender(<Probe />);
  expect(screen.getByTestId("award")).toHaveTextContent("15:3");
});
test("reacts to a live committed notification and acknowledges on dismissal", () => {
  const screen = render(<Probe />);
  act(() => mockService.enqueue(award));
  expect(screen.getByTestId("award")).toHaveTextContent("15:3");
  fireEvent.press(screen.getByTestId("dismiss"));
  expect(mockService.acknowledge).toHaveBeenCalledWith("transaction-1");
  expect(screen.getByTestId("award")).toHaveTextContent("none");
  screen.rerender(<Probe />);
  expect(screen.getByTestId("award")).toHaveTextContent("none");
});
test("never displays the old account award after switching users", () => {
  mockService.enqueue(award);
  const screen = render(<Probe />);
  expect(screen.getByTestId("award")).toHaveTextContent("15:3");
  screen.rerender(<Probe userId="user-2" />);
  expect(screen.getByTestId("award")).toHaveTextContent("none");
});
test("cleans subscriptions and preserves unacknowledged award across Home remount", () => {
  const screen = render(<Probe />);
  expect(mockService.listenerCount()).toBe(1);
  act(() => mockService.enqueue(award));
  screen.unmount();
  expect(mockService.listenerCount()).toBe(0);
  const remount = render(<Probe />);
  expect(remount.getByTestId("award")).toHaveTextContent("15:3");
});
test("handles service initialization and replacement without showing old account state", () => {
  mockService = null;
  const screen = render(<Probe />);
  expect(screen.getByTestId("award")).toHaveTextContent("none");
  mockService = service();
  mockService.enqueue(award);
  screen.rerender(<Probe />);
  expect(screen.getByTestId("award")).toHaveTextContent("15:3");
  const oldRegistry = mockBus.on.mock.results[0].value;
  mockService = service();
  screen.rerender(<Probe userId="user-2" />);
  expect(oldRegistry.unregister).toHaveBeenCalled();
  expect(screen.getByTestId("award")).toHaveTextContent("none");
});
