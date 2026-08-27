import React from "react";
import { render } from "@testing-library/react-native";

import { HomeScreen } from "../HomeScreen";

const mockWildAvatar = jest.fn(() => null);

jest.mock("../../components/Wilds/WildAvatar", () => ({
  __esModule: true,
  default: (props: any) => mockWildAvatar(props),
}));

jest.mock("../../components/HomeScreen/XpRing", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("../../components/DistanceProgressBar", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("../../components/HomeScreen/HomeScreenLinks", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("../../components/syncButton", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("../../components/HomeScreen/tutorialModal", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@nozbe/watermelondb/react", () => ({
  useDatabase: () => ({}),
  withObservables: () => (Component: React.ComponentType<any>) => Component,
}));

jest.mock("../../contexts/InternetConnectionProvider", () => ({
  useInternetConnection: () => ({ isConnected: true }),
}));

jest.mock("../../services/AuthContext", () => ({
  useAuthContext: () => ({
    currentOffering: null,
    customerInfo: null,
    isProMember: false,
  }),
}));

jest.mock("@react-navigation/native", () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock("@nozbe/watermelondb/sync", () => ({
  hasUnsyncedChanges: jest.fn().mockResolvedValue(false),
}));

jest.mock("../../watermelon/sync", () => ({
  sync: jest.fn(),
}));

jest.mock("../../helpers/Session/checkDailyStreak", () => jest.fn());
jest.mock("../../helpers/Ranks/getUserRank", () => jest.fn(() => ({ range: [] })));
jest.mock("../../helpers/ErrorHandler", () => jest.fn());

describe("HomeScreen active wild avatar", () => {
  const baseProps = {
    user: {
      id: "user-1",
      totalMiles: 1,
      trailTokens: 5,
      dailyStreak: 0,
    } as any,
    currentTrail: {
      id: "trail-1",
      trailName: "Mock Trail",
    },
    navigation: { navigate: jest.fn() },
    setUser: jest.fn(),
    userWilds: [],
  };

  beforeEach(() => {
    mockWildAvatar.mockClear();
  });

  it("keeps Scout on the still pose on the home page until an animated asset exists", () => {
    render(
      <HomeScreen
        {...baseProps}
        activeWilds={[{ wildId: "scout", xp: 10, xpToNext: 100 } as any]}
      />,
    );

    expect(mockWildAvatar).toHaveBeenCalledWith(
      expect.objectContaining({ id: "scout", pose: "still", size: 100 }),
    );
  });

  it("keeps non-Rive wilds on the still image pose", () => {
    render(
      <HomeScreen
        {...baseProps}
        activeWilds={[{ wildId: "buckey", xp: 10, xpToNext: 100 } as any]}
      />,
    );

    expect(mockWildAvatar).toHaveBeenCalledWith(
      expect.objectContaining({ id: "buckey", pose: "still", size: 100 }),
    );
  });
});
