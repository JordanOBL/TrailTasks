import React from "react";
import { render, waitFor } from "@testing-library/react-native";

import TrailDetailScreen from "../TrailDetailScreen";

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
    isProMember: false,
    user: {
      id: "user-1",
      trailId: "current-trail",
      trailTokens: 100,
      usersQueuedTrails: [],
      usersPurchasedTrails: [],
      usersCompletedTrails: [],
      addToQueuedTrails: jest.fn(),
      deleteFromQueuedTrails: jest.fn(),
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
  is_subscribers_only: false,
  trail_of_the_week: false,
};

describe("TrailDetailScreen Pro gating indicators", () => {
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
});
