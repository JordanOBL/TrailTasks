import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { AddonListItem } from "./AddonListItem";

jest.mock("../../helpers/Addons/addonImages", () => ({}));
const props = { userAddon: { quantity: 2 } as any, selectAddon: jest.fn() };

test("unsupported effects are visibly unavailable in backpack selection and cannot be chosen", () => {
  const select = jest.fn();
  const screen = render(<AddonListItem {...props} selectAddon={select} sessionOnly addon={{ name: "Water Bottle II", description: "Break reduction", effectType: "break_time_reduction" } as any} />);
  expect(screen.getByText(/not available for sessions yet/i)).toBeTruthy();
  fireEvent.press(screen.getByText("Water Bottle II"));
  expect(select).not.toHaveBeenCalled();
});

test("supported items remain explicitly selectable from owned inventory", () => {
  const select = jest.fn();
  const addon = { name: "Ultralight II", description: "Starting pace", effectType: "min_pace_increase" } as any;
  const screen = render(<AddonListItem {...props} selectAddon={select} sessionOnly addon={addon} />);
  fireEvent.press(screen.getByText("Ultralight II"));
  expect(select).toHaveBeenCalledWith(addon);
});
