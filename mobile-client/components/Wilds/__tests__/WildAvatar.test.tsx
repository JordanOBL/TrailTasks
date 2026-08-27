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
  beforeEach(() => {
    const Rive = require("rive-react-native");
    Rive.mockClear();
  });

  it("uses Scout's static image asset for the still pose", () => {
    const Rive = require("rive-react-native");
    const { getByTestId } = render(<WildAvatar id="scout" pose="still" />);

    expect(getByTestId("wild-avatar-image")).toBeTruthy();
    expect(Rive).not.toHaveBeenCalled();
  });

  it("uses Scout's static image asset for the wave pose until an animated Rive asset exists", () => {
    const Rive = require("rive-react-native");
    const { getByTestId } = render(<WildAvatar id="scout" pose="wave" />);

    expect(getByTestId("wild-avatar-image")).toBeTruthy();
    expect(Rive).not.toHaveBeenCalled();
  });

  it("falls back to image assets for wilds without Rive files", () => {
    const { getByTestId } = render(<WildAvatar id="buckey" pose="still" />);

    expect(getByTestId("wild-avatar-image")).toBeTruthy();
  });
});
