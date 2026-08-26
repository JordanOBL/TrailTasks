import { render } from "@testing-library/react-native";
import React from "react";

import { TestWrapper } from "../../__mocks__/TestWrapper";
import GroupSessionScreen from "../GroupSessionScreen";

describe("GroupSessionScreen", () => {
  it("shows the MVP coming soon state instead of starting group-session logic", () => {
    const { getByTestId, getByText } = render(
      <TestWrapper testUser={null}>
        <GroupSessionScreen />
      </TestWrapper>,
    );

    expect(getByTestId("coming-soon-screen")).toBeTruthy();
    expect(getByText("Group sessions are coming soon")).toBeTruthy();
  });
});
