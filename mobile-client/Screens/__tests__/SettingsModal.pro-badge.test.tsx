import React from "react";
import { render } from "@testing-library/react-native";

import SettingsModal from "../../components/Session/SettingsModal";

jest.mock("react-native-element-dropdown", () => {
  const React = require("react");
  const { Text } = require("react-native");

  return {
    Dropdown: ({ placeholder, testID }: any) => <Text testID={testID}>{placeholder}</Text>,
  };
});

jest.mock("../../services/AuthContext", () => ({
  useAuthContext: jest.fn(() => ({
    isProMember: false,
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
    expect(screen.getByText("Customize your session flow")).toBeTruthy();
    expect(screen.getByText("Focus Time")).toBeTruthy();
    expect(screen.getByText("Short Break")).toBeTruthy();
    expect(screen.getByText("Long Break")).toBeTruthy();
    expect(screen.getByText("Sets")).toBeTruthy();
    expect(screen.getByText("Auto-Continue")).toBeTruthy();
    expect(screen.getAllByText("Pro")).toHaveLength(1);
  });
});
