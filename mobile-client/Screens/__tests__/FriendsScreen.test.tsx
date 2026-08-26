import { render } from "@testing-library/react-native";
import React from "react";

import { TestWrapper } from "../../__mocks__/TestWrapper";
import FriendsScreen from "../FriendsScreen";

describe("Friends Screen", () => {
  it("shows the MVP coming soon state instead of friend/social controls", () => {
    const { getByTestId, getByText, queryByTestId } = render(
      <TestWrapper testUser={null}>
        <FriendsScreen />
      </TestWrapper>,
    );

    expect(getByTestId("coming-soon-screen")).toBeTruthy();
    expect(getByText("Friends are coming soon")).toBeTruthy();
    expect(queryByTestId("friend-search-input")).toBeNull();
  });
});
