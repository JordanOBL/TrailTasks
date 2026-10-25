import React from "react";
import { render } from "@testing-library/react-native";
import SessionTimer from "./SessionTimer";
import { SessionSnapshot } from "../../sessionEngine/sessionEngine";

const snapshot = {
  phase: "FOCUS",
  focusTimeSec: 300,
  shortBreakSec: 300,
  longBreakSec: 300,
  elapsedInPhaseSec: 0,
  totalElapsedSec: 0,
  isPaused: false,
} as SessionSnapshot;

describe("SessionTimer", () => {
  test.each(["FOCUS", "SHORT_BREAK", "LONG_BREAK"])("clamps an expired %s countdown", phase => {
    const screen = render(
      <SessionTimer snapshot={{ ...snapshot, phase, elapsedInPhaseSec: 301 }} />,
    );
    expect(screen.getAllByText("00:00")).toHaveLength(2);
  });

  test.each([NaN, Infinity, -Infinity])("does not display non-finite time %s", invalid => {
    const screen = render(
      <SessionTimer
        snapshot={{ ...snapshot, elapsedInPhaseSec: invalid, totalElapsedSec: invalid }}
      />,
    );
    expect(screen.getAllByText("00:00")).toHaveLength(2);
  });

  test("renders the reset focus countdown after a skipped break", () => {
    const screen = render(
      <SessionTimer snapshot={{ ...snapshot, phase: "SHORT_BREAK", elapsedInPhaseSec: 300 }} />,
    );
    screen.rerender(<SessionTimer snapshot={snapshot} />);
    expect(screen.getByText("05:00")).toBeTruthy();
  });
});
