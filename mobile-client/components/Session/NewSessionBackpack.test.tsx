import { resolveBackpackTotalMiles } from "./NewSessionBackpack";

jest.mock("../AddOnStore/AddonListItem", () => {
  const React = require("react");
  const { Text } = require("react-native");

  return function MockAddonListItem() {
    return <Text testID="addon-list-item" />;
  };
});

jest.mock("@nozbe/watermelondb/react", () => ({
  withObservables: jest.fn(() => (Component: any) => Component),
}));

describe("NewSessionBackpack mileage source", () => {
  it("requires a session-derived totalMiles prop instead of falling back to stale user.totalMiles", () => {
    expect(resolveBackpackTotalMiles()).toBe(0);
    expect(resolveBackpackTotalMiles(12.25)).toBe(12.25);
  });
});
