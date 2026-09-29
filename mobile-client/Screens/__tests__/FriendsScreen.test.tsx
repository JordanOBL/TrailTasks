import { render } from "@testing-library/react-native";
import React from "react";

import FriendsScreen from "../FriendsScreen";

type FutureFlowStep = {
  step: string;
  userAction: string;
  expectedScreenBehavior: string;
  futureTestIds: string[];
};

const friendSearchAndCacheFlow: FutureFlowStep[] = [
  {
    step: "Open friends from the MVP tab while the social feature is still deferred",
    userAction: "User lands on the placeholder instead of the unfinished social surface",
    expectedScreenBehavior:
      "The placeholder explains that friend activity is coming soon and no search or cached friend controls mount.",
    futureTestIds: ["coming-soon-screen"],
  },
  {
    step: "Search for a global Trail Tasks user by username",
    userAction: "User types the target username and presses the friend search button",
    expectedScreenBehavior:
      "A found-friend card appears with an add-friend button for the matching user.",
    futureTestIds: [
      "friend-search-input",
      "friend-search-button",
      "<friendId>-found-friend-card",
      "add-friend-<friendId>-button",
    ],
  },
  {
    step: "Add the found user as a friend",
    userAction: "User presses the add-friend button on the found-friend card",
    expectedScreenBehavior:
      "The friend relationship syncs, the friend is cached locally, and the friend card appears in the friends list.",
    futureTestIds: ["<friendId>-friend-card", "friends-list"],
  },
  {
    step: "Reopen friends without internet after a friend was cached",
    userAction: "User views the Friends screen while NetInfo reports offline",
    expectedScreenBehavior:
      "The screen shows the refresh-connection affordance and still renders cached friend cards from local storage.",
    futureTestIds: ["refresh-connection-button", "<friendId>-friend-card"],
  },
  {
    step: "Join an active friend's group room",
    userAction: "User presses the join-room button on a cached friend who has a roomId",
    expectedScreenBehavior:
      "Navigation opens the Timer stack's Group screen with the friend's roomId prefilled as joinRoomId.",
    futureTestIds: ["join-room-<roomId>-button"],
  },
];

describe("Friends Screen deferred MVP wrapper", () => {
  test("shows the coming soon screen without mounting friend/social controls", () => {
    const { getByTestId, getByText, queryByTestId } = render(<FriendsScreen />);

    expect(getByTestId("coming-soon-screen")).toBeTruthy();
    expect(getByText("Friends are coming soon")).toBeTruthy();
    expect(queryByTestId("friend-search-input")).toBeNull();
  });
});

describe("Friends Screen future implementation contract", () => {
  test.each(friendSearchAndCacheFlow)("documents flow step: $step", step => {
    expect(step.userAction).toEqual(expect.any(String));
    expect(step.expectedScreenBehavior).toEqual(expect.any(String));
    expect(step.futureTestIds.length).toBeGreaterThan(0);
  });

  test("keeps the post-MVP friend flow in the order the user should experience it", () => {
    expect(friendSearchAndCacheFlow.map(step => step.step)).toEqual([
      "Open friends from the MVP tab while the social feature is still deferred",
      "Search for a global Trail Tasks user by username",
      "Add the found user as a friend",
      "Reopen friends without internet after a friend was cached",
      "Join an active friend's group room",
    ]);
  });

  it.todo(
    "rebuild search/add-friend as an opt-in integration test with a safe test server and DB seed",
  );
  it.todo("rebuild cached offline friend rendering with a native-safe WatermelonDB test adapter");
  it.todo("rebuild friend-room navigation once group sessions leave the deferred MVP placeholder");
});
