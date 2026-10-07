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
  trailTokens: 20,
};

describe("AddOnStore", () => {
  it("checks add-on mileage eligibility from the derived totalMiles prop instead of stale user.totalMiles", () => {
    const onPurchase = jest.fn();
    const screen = render(
      <AddOnStore
        availableAddOns={[addon as any]}
        user={user as any}
        totalMiles={12.25}
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
