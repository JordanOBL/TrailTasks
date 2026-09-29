import React from "react";
import { render, waitFor } from "@testing-library/react-native";

import LogbookScreen from "../LogbookScreen";

const mockCompletedSessions = [
  {
    id: "session-2",
    sessionName: "Evening hike",
    sessionDescription: "Second completed session",
    sessionCategoryName: "Deep Work",
    totalSessionTime: 1800,
    totalDistanceHiked: "1.25",
    dateAdded: "2026-08-27T19:00:00.000Z",
  },
  {
    id: "session-1",
    sessionName: "Morning hike",
    sessionDescription: "First completed session",
    sessionCategoryName: "Trail Work",
    totalSessionTime: 3600,
    totalDistanceHiked: "2.50",
    dateAdded: "2026-08-27T09:00:00.000Z",
  },
];

let mockUser: any = {
  id: "user-1",
  usersParks: [],
  usersWilds: [],
  usersSessions: Promise.resolve(mockCompletedSessions),
};

jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (callback: () => void) => {
    const React = require("react");
    React.useEffect(() => {
      callback();
    }, []);
  },
}));

jest.mock("@nozbe/watermelondb", () => ({
  Q: {
    where: jest.fn((field, value) => ({ field, value })),
  },
}));

const mockDb = {
  get: jest.fn((collectionName: string) => ({
    query: jest.fn(() => ({
      fetch: jest.fn(() => {
        if (collectionName === "parks_wilds") return Promise.resolve([]);
        if (collectionName === "parks") return Promise.resolve([]);
        if (collectionName === "wilds") return Promise.resolve([]);
        return Promise.resolve([]);
      }),
    })),
  })),
};

jest.mock("@nozbe/watermelondb/react", () => ({
  useDatabase: jest.fn(() => mockDb),
}));

jest.mock("../../services/AuthContext", () => ({
  useAuthContext: jest.fn(() => ({ user: mockUser })),
}));

jest.mock("../../contexts/ThemeProvider", () => ({
  useTheme: jest.fn(() => ({
    theme: {
      background: "#000000",
      card: "#121212",
      text: "#ffffff",
      secondaryText: "#aaaaaa",
      border: "#333333",
      button: "#13B3AC",
    },
  })),
}));

jest.mock("../../components/Parks/ParkCard", () => {
  const React = require("react");
  const { Text } = require("react-native");

  return ({ parkName }: any) => <Text>{parkName}</Text>;
});

jest.mock("../../components/Wilds/WildAvatar", () => {
  const React = require("react");
  const { Text } = require("react-native");

  return ({ id }: any) => <Text>{id}</Text>;
});

describe("LogbookScreen", () => {
  beforeEach(() => {
    mockUser = {
      id: "user-1",
      usersParks: [],
      usersWilds: [],
      usersSessions: Promise.resolve(mockCompletedSessions),
    };
  });

  it("shows completed solo sessions before the park pass collection", async () => {
    const screen = render(<LogbookScreen navigation={{ navigate: jest.fn() }} />);

    await waitFor(() => {
      expect(screen.getByTestId("completed-sessions-section")).toBeTruthy();
      expect(screen.getByText("Completed Sessions")).toBeTruthy();
      expect(screen.getByTestId("logbook-session-session-2")).toBeTruthy();
      expect(screen.getByText("Evening hike")).toBeTruthy();
      expect(screen.getByText("Deep Work")).toBeTruthy();
      expect(screen.getByText("1.25 mi")).toBeTruthy();
      expect(screen.getByText("30 min")).toBeTruthy();
    });

    expect(screen.getByTestId("park-pass-count")).toHaveTextContent("0 / 0");
  });

  it("shows a friendly empty state when no sessions have been completed", async () => {
    mockUser = {
      ...mockUser,
      usersSessions: Promise.resolve([]),
    };

    const screen = render(<LogbookScreen navigation={{ navigate: jest.fn() }} />);

    await waitFor(() => {
      expect(screen.getByTestId("completed-sessions-empty-state")).toBeTruthy();
      expect(screen.getByText("No completed sessions yet")).toBeTruthy();
    });
  });
});
