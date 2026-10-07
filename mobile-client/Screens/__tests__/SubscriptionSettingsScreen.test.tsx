import React from "react";
import { render } from "@testing-library/react-native";

import SubscriptionSettingsScreen from "../SubscriptionSettingsScreen";

let mockAuthContext: any;

jest.mock("../../services/AuthContext", () => ({
  useAuthContext: () => mockAuthContext,
}));

jest.mock("../../contexts/ThemeProvider", () => ({
  useTheme: jest.fn(() => ({
    theme: {
      background: "#000000",
      card: "#111111",
      text: "#ffffff",
      secondaryText: "#cccccc",
      button: "#00aaaa",
      buttonText: "#ffffff",
    },
  })),
}));

jest.mock("../../components/RevenueCat/RestorePurchasesButton", () => {
  const { Text } = require("react-native");
  return () => <Text testID="restore-purchases-button">Restore Purchases</Text>;
});

describe("SubscriptionSettingsScreen", () => {
  beforeEach(() => {
    mockAuthContext = {
      customerInfo: null,
      currentOffering: null,
      isProMember: false,
      revenueCatLoading: false,
      revenueCatError: "RevenueCat unavailable in this build.",
    };
  });

  it("shows RevenueCat availability errors without hiding the subscription controls", () => {
    const screen = render(<SubscriptionSettingsScreen navigation={{ navigate: jest.fn() }} />);

    expect(screen.getByText("RevenueCat unavailable in this build.")).toBeTruthy();
    expect(screen.getByText("No active subscription.")).toBeTruthy();
    expect(screen.getByText("Subscribe to Trail Tasks Pro")).toBeTruthy();
  });

  it("keeps restore available for users who are not currently recognized as Pro", () => {
    const screen = render(<SubscriptionSettingsScreen navigation={{ navigate: jest.fn() }} />);

    expect(screen.getByText("No active subscription.")).toBeTruthy();
    expect(screen.getByTestId("restore-purchases-button")).toBeTruthy();
  });
});
