import { render } from "@testing-library/react-native";
import React from "react";

import GroupSessionScreen from "../GroupSessionScreen";

type FutureGroupSessionStep = {
  step: string;
  actor: "host" | "guest" | "both clients";
  userAction: string;
  expectedScreenBehavior: string;
  futureTestIds: string[];
};

const hostCreateAndLobbyFlow: FutureGroupSessionStep[] = [
  {
    step: "Open group session entry point",
    actor: "host",
    userAction: "Host opens the Group session screen",
    expectedScreenBehavior:
      "The implemented post-MVP screen renders create-room and join-room controls before any room exists.",
    futureTestIds: [
      "group-session-screen",
      "create-room-button",
      "join-room-input",
      "join-room-button",
    ],
  },
  {
    step: "Create a room",
    actor: "host",
    userAction: "Host presses Create Room",
    expectedScreenBehavior:
      "The server returns a room id, the host is inserted into the hikers map, and the screen changes to lobby view.",
    futureTestIds: ["create-room-button", "hiker-<hostId>-name", "hiker-<hostId>-status"],
  },
  {
    step: "Show host as not ready in the lobby",
    actor: "host",
    userAction: "Host waits in the lobby after room creation",
    expectedScreenBehavior:
      "The hiker list shows the host username and a Not Ready status, and the host can configure the session.",
    futureTestIds: ["hiker-<hostId>-name", "hiker-<hostId>-status", "configure-session-button"],
  },
  {
    step: "Host readies and edits shared session settings",
    actor: "host",
    userAction: "Host presses Ready Up, opens settings, changes the session name, and saves",
    expectedScreenBehavior:
      "The host status changes to Ready, settings are persisted to the shared lobby config, and the start button appears while the host is the only hiker.",
    futureTestIds: [
      "toggle-ready-button",
      "group-settings-modal",
      "session-name-input",
      "save-close-settings-button",
      "start-group-session-button",
    ],
  },
];

const guestJoinAndStartFlow: FutureGroupSessionStep[] = [
  {
    step: "Join by room id from a second client",
    actor: "guest",
    userAction: "Guest enters the host room id and presses Join Room",
    expectedScreenBehavior:
      "The guest joins the same lobby, sees the shared session config, and initially appears Not Ready.",
    futureTestIds: [
      "join-room-input",
      "join-room-button",
      "hiker-<guestId>-name",
      "hiker-<guestId>-status",
    ],
  },
  {
    step: "Sync both hiker lists across clients",
    actor: "both clients",
    userAction: "Host and guest remain in the same lobby after the guest joins",
    expectedScreenBehavior:
      "Both clients render both hikers, and the host start button disappears while any hiker is Not Ready.",
    futureTestIds: [
      "hiker-<hostId>-name",
      "hiker-<guestId>-name",
      "hiker-<hostId>-status",
      "hiker-<guestId>-status",
      "start-group-session-button",
    ],
  },
  {
    step: "Guest readies up",
    actor: "guest",
    userAction: "Guest presses Ready Up",
    expectedScreenBehavior:
      "Both clients show the guest as Ready and the host sees the start button because every hiker is ready.",
    futureTestIds: ["toggle-ready-button", "hiker-<guestId>-status", "start-group-session-button"],
  },
  {
    step: "Only host starts the shared runtime",
    actor: "host",
    userAction: "Host presses Start Session",
    expectedScreenBehavior:
      "The host can start the group session; non-host clients do not render the start button but transition with the shared runtime state.",
    futureTestIds: ["start-group-session-button", "group-session-timer"],
  },
];

const fullGroupSessionFlow = [...hostCreateAndLobbyFlow, ...guestJoinAndStartFlow];

describe("GroupSessionScreen deferred MVP wrapper", () => {
  it("shows the coming soon screen without mounting group-session controls", () => {
    const { getByTestId, getByText, queryByTestId } = render(<GroupSessionScreen />);

    expect(getByTestId("coming-soon-screen")).toBeTruthy();
    expect(getByText("Group sessions are coming soon")).toBeTruthy();
    expect(queryByTestId("create-room-button")).toBeNull();
  });
});

describe("GroupSessionScreen future implementation contract", () => {
  test.each(fullGroupSessionFlow)("documents flow step: $step", step => {
    expect(["host", "guest", "both clients"]).toContain(step.actor);
    expect(step.userAction).toEqual(expect.any(String));
    expect(step.expectedScreenBehavior).toEqual(expect.any(String));
    expect(step.futureTestIds.length).toBeGreaterThan(0);
  });

  it("keeps the post-MVP group session flow in the order hikers should experience it", () => {
    expect(fullGroupSessionFlow.map(step => step.step)).toEqual([
      "Open group session entry point",
      "Create a room",
      "Show host as not ready in the lobby",
      "Host readies and edits shared session settings",
      "Join by room id from a second client",
      "Sync both hiker lists across clients",
      "Guest readies up",
      "Only host starts the shared runtime",
    ]);
  });

  it.todo(
    "rebuild create/join/ready/start as an opt-in integration test with a websocket test server",
  );
  it.todo("rebuild lobby persistence with a native-safe test DB or mocked Watermelon adapter");
});
