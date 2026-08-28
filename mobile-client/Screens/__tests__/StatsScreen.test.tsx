import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

import StatsScreen from "../StatsScreen";

const mockSessions = [
  {
    id: "session-2",
    user_id: "user-1",
    session_category_id: "cat-2",
    session_category_name: "Deep Work",
    session_name: "Evening hike",
    session_description: "Second completed session",
    total_session_time: 1800,
    total_distance_hiked: "1.25",
    date_added: "2026-08-27T19:00:00.000Z",
  },
  {
    id: "session-1",
    user_id: "user-1",
    session_category_id: "cat-1",
    session_category_name: "Trail Work",
    session_name: "Morning hike",
    session_description: "First completed session",
    total_session_time: 3600,
    total_distance_hiked: "2.50",
    date_added: "2026-08-27T09:00:00.000Z",
  },
];

const mockCategories = [
  { id: "cat-1", sessionCategoryName: "Trail Work" },
  { id: "cat-2", sessionCategoryName: "Deep Work" },
];

let mockIsProMember = true;
let mockRawSessions = mockSessions;

const mockUnsafeFetchRaw = jest.fn(() => Promise.resolve(mockRawSessions));
const mockFetchCategories = jest.fn(() => Promise.resolve(mockCategories));

jest.mock("@nozbe/watermelondb", () => ({
  Q: {
    unsafeSqlQuery: jest.fn((query, params) => ({ query, params })),
  },
}));

jest.mock("@nozbe/watermelondb/react", () => ({
  useDatabase: jest.fn(() => ({
    get: jest.fn((collectionName: string) => {
      if (collectionName === "users_sessions") {
        return {
          query: jest.fn(() => ({
            unsafeFetchRaw: mockUnsafeFetchRaw,
          })),
        };
      }

      return {
        query: jest.fn(() => ({
          fetch: mockFetchCategories,
        })),
      };
    }),
  })),
}));

jest.mock("../../contexts/ThemeProvider", () => {
  const React = require("react");

  return {
    ThemeProvider: ({ children }: any) => <>{children}</>,
    useTheme: jest.fn(() => ({
      theme: {
        background: "#000000",
        card: "#121212",
        text: "#ffffff",
        secondaryText: "#aaaaaa",
        border: "#333333",
        button: "#13B3AC",
        buttonText: "#ffffff",
        inputBackground: "#1f1f1f",
        linkDisabled: "#777777",
      },
    })),
  };
});

jest.mock("../../services/AuthContext", () => ({
  useAuthContext: jest.fn(() => ({
    isProMember: mockIsProMember,
  })),
}));

jest.mock("../../helpers/ErrorHandler", () => jest.fn());

jest.mock("react-native-element-dropdown", () => {
  const React = require("react");
  const { Text } = require("react-native");

  return {
    Dropdown: ({ placeholder }: any) => <Text>{placeholder}</Text>,
  };
});

const user = {
  id: "user-1",
};

describe("StatsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsProMember = true;
    mockRawSessions = mockSessions;
  });

  it("renders totals from completed sessions fetched from WatermelonDB", async () => {
    const screen = render(<StatsScreen user={user as any} />);

    await waitFor(() => {
      expect(screen.getByTestId("total-distance")).toHaveTextContent("3.75 miles");
      expect(screen.getByTestId("total-focus-time")).toHaveTextContent("1 hr 30 min");
      expect(screen.getByTestId("session-count")).toHaveTextContent("2");
    });

    expect(screen.getByText("Your Activity")).toBeTruthy();
    expect(screen.getAllByText("All Categories • All Time").length).toBeGreaterThan(0);
  });

  it("switches to the completed session list without losing persisted session rows", async () => {
    const screen = render(<StatsScreen user={user as any} />);

    await waitFor(() => {
      expect(screen.getByTestId("session-count")).toHaveTextContent("2");
    });

    fireEvent.press(screen.getByTestId("toggle-stats-screen"));

    await waitFor(() => {
      expect(screen.getByTestId("sessions-list")).toBeTruthy();
      expect(screen.getByTestId("session-list-item-session-2")).toBeTruthy();
      expect(screen.getByText("Evening hike")).toBeTruthy();
      expect(screen.getByText("Miles: 1.25 mi.")).toBeTruthy();
    });
  });

  it("shows a useful empty state when no completed sessions exist", async () => {
    mockRawSessions = [];

    const screen = render(<StatsScreen user={user as any} />);

    await waitFor(() => {
      expect(screen.getByTestId("stats-empty-state")).toBeTruthy();
      expect(screen.getByText("No completed sessions yet")).toBeTruthy();
      expect(screen.getByTestId("total-distance")).toHaveTextContent("0.00 miles");
      expect(screen.getByTestId("total-focus-time")).toHaveTextContent("N/A");
    });
  });

  it("keeps advanced filters locked for free users", async () => {
    mockIsProMember = false;

    const screen = render(<StatsScreen user={user as any} />);

    await waitFor(() => {
      expect(screen.getByText("Filters")).toBeTruthy();
      expect(screen.getByText("Pro")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Filters"));

    expect(screen.queryByText("Select a category")).toBeNull();
    expect(screen.queryByText("Select a time frame")).toBeNull();
  });
});
