import React from "react";
import { render, waitFor } from "@testing-library/react-native";


import AddOnStoreScreen from "../AddOnStoreScreen";

const mockRead = jest.fn(async callback => callback());
const mockCalculateTotalMiles = jest.fn(async () => 42.5);
const mockCalculateTokenBalance = jest.fn(async () => 100);
const mockUseAddons = jest.fn(() => ({
  addons: [
    {
      id: "addon-1",
      name: "Trail Snack",
      price: 5,
      requiredTotalMiles: 10,
      description: "Boost pace.",
      effectValue: 1,
    },
  ],
  loading: false,
  error: "",
}));

jest.mock("@nozbe/watermelondb/react", () => ({
  useDatabase: jest.fn(() => ({
    read: mockRead,
  })),
  withObservables: jest.fn(() => (Component: any) => Component),
}));

jest.mock("../../helpers/Addons/useAddons", () => ({
  __esModule: true,
  default: () => mockUseAddons(),
}));

jest.mock("../../components/AddOnStore/AddOnStore", () => {
  const { Text } = require("react-native");

  return ({ totalMiles }: { totalMiles?: number }) => (
    <Text testID="addon-store-total-miles">{typeof totalMiles === "number" ? totalMiles.toFixed(2) : "missing"}</Text>
  );
});

jest.mock("../../contexts/InternetConnectionProvider", () => ({
  useInternetConnection: jest.fn(() => ({ isConnected: true })),
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

jest.mock("../../watermelon/sync", () => ({
  sync: jest.fn(),
}));

const user = {
  id: "user-1",
  totalMiles: "0.00",
  calculateTotalMiles: mockCalculateTotalMiles,
  calculateTrailTokenBalance: mockCalculateTokenBalance,
};

describe("AddOnStoreScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCalculateTotalMiles.mockResolvedValue(42.5);
    mockCalculateTokenBalance.mockResolvedValue(100);
    mockRead.mockImplementation(async callback => callback());
  });

  it("uses the user total-miles reader directly instead of nesting it in an anonymous database read", async () => {
    const screen = render(
      <AddOnStoreScreen user={user as any} userAddons={[]} userSessions={[]} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("addon-store-total-miles")).toHaveTextContent("42.50");
      expect(screen.getByText("Total Miles: 42.50")).toBeTruthy();
    });

    expect(mockCalculateTotalMiles).toHaveBeenCalled();
    expect(mockRead).not.toHaveBeenCalled();
  });
});
