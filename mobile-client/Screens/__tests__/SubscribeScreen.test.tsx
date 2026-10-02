import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

import SubscribeScreen from "../SubscribeScreen";

const mockPurchasePackage = jest.fn();
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
      border: "#333333",
      button: "#00aaaa",
      buttonText: "#ffffff",
      shadow: "#000000",
    },
  })),
}));

const annualPackage = {
  identifier: "annual-pro",
  product: {
    title: "Trail Tasks Annual",
    priceString: "$29.99",
    subscriptionPeriod: "P1Y",
  },
};

const navigation = { goBack: jest.fn(), navigate: jest.fn() };

const baseAuthContext = {
  currentOffering: {
    annual: annualPackage,
    monthly: null,
  },
  isProMember: false,
  revenueCatLoading: false,
  revenueCatError: "",
  purchasePackage: mockPurchasePackage,
};

describe("SubscribeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPurchasePackage.mockResolvedValue({ entitlements: { active: { pro: {} } } });
    mockAuthContext = { ...baseAuthContext };
  });

  it("shows a configuration or network error instead of spinning forever", () => {
    mockAuthContext = {
      ...baseAuthContext,
      currentOffering: null,
      revenueCatError: "Trail Tasks Pro is unavailable because RevenueCat is not configured for this build.",
    };

    const screen = render(<SubscribeScreen navigation={navigation as any} />);

    expect(screen.getByTestId("subscribe-error-state")).toBeTruthy();
    expect(screen.getByText("Trail Tasks Pro is unavailable")).toBeTruthy();
    expect(screen.getByText(/RevenueCat is not configured/)).toBeTruthy();
  });

  it("purchases the selected RevenueCat package through AuthContext so entitlement state can update centrally", async () => {
    const screen = render(<SubscribeScreen navigation={navigation as any} />);

    fireEvent.press(screen.getByText(/Trail Tasks Annual/));
    fireEvent.press(screen.getByTestId("subscribe-now-button"));

    await waitFor(() => {
      expect(mockPurchasePackage).toHaveBeenCalledWith(annualPackage);
      expect(navigation.goBack).toHaveBeenCalled();
    });
  });
});
