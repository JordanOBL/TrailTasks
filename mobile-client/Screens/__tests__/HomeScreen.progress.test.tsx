import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { HomeScreen } from "../HomeScreen";
import { withObservables } from "@nozbe/watermelondb/react";
import { testDb } from "../../watermelon/testDB";
import { User, User_Session } from "../../watermelon/models";

// Capture the real Home subscription factory before beforeEach clears mock calls.
const observeHomeProps = (withObservables as jest.Mock).mock.calls[0][1];
let mockHomeRewardService: any = null;
let mockHomeFocused = true;
const mockHomeBus = { on: jest.fn(() => ({ unregister: jest.fn() })) };
jest.mock("../../contexts/ServiceProvider", () => ({
  useServices: () => ({ rewardService: mockHomeRewardService, bus: mockHomeBus }),
}));
jest.mock("../../components/HomeScreen/CelebrationModal", () => {
  const React = require("react");
  const { Text, TouchableOpacity } = require("react-native");
  return ({ award, onDismiss }: any) => (
    <TouchableOpacity testID="streak-modal" onPress={onDismiss}>
      <Text>
        {award.kind}
      </Text>
    </TouchableOpacity>
  );
});

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
jest.mock("@nozbe/watermelondb/sync", () => ({
  hasUnsyncedChanges: jest.fn(() => Promise.resolve(false)),
}));
jest.mock("@nozbe/watermelondb/react", () => ({
  useDatabase: jest.fn(() => ({})),
  withObservables: jest.fn(() => (Component: any) => Component),
}));
jest.mock("@react-navigation/native", () => ({
  useFocusEffect: jest.fn((callback: any) => callback()),
  useIsFocused: () => mockHomeFocused,
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

describe("Home mileage query subscription", () => {
  it("refreshes when distance changes on the same session rows, without membership changes", async () => {
    const { user, currentSession } = await testDb.write(async () => {
      await testDb.unsafeResetDatabase();
      const user = await testDb.get<User>("users").create(record => {
        record.username = "home-observer";
        record.email = "home-observer@example.com";
        record.password = "test-password";
        record.trailId = "trail-1";
      });
      const createSession = (distance: number) =>
        testDb.get<User_Session>("users_sessions").create(record => {
          record.userId = user.id;
          record.totalDistanceHiked = distance;
          record.totalSessionTime = 0;
          record.dateAdded = new Date().toISOString();
        });
      await createSession(82.81);
      const currentSession = await createSession(0);
      return { user, currentSession };
    });
    const unchangedOtherQuery = { observe: () => null, extend: () => ({ observe: () => null }) };
    const homeProps = observeHomeProps({
      user: {
        observe: () => null,
        trail: unchangedOtherQuery,
        usersSessions: user.usersSessions,
        tokenTransactions: unchangedOtherQuery,
        usersWilds: unchangedOtherQuery,
      },
    });
    const totals: number[] = [];
    const memberships: string[][] = [];
    const subscription = homeProps.userSessions.subscribe((sessions: User_Session[]) => {
      memberships.push(sessions.map(session => session.id));
      void user.calculateTotalMiles().then(total => totals.push(total));
    });
    try {
      await waitFor(() => expect(totals[totals.length - 1]).toBe(82.81));
      await testDb.write(() =>
        currentSession.update(session => {
          session.totalDistanceHiked = 0.48;
        }),
      );
      await waitFor(() => expect(totals[totals.length - 1]).toBe(83.29));
      expect(memberships[memberships.length - 1]).toEqual(memberships[0]);
    } finally {
      subscription.unsubscribe();
    }
  });
});

describe("HomeScreen progress fields", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHomeRewardService = null;
    mockHomeFocused = true;
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

  it("shows a queued park award only on focused Home and dismisses it", async () => {
    let pending = [
      {
        kind: "park",
        id: "park:txn-1",
        transactionId: "txn-1",
        userId: baseUser.id,
        sessionId: "session-1",
        amount: 15,
        dailyStreak: 3,
      },
    ];
    const listeners = new Set<() => void>();
    mockHomeRewardService = {
      getCelebrations: () => pending,
      subscribe: (fn: () => void) => {
        listeners.add(fn);
        return () => listeners.delete(fn);
      },
      acknowledgeCelebration: jest.fn(() => {
        pending = [];
        listeners.forEach(fn => fn());
      }),
    };
    mockHomeFocused = false;
    const props = {
      user: baseUser as any,
      currentTrail,
      navigation,
      setUser: jest.fn(),
      userWilds: [],
      activeWilds: [],
    };
    const screen = render(<HomeScreen {...props} />);
    await waitFor(() => expect(screen.getByTestId("total-miles")).toHaveTextContent(/^12\.34$/));
    expect(screen.queryByTestId("streak-modal")).toBeNull();
    mockHomeFocused = true;
    screen.rerender(<HomeScreen {...props} />);
    expect(screen.getByTestId("streak-modal")).toHaveTextContent("park");
    fireEvent.press(screen.getByTestId("streak-modal"));
    expect(mockHomeRewardService.acknowledgeCelebration).toHaveBeenCalledWith("park:txn-1");
    expect(screen.queryByTestId("streak-modal")).toBeNull();
  });

  it("pads Home mileage to two decimal places like Stats", async () => {
    baseUser.calculateTotalMiles.mockResolvedValueOnce(83.2);
    const screen = render(
      <HomeScreen
        user={baseUser as any}
        currentTrail={currentTrail}
        navigation={navigation}
        setUser={jest.fn()}
        userWilds={[]}
        activeWilds={[]}
      />,
    );
    await waitFor(() => expect(screen.getByTestId("total-miles")).toHaveTextContent(/^83\.20$/));
  });

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
      expect(screen.getByTestId("total-miles")).toHaveTextContent(/^12\.34$/);
    });
    expect(screen.getByTestId("current-wild")).toHaveTextContent("ember");
    expect(screen.getByTestId("wild-xp")).toHaveTextContent("42 / 100 XP");
    expect(screen.getByTestId("wild-avatar")).toHaveTextContent("ember");
    expect(screen.getByTestId("current-trail")).toHaveTextContent("MVP Trail");
    expect(screen.getByTestId("distance-progress-props")).toHaveTextContent("1.25:MVP Trail:3.50");
  });
});
