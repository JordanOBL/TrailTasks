import React from "react";
import { render } from "@testing-library/react-native";

import TrailCard from "./TrailCard";
import { useAuthContext } from "../../services/AuthContext";

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

const mockUseAuthContext = useAuthContext as jest.MockedFunction<typeof useAuthContext>;

const trail = {
  id: "trail-1",
  trail_name: "Misty Ridge",
  _changed: "",
  _status: "created",
  all_trails_url: null,
  hiking_project_url: null,
  is_free: true,
  is_pro_only: false,
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
  beforeEach(() => {
    mockUseAuthContext.mockReturnValue({
      isProMember: false,
      user: { trailId: "current-trail" },
    } as any);
  });

  it("does not render an empty trail-of-the-week flag as raw text", () => {
    const screen = render(
      <TrailCard trail={trail} isQueued={false} handleTrailPress={jest.fn()} />,
    );

    expect(screen.getByText("Misty Ridge")).toBeTruthy();
    expect(screen.queryByText("★ This Week")).toBeNull();
  });

  it("marks monthly free Pro-only trails as free for free users", () => {
    const screen = render(
      <TrailCard
        trail={{ ...trail, is_free: true, is_pro_only: true }}
        isQueued={false}
        handleTrailPress={jest.fn()}
      />,
    );

    expect(screen.getByText("Free This Month")).toBeTruthy();
    expect(screen.queryByText("Pro")).toBeNull();
  });

  it("marks starter free trails as starter trails", () => {
    const screen = render(
      <TrailCard trail={{ ...trail, is_free: true, is_pro_only: false }} isQueued={false} handleTrailPress={jest.fn()} />,
    );

    expect(screen.getByText("Starter Trail")).toBeTruthy();
  });

  it("marks Pro-only trails as Pro for free users", () => {
    const screen = render(
      <TrailCard
        trail={{ ...trail, is_free: false, is_pro_only: true }}
        isQueued={false}
        handleTrailPress={jest.fn()}
      />,
    );

    expect(screen.getByText("Pro")).toBeTruthy();
  });

  it("marks Pro-only trails as Pro-eligible for Pro users", () => {
    mockUseAuthContext.mockReturnValue({
      isProMember: true,
      user: { trailId: "current-trail" },
    } as any);

    const screen = render(
      <TrailCard
        trail={{ ...trail, is_free: false, is_pro_only: true }}
        isQueued={false}
        handleTrailPress={jest.fn()}
      />,
    );

    expect(screen.getByText("Pro Eligible")).toBeTruthy();
    expect(screen.queryByText("Included with Pro")).toBeNull();
  });

  it("keeps browse cards focused on essentials without a footer CTA", () => {
    const screen = render(
      <TrailCard trail={trail} isQueued={false} handleTrailPress={jest.fn()} />,
    );

    expect(screen.getByText("3.2 mi")).toBeTruthy();
    expect(screen.getByText("Moderate")).toBeTruthy();
    expect(screen.queryByText("View trail →")).toBeNull();
    expect(screen.queryByText("Tap for details")).toBeNull();
  });
});
