import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { SessionTypeScreen } from "../SessionTypeScreen";

const mockNavigate = jest.fn();

jest.mock("@nozbe/watermelondb", () => ({
  Q: {
    take: jest.fn(),
    where: jest.fn(),
  },
}));

jest.mock("@nozbe/watermelondb/react", () => ({
  withObservables: jest.fn(() => (Component: React.ComponentType<any>) => Component),
}));

jest.mock("../../components/Wilds/WildAvatar", () => {
  const { Text } = require("react-native");

  return jest.fn(({ id, pose, size }) => (
    <Text testID={`wild-avatar-${id}`}>{`${id}-${pose}-${size}`}</Text>
  ));
});

jest.mock("../../contexts/ThemeProvider", () => ({
  useTheme: jest.fn(() => ({
    theme: {
      background: "#000000",
      card: "#121212",
      shadow: "#000000",
      text: "#ffffff",
      secondaryText: "#aaaaaa",
      border: "#333333",
      button: "#13B3AC",
      buttonText: "#ffffff",
      inputBackground: "#1f1f1f",
      linkDisabled: "#777777",
      progressBarBackground: "rgba(41,184,169, 0.2)",
    },
  })),
}));

const user = {
  id: "user-1",
  username: "Jordan",
};

const renderScreen = (activeWilds = [{ wildId: "ember" }]) =>
  render(
    <SessionTypeScreen
      navigation={{ navigate: mockNavigate }}
      user={user as any}
      activeWilds={activeWilds as any}
    />,
  );

describe("SessionTypeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a polished session picker with clear solo and group choices", () => {
    const screen = renderScreen();

    expect(screen.getByTestId("session-type-screen")).toBeTruthy();
    expect(screen.getByText("Choose your session")).toBeTruthy();
    expect(screen.getByText("Pick how you want to move your trail forward today.")).toBeTruthy();
    expect(screen.getByText("Solo Trek")).toBeTruthy();
    expect(
      screen.getByText("Focus mode for today’s hike, trail progress, and rewards."),
    ).toBeTruthy();
    expect(screen.getByText("Group Hike")).toBeTruthy();
    expect(screen.getByText("Coming soon: message-bus powered group sessions.")).toBeTruthy();
    expect(screen.getByText("Start Solo Session")).toBeTruthy();
  });

  it("shows the active wild as the solo companion", () => {
    const screen = renderScreen([{ wildId: "ember" }]);

    expect(screen.getByTestId("wild-avatar-ember").props.children).toBe("ember-wave-180");
  });

  it("starts the supported solo session by default", () => {
    const screen = renderScreen();

    fireEvent.press(screen.getByText("Start Solo Session"));

    expect(mockNavigate).toHaveBeenCalledWith("Solo", { user });
  });

  it("updates the call to action and navigates to the group placeholder when group is selected", () => {
    const screen = renderScreen();

    fireEvent.press(screen.getByText("Group Hike"));

    expect(screen.getByText("Preview Group Sessions")).toBeTruthy();
    fireEvent.press(screen.getByText("Preview Group Sessions"));

    expect(mockNavigate).toHaveBeenCalledWith("Group", { user });
  });
});
