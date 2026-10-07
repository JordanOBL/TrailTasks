import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import BuyTrailModal from "./BuyTrailModal";

jest.mock("../../contexts/ThemeProvider", () => {
  const { darkTheme } = require("../../theme");

  return {
    useTheme: jest.fn(() => ({ theme: darkTheme })),
  };
});

const trail = {
  id: "trail-1",
  trail_name: "Misty Ridge",
  trail_distance: 3.2,
  trail_elevation: 450,
} as any;

describe("BuyTrailModal", () => {
  it("previews cost, completion tokens, time rewards, and Wild XP before unlock", () => {
    const screen = render(
      <BuyTrailModal
        isVisible
        onClose={jest.fn()}
        trail={trail}
        trailTokens={12}
        onBuyTrail={jest.fn()}
      />,
    );

    expect(screen.getByText("Unlock trail")).toBeTruthy();
    expect(screen.getByText("Misty Ridge")).toBeTruthy();
    expect(screen.getByText(/Spend 5 tokens now/)).toBeTruthy();
    expect(screen.getByText(/earns at least 10 tokens/)).toBeTruthy();
    expect(screen.getByText(/30 Wild XP/)).toBeTruthy();
    expect(screen.getByText("Balance")).toBeTruthy();
    expect(screen.getByText("7")).toBeTruthy();
  });

  it("buys with the distance-derived unlock cost", () => {
    const onBuyTrail = jest.fn();
    const onClose = jest.fn();
    const screen = render(
      <BuyTrailModal
        isVisible
        onClose={onClose}
        trail={trail}
        trailTokens={12}
        onBuyTrail={onBuyTrail}
      />,
    );

    fireEvent.press(screen.getByText("Unlock"));

    expect(onBuyTrail).toHaveBeenCalledWith(trail, 5);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
