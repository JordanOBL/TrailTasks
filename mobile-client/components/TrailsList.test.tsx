import React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react-native/pure";
import TrailsList from "./TrailsList";

jest.mock("@react-navigation/native", () => ({ useNavigation: () => ({ navigate: jest.fn() }) }));
jest.mock("../services/AuthContext", () => ({ useAuthContext: () => ({ isProMember: false }) }));
jest.mock("../contexts/ThemeProvider", () => ({
  useTheme: () => ({ theme: require("../theme").darkTheme }),
}));
jest.mock("./Trails/TrailCard", () => {
  const { Text } = require("react-native");
  return ({ trail }: any) => <Text>{trail.trail_name}</Text>;
});

const props: any = {
  user: { id: "search-user", trailId: "acadia" },
  completedTrails: [], queuedTrails: [], userPurchasedTrails: [], queuedTrailMap: {},
  trailsCollection: [
    { id: "acadia", trail_name: "Beehive Loop", park_name: "Acadia", state: "Maine", is_free: true },
    { id: "badlands", trail_name: "Castle Trail", park_name: "Badlands", state: "South Dakota", is_free: false },
  ],
};

beforeEach(() => jest.useFakeTimers({ doNotFake: ["setImmediate", "clearImmediate"] }));
afterEach(() => { cleanup(); jest.clearAllTimers(); jest.useRealTimers(); });

it("keeps the same native search input mounted across keystrokes and debounced results", () => {
  const screen = render(<TrailsList {...props} />);
  const originalInput = screen.getByPlaceholderText("Search trails, parks, or states");
  for (const query of ["a", "ac", "acadia"]) {
    fireEvent.changeText(screen.getByPlaceholderText("Search trails, parks, or states"), query);
    expect(screen.getByPlaceholderText("Search trails, parks, or states") === originalInput).toBe(true);
  }
  act(() => { jest.advanceTimersByTime(400); });
  expect(screen.getByPlaceholderText("Search trails, parks, or states") === originalInput).toBe(true);
  expect(screen.getByText("Beehive Loop")).toBeTruthy();
  expect(screen.queryByText("Castle Trail")).toBeNull();
  fireEvent.changeText(originalInput, "");
  act(() => { jest.advanceTimersByTime(400); });
  expect(screen.getByText("Castle Trail")).toBeTruthy();
  expect(screen.getByPlaceholderText("Search trails, parks, or states") === originalInput).toBe(true);
});

it("preserves the input identity while applying a filter and keeps filter labels current", () => {
  const screen = render(<TrailsList {...props} />);
  const originalInput = screen.getByPlaceholderText("Search trails, parks, or states");
  fireEvent.press(screen.getByText("Available to Me"));
  expect(screen.getByPlaceholderText("Search trails, parks, or states") === originalInput).toBe(true);
  expect(screen.getByText("Filtered by Available to Me")).toBeTruthy();
  expect(screen.queryByText("Castle Trail")).toBeNull();
});
