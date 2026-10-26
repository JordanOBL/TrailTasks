import React from "react";
import { render, screen, waitFor } from "@testing-library/react-native";
import { StatusBar, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import App from "./App";
import { darkTheme, lightTheme } from "./theme";

let mockTheme = darkTheme;
let mockUser: { id: string } | null = { id: "user-1" };
const mockDb = {};
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);
jest.mock("react-native-reanimated", () => ({
  configureReanimatedLogger: jest.fn(),
  ReanimatedLogLevel: { warn: 1 },
}));
jest.mock("@nozbe/watermelondb/react", () => ({ useDatabase: () => mockDb }));
jest.mock("./services/AuthContext", () => ({ useAuthContext: () => ({ user: mockUser }) }));
jest.mock("./contexts/InternetConnectionProvider", () => ({
  useInternetConnection: () => ({ isConnected: true }),
}));
jest.mock("./contexts/ThemeProvider", () => ({ useTheme: () => ({ theme: mockTheme }) }));
jest.mock("./watermelon/sync", () => ({
  sync: jest.fn(async () => {}),
  pullCatalogChanges: jest.fn(async () => {}),
}));
jest.mock("./EventBus/EventBus", () => ({ EventBus: { getInstance: () => ({}) } }));
jest.mock("./components/Navigation/TabNavigator", () => () => null);
jest.mock("./Screens/AuthScreen", () => () => null);
jest.mock("@react-navigation/native", () => ({
  DarkTheme: {},
  DefaultTheme: {},
  NavigationContainer: ({ children }: any) => children,
}));

beforeEach(() => {
  mockTheme = darkTheme;
  mockUser = { id: "user-1" };
});

test("provides safe-area metrics while leaving header and tab insets to navigation", async () => {
  const result = render(<App />);
  expect(result.UNSAFE_getByType(SafeAreaProvider)).toBeTruthy();
  expect(result.UNSAFE_getByType(SafeAreaView).props.edges).toEqual(["left", "right"]);
  await waitFor(() => expect(result.UNSAFE_getByType(StatusBar)).toBeTruthy());
});

test("status icons and background follow the app theme rather than the device appearance", async () => {
  const result = render(<App />);
  expect(result.UNSAFE_getByType(StatusBar).props.barStyle).toBe("light-content");
  expect(StyleSheet.flatten(screen.getByTestId("app-safe-area").props.style).backgroundColor).toBe(
    darkTheme.background,
  );
  mockTheme = lightTheme as typeof darkTheme;
  result.rerender(<App />);
  expect(result.UNSAFE_getByType(StatusBar).props.barStyle).toBe("dark-content");
  await waitFor(() =>
    expect(
      StyleSheet.flatten(screen.getByTestId("app-safe-area").props.style).backgroundColor,
    ).toBe(lightTheme.background),
  );
});

test("auth without navigational chrome owns all system insets", async () => {
  mockUser = null;
  const result = render(<App />);
  expect(result.UNSAFE_getByType(SafeAreaView).props.edges).toEqual([
    "top",
    "right",
    "bottom",
    "left",
  ]);
  await waitFor(() => expect(result.UNSAFE_getByType(StatusBar)).toBeTruthy());
});
