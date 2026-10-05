import React from "react";
import { render } from "@testing-library/react-native";

import TrailCard from "./TrailCard";

jest.mock("../../services/AuthContext", () => ({
  useAuthContext: jest.fn(() => ({
    isProMember: false,
    user: { trailId: "current-trail" },
  })),
}));

jest.mock("../../contexts/ThemeProvider", () => {
  const { darkTheme } = require("../../theme");

  return {
    useTheme: jest.fn(() => ({ theme: darkTheme })),
  };
});

const trail = {
  id: "trail-1",
  trail_name: "Misty Ridge",
  _changed: "",
  _status: "created",
  all_trails_url: null,
  hiking_project_url: null,
  is_free: true,
  is_subscribers_only: false,
  nps_url: "",
  park_id: "park-1",
  park_image_url: null,
  park_name: "Acadia",
  park_type: "National Park",
  state: "Maine",
  state_code: "ME",
  trail_difficulty: "Moderate",
  trail_distance: "3.2",
  trail_elevation: "450",
  trail_image_url: null,
  trail_lat: "0",
  trail_long: "0",
  trail_of_the_week: "",
} as any;

describe("TrailCard", () => {
  it("does not render an empty trail-of-the-week flag as raw text", () => {
    const screen = render(
      <TrailCard trail={trail} isQueued={false} handleTrailPress={jest.fn()} />,
    );

    expect(screen.getByText("Misty Ridge")).toBeTruthy();
    expect(screen.queryByText("★ This Week")).toBeNull();
  });
});
