import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import { AddOnStore } from "./AddOnStore";

jest.mock("../../helpers/Addons/addonImages", () => ({
  TrailSnack: 1,
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
    },
  })),
}));

const addon = {
  id: "addon-1",
  name: "Trail Snack",
  price: 5,
  requiredTotalMiles: 10,
  description: "Boost pace.",
  effectValue: 1,
};

const user = {
  id: "user-1",
  totalMiles: "0.00",
};

describe("AddOnStore", () => {
  const renderStore = (overrides = {}) =>
    render(
      <AddOnStore
        availableAddOns={[addon as any]}
        user={user as any}
        totalMiles={12.25}
        tokenBalance={20}
        onPurchase={jest.fn()}
        usersAddons={[]}
        {...overrides}
      />,
    );

  it("labels token prices and owned quantities in compact cards", () => {
    const screen = renderStore({ usersAddons: [{ addonId: addon.id, quantity: 2 }] });
    expect(screen.getByText("5 Trail Tokens")).toBeTruthy();
    expect(screen.getByText("Owned: 2")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Buy Trail Snack for 5 Trail Tokens" }),
    ).toBeEnabled();
  });

  it.each([
    [0, 20, "You need 10.00 more miles"],
    [10, 2, "You need 3 more tokens"],
  ])(
    "explains and disables unavailable purchases (%s miles, %s tokens)",
    (totalMiles, tokenBalance, reason) => {
      const onPurchase = jest.fn();
      const screen = renderStore({ totalMiles, tokenBalance, onPurchase });
      expect(screen.getByText(reason)).toBeTruthy();
      const button = screen.getByRole("button", { name: "Buy Trail Snack for 5 Trail Tokens" });
      expect(button).toBeDisabled();
      fireEvent.press(button);
      expect(onPurchase).not.toHaveBeenCalled();
    },
  );

  it("shows an intentional empty catalog state", () => {
    const screen = renderStore({ availableAddOns: [] });
    expect(screen.getByText("No add-ons yet")).toBeTruthy();
    expect(screen.getByText("Check back soon for more trail essentials.")).toBeTruthy();
  });

  it("checks add-on mileage eligibility from the derived totalMiles prop instead of stale user.totalMiles", () => {
    const onPurchase = jest.fn();
    const screen = render(
      <AddOnStore
        availableAddOns={[addon as any]}
        user={user as any}
        totalMiles={12.25}
        tokenBalance={20}
        onPurchase={onPurchase}
        usersAddons={[]}
      />,
    );

    expect(screen.getByText("Buy Now")).toBeTruthy();
    expect(screen.queryByText("You need 10.00 more miles")).toBeNull();

    fireEvent.press(screen.getByText("Buy Now"));

    expect(onPurchase).toHaveBeenCalledWith(addon);
  });
});
