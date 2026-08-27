import React from "react";
import { render } from "@testing-library/react-native";

import WildAvatar from "../WildAvatar";

jest.mock("../../../assets/wilds/poseMap", () => ({
  __esModule: true,
  default: {
    buckey: { still: 2 },
    scout: { still: 3, wave: 4 },
  },
}));

jest.mock("rive-react-native", () => {
  const React = require("react");
  const { View } = require("react-native");

  return jest.fn((props) => <View testID={props.testID ?? "mock-rive"} {...props} />);
});

describe("WildAvatar", () => {
  it("uses Scout's Rive asset for the still pose", () => {
    const Rive = require("rive-react-native");

    render(<WildAvatar id="scout" pose="still" />);

    expect(Rive).toHaveBeenCalledWith(
      expect.objectContaining({
        testID: "wild-avatar-rive",
        artboardName: "Artboard",
        animationName: "idle",
        autoplay: true,
      }),
      expect.anything(),
    );
  });

  it("uses Scout's wave animation for the wave pose", () => {
    const Rive = require("rive-react-native");

    render(<WildAvatar id="scout" pose="wave" />);

    expect(Rive).toHaveBeenCalledWith(
      expect.objectContaining({
        testID: "wild-avatar-rive",
        artboardName: "Artboard",
        animationName: "wave",
        autoplay: true,
      }),
      expect.anything(),
    );
  });

  it("falls back to image assets for wilds without Rive files", () => {
    const { getByTestId } = render(<WildAvatar id="buckey" pose="still" />);

    expect(getByTestId("wild-avatar-image")).toBeTruthy();
  });
});
