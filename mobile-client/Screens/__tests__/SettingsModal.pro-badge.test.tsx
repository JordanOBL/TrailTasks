import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { Alert, KeyboardAvoidingView, ScrollView, StyleSheet } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import SettingsModal from "../../components/Session/SettingsModal";

jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

let mockIsProMember = false;

jest.mock("react-native-element-dropdown", () => {
  const React = require("react");
  const { Text } = require("react-native");

  return {
    Dropdown: ({ placeholder, testID }: any) => <Text testID={testID}>{placeholder}</Text>,
  };
});

jest.mock("../../services/AuthContext", () => ({
  useAuthContext: jest.fn(() => ({
    isProMember: mockIsProMember,
  })),
}));

const sessionCfg = {
  session: null,
  sessionId: "session-1",
  type: "solo",
  userId: "user-1",
  sessionName: "Morning hike",
  sessionDescription: "",
  sessionCategory: ["cat-1", "Focus"],
  totalSets: 3,
  distanceNeeded: Infinity,
  currentTrailDistance: 0,
  completedTrails: 0,
  currentPaceMph: 2,
  minPaceMph: 2,
  maxPaceMph: 5.5,
  paceIncreaseValueMph: 0.25,
  paceIncreaseIntervalSec: 900,
  autoContinue: false,
  focusTimeSec: 1500,
  shortBreakSec: 300,
  longBreakSec: 2700,
  tokenBonusFlat: 0,
  tokenBonusPercent: 0,
  backpack: [],
};

describe("SettingsModal Pro indicators", () => {
  it("bounds the sheet and keeps its save action accessible while editing", () => {
    const setVisible = jest.fn();
    const result = render(
      <SettingsModal
        visible
        sessionCfg={sessionCfg as any}
        setSessionCfg={jest.fn()}
        setVisible={setVisible}
        sessionCategories={[]}
      />,
    );
    expect(result.UNSAFE_getByType(KeyboardAvoidingView)).toBeTruthy();
    expect(result.UNSAFE_getByType(SafeAreaView).props.edges).toEqual(["left", "right", "bottom"]);
    expect(
      StyleSheet.flatten(result.getByTestId("session-settings-sheet").props.style).maxHeight,
    ).toBe("90%");
    expect(result.UNSAFE_getByType(ScrollView).props.keyboardShouldPersistTaps).toBe("handled");
    const save = result.getByRole("button", { name: "Save & Close" });
    expect(StyleSheet.flatten(save.props.style)).toMatchObject({ minHeight: 48, flexShrink: 0 });
    fireEvent.press(save);
    expect(setVisible).toHaveBeenCalledWith(false);
  });
  it("explains instant saving and labels the editable session title", () => {
    const result = render(
      <SettingsModal
        visible
        sessionCfg={sessionCfg as any}
        setSessionCfg={jest.fn()}
        setVisible={jest.fn()}
        sessionCategories={[]}
      />,
    );
    expect(result.getByText("Changes are saved as you go.")).toBeTruthy();
    expect(result.getByLabelText("Session title")).toBeTruthy();
    expect(StyleSheet.flatten(result.getByTestId("focus-time-field").props.style).width).toBe(
      "100%",
    );
  });

  it("lets Pro members edit the set count without changing auto-continue", () => {
    mockIsProMember = true;
    const setSessionCfg = jest.fn();
    const result = render(
      <SettingsModal
        visible
        sessionCfg={sessionCfg as any}
        setSessionCfg={setSessionCfg}
        setVisible={jest.fn()}
        sessionCategories={[]}
      />,
    );
    fireEvent.changeText(result.getByTestId("sets-input"), "4");
    expect(setSessionCfg).toHaveBeenCalledTimes(1);
    expect(setSessionCfg.mock.calls[0][0](sessionCfg)).toEqual({ ...sessionCfg, totalSets: 4 });
    setSessionCfg.mockClear();
    fireEvent.changeText(result.getByTestId("sets-input"), "0");
    fireEvent.changeText(result.getByTestId("sets-input"), "2.5");
    fireEvent.changeText(result.getByTestId("sets-input"), "9007199254740992");
    fireEvent.changeText(result.getByTestId("sets-input"), "");
    expect(setSessionCfg).not.toHaveBeenCalled();
  });

  it("keeps Sets and Auto-Continue gated for free accounts", () => {
    const alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    const setSessionCfg = jest.fn();
    try {
      const result = render(
        <SettingsModal
          visible
          sessionCfg={sessionCfg as any}
          setSessionCfg={setSessionCfg}
          setVisible={jest.fn()}
          sessionCategories={[]}
        />,
      );
      fireEvent.changeText(result.getByTestId("sets-input"), "4");
      fireEvent(result.getByTestId("auto-continue-switch"), "valueChange", true);
      expect(alert).toHaveBeenCalledTimes(2);
      expect(setSessionCfg).toHaveBeenCalledTimes(2);
      for (const [update] of setSessionCfg.mock.calls) {
        expect(update(sessionCfg)).toEqual(sessionCfg);
      }
    } finally {
      alert.mockRestore();
    }
  });

  beforeEach(() => {
    mockIsProMember = false;
  });

  it("groups custom time, sets, and auto-continue controls in one Pro section", () => {
    const screen = render(
      <SettingsModal
        visible
        sessionCfg={sessionCfg as any}
        setSessionCfg={jest.fn()}
        setVisible={jest.fn()}
        sessionCategories={[]}
      />,
    );

    expect(screen.getByTestId("session-settings-pro-section")).toBeTruthy();
    expect(screen.getByText("Subscribe to customize your session flow")).toBeTruthy();
    expect(screen.getByText("Focus Time")).toBeTruthy();
    expect(screen.getByText("Short Break")).toBeTruthy();
    expect(screen.getByText("Long Break")).toBeTruthy();
    expect(screen.getByText("Sets")).toBeTruthy();
    expect(screen.getByText("Auto-Continue")).toBeTruthy();
    expect(screen.getAllByText("Pro")).toHaveLength(1);
  });

  it("hides the Pro label after the user has an active Pro entitlement", () => {
    mockIsProMember = true;

    const screen = render(
      <SettingsModal
        visible
        sessionCfg={sessionCfg as any}
        setSessionCfg={jest.fn()}
        setVisible={jest.fn()}
        sessionCategories={[]}
      />,
    );

    expect(screen.queryByText("Pro")).toBeNull();
    expect(screen.getByText("Customize your session flow")).toBeTruthy();
  });
});
