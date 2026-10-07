import React from "react";
import { render, waitFor } from "@testing-library/react-native";

import { HomeScreen } from "../HomeScreen";

jest.mock("../../components/DistanceProgressBar", () => {
  const React = require("react");
  const { Text } = require("react-native");

  return function MockDistanceProgressBar(props: any) {
    return (
      <Text testID="distance-progress-props">
        {props.user.trailProgress}:{props.currentTrail.trailName}:{props.currentTrail.trailDistance}
      </Text>
    );
  };
});

jest.mock("../../components/HomeScreen/HomeScreenLinks", () => {
  const React = require("react");
  const { View } = require("react-native");

  return function MockHomeScreenLinks() {
    return <View testID="home-screen-links" />;
  };
});

jest.mock("../../components/syncButton", () => {
  const React = require("react");
  const { View } = require("react-native");

  return function MockSyncButton() {
    return <View testID="sync-button" />;
  };
});

jest.mock("../../components/HomeScreen/tutorialModal", () => {
  const React = require("react");
  const { View } = require("react-native");

  return function MockTutorialModal() {
    return <View testID="tutorial-modal" />;
  };
});

jest.mock("../../components/Wilds/WildAvatar", () => {
  const React = require("react");
  const { Text } = require("react-native");

  return function MockWildAvatar(props: any) {
    return <Text testID="wild-avatar">{props.id}</Text>;
  };
});

jest.mock("../../components/HomeScreen/XpRing", () => {
  const React = require("react");
  const { View } = require("react-native");

  return function MockXpRing({ children }: any) {
    return <View testID="xp-ring">{children}</View>;
  };
});

jest.mock("../../helpers/ErrorHandler", () => jest.fn());
jest.mock("../../watermelon/sync", () => ({ sync: jest.fn() }));
jest.mock("@nozbe/watermelondb/sync", () => ({ hasUnsyncedChanges: jest.fn(() => Promise.resolve(false)) }));
jest.mock("@nozbe/watermelondb/react", () => ({
  useDatabase: jest.fn(() => ({})),
  withObservables: jest.fn(() => (Component: any) => Component),
}));
jest.mock("@react-navigation/native", () => ({
  useFocusEffect: jest.fn((callback: any) => callback()),
}));
jest.mock("../../contexts/InternetConnectionProvider", () => ({
  useInternetConnection: jest.fn(() => ({ isConnected: true })),
}));
jest.mock("../../helpers/RevenueCat/useRevenueCat", () => jest.fn());
jest.mock("../../contexts/ThemeProvider", () => ({
  useTheme: jest.fn(() => ({
    theme: {
      background: "#000",
      text: "#fff",
      button: "#fff",
      progressBar: "#0ff",
    },
  })),
}));
jest.mock("../../services/AuthContext", () => ({
  useAuthContext: jest.fn(() => ({
    currentOffering: null,
    customerInfo: null,
    isProMember: false,
  })),
}));

describe("HomeScreen progress fields", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const baseUser = {
    id: "user-1",
    totalMiles: "999.00",
    calculateTotalMiles: jest.fn(() => Promise.resolve(12.34)),
    calculateTrailTokenBalance: jest.fn(() => Promise.resolve(77)),
    trailProgress: "1.25",
    dailyStreak: 3,
  };

  const currentTrail = {
    id: "trail-1",
    trailName: "MVP Trail",
    trailDistance: "3.50",
  };

  const navigation = { navigate: jest.fn() };

  it("renders Home progress from the observed WatermelonDB props", async () => {
    const activeWilds = [
      {
        wildId: "ember",
        xp: 42,
        xpToNext: 100,
      },
    ];

    const screen = render(
      <HomeScreen
        user={baseUser as any}
        currentTrail={currentTrail}
        navigation={navigation}
        setUser={jest.fn()}
        userWilds={activeWilds}
        activeWilds={activeWilds as any}
      />,
    );

    await waitFor(() => {
      expect(baseUser.calculateTrailTokenBalance).toHaveBeenCalled();
      expect(screen.getByTestId("trail-tokens")).toHaveTextContent("77");
    });
    await waitFor(() => {
      expect(baseUser.calculateTotalMiles).toHaveBeenCalled();
      expect(screen.getByTestId("total-miles")).toHaveTextContent("12.3");
    });
    expect(screen.getByTestId("current-wild")).toHaveTextContent("ember");
    expect(screen.getByTestId("wild-xp")).toHaveTextContent("42 / 100 XP");
    expect(screen.getByTestId("wild-avatar")).toHaveTextContent("ember");
    expect(screen.getByTestId("current-trail")).toHaveTextContent("MVP Trail");
    expect(screen.getByTestId("distance-progress-props")).toHaveTextContent("1.25:MVP Trail:3.50");
  });
});
