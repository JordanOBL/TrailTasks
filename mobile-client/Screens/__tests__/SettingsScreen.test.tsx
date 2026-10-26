import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";
import SettingsScreen from "../SettingsScreen";
import { darkTheme, lightTheme } from "../../theme";
import { sync } from "../../watermelon/sync";
import type { User } from "../../watermelon/models";

const mockDatabase = {};
const mockToggleTheme = jest.fn();
const mockLogout = jest.fn();
let mockTheme = darkTheme;
let mockAuthUser: { id: string } | null = { id: "auth-account" };
let mockIsConnected = true;

jest.mock("@nozbe/watermelondb/react", () => ({
  useDatabase: () => mockDatabase,
}));
jest.mock("../../watermelon/sync", () => ({ sync: jest.fn() }));
jest.mock("../../contexts/ThemeProvider", () => ({
  useTheme: () => ({ theme: mockTheme, toggleTheme: mockToggleTheme }),
}));
jest.mock("../../services/AuthContext", () => ({
  useAuthContext: () => ({ user: mockAuthUser, logout: mockLogout }),
}));
jest.mock("../../contexts/InternetConnectionProvider", () => ({
  useInternetConnection: () => ({ isConnected: mockIsConnected }),
}));

const user = { id: "local-account" } as User;
const renderSettings = () => {
  const navigation = { navigate: jest.fn() };
  return { ...render(<SettingsScreen user={user} navigation={navigation} />), navigation };
};

beforeEach(() => {
  jest.clearAllMocks();
  mockTheme = darkTheme;
  mockAuthUser = { id: "auth-account" };
  mockIsConnected = true;
});

it("groups settings into Appearance, Account and Data sections", () => {
  const screen = renderSettings();
  expect(screen.getAllByRole("header").map(header => header.props.children)).toEqual([
    "Appearance",
    "Account",
    "Data",
  ]);
});

it("bounds scrolling and provides flexible content for smaller screens", () => {
  const screen = renderSettings();
  const scroll = screen.UNSAFE_getByType(ScrollView);
  expect(StyleSheet.flatten(screen.getByTestId("settings-screen").props.style).flex).toBe(1);
  expect(StyleSheet.flatten(scroll.props.style).flex).toBe(1);
  expect(StyleSheet.flatten(scroll.props.contentContainerStyle).flexGrow).toBe(1);
});

it("exposes every action as an accessible button with at least a 48 point row", () => {
  const screen = renderSettings();
  const labels = [
    "Switch to Light Mode",
    "Subscription",
    "Logout",
    "Sync",
    "Force Account Pull",
    "Force Account Push",
  ];
  expect(screen.getAllByRole("button")).toHaveLength(labels.length);
  labels.forEach(name => {
    const row = screen.getByRole("button", { name });
    expect(StyleSheet.flatten(row.props.style).minHeight).toBeGreaterThanOrEqual(48);
  });
});

it("keeps the subscription route and logout callback reachable", () => {
  const screen = renderSettings();
  fireEvent.press(screen.getByText("Subscription"));
  expect(screen.navigation.navigate).toHaveBeenCalledWith("SubscriptionSettings");
  fireEvent.press(screen.getByText("Logout"));
  expect(mockLogout).toHaveBeenCalledTimes(1);
});

it.each([
  [darkTheme, "Switch to Light Mode"],
  [lightTheme, "Switch to Dark Mode"],
])("preserves the theme toggle for %s", (theme, label) => {
  mockTheme = theme;
  const screen = renderSettings();
  fireEvent.press(screen.getByText(label));
  expect(mockToggleTheme).toHaveBeenCalledTimes(1);
});

it.each([
  ["Sync", undefined],
  ["Force Account Pull", { fullUserSync: true, pullOnly: true }],
  ["Force Account Push", { pushOnly: true, forceAccountPush: true }],
])("preserves the exact %s sync arguments", (label, options) => {
  const screen = renderSettings();
  expect(sync).not.toHaveBeenCalled();
  fireEvent.press(screen.getByText(label));
  const args = options
    ? [mockDatabase, true, "auth-account", options]
    : [mockDatabase, true, "auth-account"];
  expect(sync).toHaveBeenCalledTimes(1);
  expect(sync).toHaveBeenCalledWith(...args);
});

it("falls back to the supplied user and forwards the connection state", () => {
  mockAuthUser = null;
  mockIsConnected = false;
  const screen = renderSettings();
  fireEvent.press(screen.getByText("Sync"));
  expect(sync).toHaveBeenCalledWith(mockDatabase, false, "local-account");
});
