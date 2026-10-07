import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

import TrailDetailScreen from "../TrailDetailScreen";

let mockIsProMember = false;
let mockQueuedTrails: Array<{ trailId: string }> = [];
let mockAddToQueuedTrails = jest.fn();
let mockDeleteFromQueuedTrails = jest.fn();
let mockTrailTokens = 100;

jest.mock("@react-navigation/native", () => {
  const React = require("react");

  return {
    useFocusEffect: (callback: () => void) => React.useEffect(callback, []),
  };
});

jest.mock("@nozbe/watermelondb", () => ({
  Q: {
    experimentalJoinTables: jest.fn(),
    experimentalNestedJoin: jest.fn(),
    unsafeSqlQuery: jest.fn(),
  },
}));

jest.mock("@nozbe/watermelondb/react", () => ({
  useDatabase: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

jest.mock("../../components/Trails/BuyTrailModal", () => {
  const React = require("react");
  return jest.fn(() => null);
});

jest.mock("../../services/AuthContext", () => ({
  useAuthContext: jest.fn(() => ({
    isProMember: mockIsProMember,
    user: {
      id: "user-1",
      trailId: "current-trail",
      trailTokens: mockTrailTokens,
      usersQueuedTrails: mockQueuedTrails,
      usersPurchasedTrails: [],
      usersCompletedTrails: [],
      addToQueuedTrails: mockAddToQueuedTrails,
      deleteFromQueuedTrails: mockDeleteFromQueuedTrails,
      purchaseTrail: jest.fn(),
      updateUserTrail: jest.fn(),
    },
  })),
}));

jest.mock("../../contexts/ThemeProvider", () => ({
  useTheme: jest.fn(() => ({
    theme: {
      themeName: "darkTheme",
      background: "#000000",
      card: "#121212",
      shadow: "#000000",
      text: "#ffffff",
      secondaryText: "#aaaaaa",
      border: "#333333",
      button: "#13B3AC",
      buttonText: "#ffffff",
      inputBackground: "#1f1f1f",
      linkBackground: "rgb(31,33,35)",
      linkBorder: "rgb(31,33,35)",
      linkText: "rgb(249,253,255)",
      linkDisabled: "rgb(149,153,155)",
      progressBarBackground: "rgba(41,184,169, 0.2)",
      progressBar: "rgb(7,254,213)",
      progressBorder: "#f7f7f7",
      trailStatText: "#dddddd",
      statValue: "rgb(7, 254, 213)",
      statLabel: "#ffffff",
      trailHeaderText: "#ffffff",
      completedBadge: "#4caf50",
      completedBadgeText: "#ffffff",
      buttonPrimary: "#13B3AC",
      buttonPrimaryText: "#ffffff",
    },
  })),
}));

const fullTrail = {
  id: "trail-1",
  trail_name: "Misty Ridge",
  park_name: "Acadia",
  state_code: "ME",
  trail_distance: 3.2,
  trail_elevation: 450,
  trail_image_url: "https://example.com/trail.png",
  is_free: true,
  is_pro_only: false,
  trail_of_the_week: false,
};

describe("TrailDetailScreen Pro gating indicators", () => {
  beforeEach(() => {
    mockIsProMember = false;
    mockQueuedTrails = [];
    mockAddToQueuedTrails = jest.fn().mockResolvedValue({ trailId: "trail-1" });
    mockDeleteFromQueuedTrails = jest.fn().mockResolvedValue(undefined);
    mockTrailTokens = 100;
  });

  it("marks Add to Queue as a Pro action for free users", async () => {
    const screen = render(
      <TrailDetailScreen
        navigation={{ goBack: jest.fn(), navigate: jest.fn() }}
        route={{ params: { fullTrail } }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Add to Queue")).toBeTruthy();
    });

    expect(screen.getByTestId("add-to-queue-pro-badge")).toBeTruthy();
    expect(screen.getByText("Pro")).toBeTruthy();
  });

  it("hides Add to Queue Pro badge for active Pro users", async () => {
    mockIsProMember = true;

    const screen = render(
      <TrailDetailScreen
        navigation={{ goBack: jest.fn(), navigate: jest.fn() }}
        route={{ params: { fullTrail } }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Add to Queue")).toBeTruthy();
    });

    expect(screen.queryByTestId("add-to-queue-pro-badge")).toBeNull();
    expect(screen.queryByText("Pro")).toBeNull();
  });

  it("lets Pro users buy Pro-only trails with distance-based tokens instead of starting for free", async () => {
    mockIsProMember = true;

    const screen = render(
      <TrailDetailScreen
        navigation={{ goBack: jest.fn(), navigate: jest.fn() }}
        route={{ params: { fullTrail: { ...fullTrail, is_free: false, is_pro_only: true } } }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Buy 5")).toBeTruthy();
    });

    expect(screen.queryByText("Start Now")).toBeNull();
    expect(screen.queryByText("View Pro")).toBeNull();
  });

  it("shows missing token count when a user is eligible but short on trail tokens", async () => {
    mockTrailTokens = 3;

    const screen = render(
      <TrailDetailScreen
        navigation={{ goBack: jest.fn(), navigate: jest.fn() }}
        route={{ params: { fullTrail: { ...fullTrail, is_free: false, is_pro_only: false } } }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Need 2 more tokens")).toBeTruthy();
    });
  });

  it("shows Pro language for Pro-only trails instead of subscription language", async () => {
    const screen = render(
      <TrailDetailScreen
        navigation={{ goBack: jest.fn(), navigate: jest.fn() }}
        route={{ params: { fullTrail: { ...fullTrail, is_free: false, is_pro_only: true } } }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("View Pro")).toBeTruthy();
    });

    expect(screen.queryByText("Unlock With Subscription")).toBeNull();
  });

  it("updates queue state immediately after tapping Add to Queue", async () => {
    mockIsProMember = true;

    const screen = render(
      <TrailDetailScreen
        navigation={{ goBack: jest.fn(), navigate: jest.fn() }}
        route={{ params: { fullTrail } }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Add to Queue")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Add to Queue"));

    expect(screen.getByText("Remove from Queue")).toBeTruthy();
    expect(mockAddToQueuedTrails).toHaveBeenCalledWith({ trailId: "trail-1" });
  });

  it("closes trail details from the hero close button", async () => {
    const goBack = jest.fn();

    const screen = render(
      <TrailDetailScreen
        navigation={{ goBack, navigate: jest.fn() }}
        route={{ params: { fullTrail } }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Close trail details")).toBeTruthy();
    });

    fireEvent.press(screen.getByLabelText("Close trail details"));

    expect(goBack).toHaveBeenCalledTimes(1);
  });

  it("does not render empty external-link strings as raw text", async () => {
    const screen = render(
      <TrailDetailScreen
        navigation={{ goBack: jest.fn(), navigate: jest.fn() }}
        route={{
          params: {
            fullTrail: {
              ...fullTrail,
              nps_url: "",
              all_trails_url: "",
              hiking_project_url: "",
            },
          },
        }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Misty Ridge")).toBeTruthy();
    });

    expect(screen.queryByText("Explore this trail")).toBeNull();
  });
});
