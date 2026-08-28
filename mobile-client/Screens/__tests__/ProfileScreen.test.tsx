import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import { ProfileScreen } from "../ProfileScreen";

const mockNavigate = jest.fn();
let mockIsProMember = false;

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

jest.mock("../../services/AuthContext", () => ({
  useAuthContext: jest.fn(() => ({
    isProMember: mockIsProMember,
  })),
}));

const user = {
  id: "user-1",
  username: "Jordan",
};

describe("ProfileScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsProMember = false;
  });

  it("renders a cleaner profile hub with descriptive navigation cards", () => {
    const screen = render(
      <ProfileScreen navigation={{ navigate: mockNavigate }} user={user as any} />,
    );

    expect(screen.getByTestId("profile-screen")).toBeTruthy();
    expect(screen.getByText("Jordan")).toBeTruthy();
    expect(screen.getByText("Free account")).toBeTruthy();
    expect(screen.getByText("Trail Hub")).toBeTruthy();
    expect(screen.getByText("See miles, focus time, and completed session trends.")).toBeTruthy();
    expect(screen.getByText("Plan and manage the trail queue for future hikes.")).toBeTruthy();
  });

  it("navigates to free profile sections directly", () => {
    const screen = render(
      <ProfileScreen navigation={{ navigate: mockNavigate }} user={user as any} />,
    );

    fireEvent.press(screen.getByText("Stats"));

    expect(mockNavigate).toHaveBeenCalledWith("Stats");
  });

  it("routes locked pro-only profile actions to subscribe for free users", () => {
    const screen = render(
      <ProfileScreen navigation={{ navigate: mockNavigate }} user={user as any} />,
    );

    fireEvent.press(screen.getByText("Upcoming Trails"));

    expect(mockNavigate).toHaveBeenCalledWith("Basecamp", { screen: "Subscribe" });
  });

  it("shows active pro status and opens pro-only links for pro users", () => {
    mockIsProMember = true;

    const screen = render(
      <ProfileScreen navigation={{ navigate: mockNavigate }} user={user as any} />,
    );

    expect(screen.getByText("Pro member")).toBeTruthy();

    fireEvent.press(screen.getByText("Upcoming Trails"));

    expect(mockNavigate).toHaveBeenCalledWith("Trail Queue");
  });
});
