import React from "react";
import { render } from "@testing-library/react-native";

import { DistanceProgressBar } from "./DistanceProgressBar";

const mockBar = jest.fn((_props: any) => null);

jest.mock("react-native-progress", () => ({
  Bar: (props: any) => mockBar(props),
}));

jest.mock("../contexts/ThemeProvider", () => ({
  useTheme: jest.fn(() => ({
    theme: {
      progressBar: "#active",
      progressBarPaused: "#paused",
      progressBarBackground: "#bg",
      progressText: "#text",
    },
  })),
}));

jest.mock("@nozbe/watermelondb/react", () => ({
  withObservables: jest.fn(() => (Component: any) => Component),
}));

describe("DistanceProgressBar", () => {
  beforeEach(() => {
    mockBar.mockClear();
  });

  it("uses persisted user trail progress and current trail distance", () => {
    const user = { trailProgress: "1.25" };
    const currentTrail = { trailDistance: "5.00" };

    const screen = render(<DistanceProgressBar user={user} currentTrail={currentTrail} />);

    expect(mockBar).toHaveBeenCalledWith(expect.objectContaining({ progress: 0.25 }));
    expect(screen.getByTestId("trail-progress-text")).toHaveTextContent("1.25 / 5.00 mi.");
  });

  it("clamps progress at one when persisted progress exceeds the trail distance", () => {
    const user = { trailProgress: "7.50" };
    const currentTrail = { trailDistance: "5.00" };

    render(<DistanceProgressBar user={user} currentTrail={currentTrail} />);

    expect(mockBar).toHaveBeenCalledWith(expect.objectContaining({ progress: 1 }));
  });
});
