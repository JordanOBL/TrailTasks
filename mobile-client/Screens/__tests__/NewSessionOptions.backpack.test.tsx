import React from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import NewSessionOptions from "../NewSessionOptions";

const mockAddon = {
  id: "20",
  name: "Ultralight II",
  effectType: "min_pace_increase",
  effectValue: 3,
};
const mockTrailMix = {
  id: "8",
  name: "Trail Mix II",
  effectType: "pace_increase_value",
  effectValue: 0.5,
};
let mockIsProMember = true;
let mockInventoryListener: (rows: any[]) => void;
const mockUnsubscribe = jest.fn();
const mockInventory = [
  { addonId: mockAddon.id, quantity: 2, addon: mockAddon },
  { addonId: mockTrailMix.id, quantity: 2, addon: mockTrailMix },
];
const mockUser = {
  id: "user-1",
  trailId: "trail-1",
  usersAddons: Object.assign(Promise.resolve(mockInventory), {
    observeWithColumns: jest.fn(() => ({
      subscribe: (listener: any) => {
        mockInventoryListener = listener;
        listener(mockInventory);
        return { unsubscribe: mockUnsubscribe };
      },
    })),
  }),
  calculateTotalMiles: jest.fn(async () => 100),
};
const mockDb = {
  get: () => ({ query: () => ({ fetch: async () => [{ id: "trail-1", park: {} }] }) }),
};
const mockStart = jest.fn();
const mockManager = {
  requestNewSession: jest.fn(async (_cfg: any): Promise<any> => ({ id: "session-1" })),
  createSessionEngine: jest.fn(async (_cfg: any, _session: any) => ({ start: mockStart })),
};
jest.mock("@nozbe/watermelondb/react", () => ({ useDatabase: () => mockDb }));
jest.mock("../../services/AuthContext", () => ({
  useAuthContext: () => ({ user: mockUser, isProMember: mockIsProMember }),
}));
jest.mock("../../contexts/ServiceProvider", () => ({
  useServices: () => ({ sessionEngineMgr: mockManager, persistenceService: {} }),
}));
jest.mock("../../components/DistanceProgressBar", () => () => null);
jest.mock("../../components/Session/SettingsModal", () => {
  const { Button } = require("react-native");
  return ({ sessionCfg, setSessionCfg }: any) => (
    <Button
      title="Configure"
      onPress={() =>
        setSessionCfg({
          ...sessionCfg,
          sessionName: "Focus",
          sessionCategory: ["cat", "Focus"],
          totalSets: 5,
        })
      }
    />
  );
});
jest.mock("../../components/AddOnStore/AddonListItem", () => {
  const { Button, Text } = require("react-native");
  const { isSupportedSessionAddon } = require("../../helpers/Addons/sessionBackpack");
  return ({ userAddon, selectAddon, sessionOnly }: any) =>
    sessionOnly && !isSupportedSessionAddon(userAddon.addon) ? (
      <Text>Not available for sessions yet</Text>
    ) : (
      <Button
        title={`Equip ${userAddon.addon.name}`}
        onPress={() => selectAddon(userAddon.addon)}
      />
    );
});

test("ready countdown and trail remain in non-shrinking scroll flow above an accessible start action", async () => {
  const result = render(<NewSessionOptions />);
  await result.findByTestId("new-session-options");
  const scroll = result.UNSAFE_getByType(ScrollView);
  expect(StyleSheet.flatten(scroll.props.style)).toMatchObject({ flex: 1 });
  expect(StyleSheet.flatten(result.getByTestId("ready-session-timer").props.style)).toMatchObject({
    flexShrink: 0,
  });
  expect(StyleSheet.flatten(result.getByTestId("ready-session-trail").props.style)).toMatchObject({
    flexShrink: 0,
  });
  expect(result.getByRole("button", { name: "Start Session" })).toBeDisabled();
});

async function prepare() {
  const screen = render(<NewSessionOptions />);
  fireEvent.press(await screen.findByText("Configure"));
  fireEvent.press(screen.getByText("Backpack"));
  return screen;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockIsProMember = true;
});

test("mileage-locked slots cannot take or consume another item", async () => {
  mockUser.calculateTotalMiles.mockResolvedValueOnce(0);
  const alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
  try {
    const screen = await prepare();
    fireEvent.press(screen.getByText("Equip Ultralight II"));
    fireEvent.press(screen.getByText("Equip Trail Mix II"));
    expect(alert).toHaveBeenCalled();
    expect(screen.queryByText("Trail Mix II")).toBeNull();
    fireEvent.press(screen.getByText("Close"));
    fireEvent.press(screen.getByText("Start Session"));
    await waitFor(() => expect(mockStart).toHaveBeenCalledTimes(1));
    expect(
      mockManager.requestNewSession.mock.calls[0][0].backpack
        .filter((s: any) => s.addon)
        .map((s: any) => s.addon.id),
    ).toEqual([mockAddon.id]);
  } finally {
    alert.mockRestore();
  }
});

test("unsupported catalog items are visibly unavailable and cannot be equipped", async () => {
  const screen = await prepare();
  act(() =>
    mockInventoryListener([
      {
        quantity: 2,
        addon: {
          id: "water",
          name: "Water Bottle II",
          effectType: "break_time_reduction",
          effectValue: 0.6,
        },
      },
    ]),
  );
  expect(screen.queryByText("Equip Water Bottle II")).toBeNull();
  expect(screen.getByText(/not available for sessions yet/i)).toBeTruthy();
});

test("non-Pro users cannot place an item into a third slot even with sufficient miles", async () => {
  mockIsProMember = false;
  mockUser.calculateTotalMiles.mockResolvedValueOnce(1000);
  const alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
  const shoes = { id: "shoes", name: "Shoes", effectType: "max_pace_increase", effectValue: 6 };
  try {
    const screen = await prepare();
    act(() => mockInventoryListener([...mockInventory, { quantity: 1, addon: shoes }]));
    fireEvent.press(screen.getByText("Equip Ultralight II"));
    fireEvent.press(screen.getByText("Equip Trail Mix II"));
    fireEvent.press(screen.getByText("Equip Shoes"));
    expect(alert).toHaveBeenCalled();
    expect(screen.queryByText("Shoes")).toBeNull();
    fireEvent.press(screen.getByText("Close"));
    fireEvent.press(screen.getByText("Start Session"));
    await waitFor(() => expect(mockStart).toHaveBeenCalledTimes(1));
    expect(
      mockManager.requestNewSession.mock.calls[0][0].backpack
        .filter((s: any) => s.addon)
        .map((s: any) => s.addon.id),
    ).toEqual([mockAddon.id, mockTrailMix.id]);
  } finally {
    alert.mockRestore();
  }
});

test("a failed creation retains explicit selection so retry can consume it once", async () => {
  mockManager.requestNewSession.mockRejectedValueOnce(new Error("disk full"));
  const errorLog = jest.spyOn(console, "error").mockImplementation(() => {});
  const alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
  try {
    const screen = await prepare();
    fireEvent.press(screen.getByText("Equip Ultralight II"));
    fireEvent.press(screen.getByText("Close"));
    fireEvent.press(screen.getByText("Start Session"));
    await waitFor(() => expect(errorLog).toHaveBeenCalled());
    fireEvent.press(screen.getByText("Backpack"));
    expect(screen.getByText("Ultralight II")).toBeTruthy();
    fireEvent.press(screen.getByText("Close"));
    expect(mockStart).not.toHaveBeenCalled();
    fireEvent.press(screen.getByText("Start Session"));
    await waitFor(() => expect(mockStart).toHaveBeenCalledTimes(1));
    expect(mockManager.requestNewSession.mock.calls[1][0].backpack[0].addon).toBe(mockAddon);
    expect(mockManager.createSessionEngine).toHaveBeenCalledTimes(1);
  } finally {
    alert.mockRestore();
    errorLog.mockRestore();
  }
});

test("Ultralight II and Trail Mix II apply only after explicit equip, not automatically in the next session", async () => {
  const first = await prepare();
  fireEvent.press(first.getByText("Equip Ultralight II"));
  fireEvent.press(first.getByText("Equip Trail Mix II"));
  fireEvent.press(first.getByText("Close"));
  fireEvent.press(first.getByText("Start Session"));
  await waitFor(() => expect(mockStart).toHaveBeenCalledTimes(1));
  expect(mockManager.createSessionEngine.mock.calls[0][0]).toMatchObject({
    currentPaceMph: 3,
    minPaceMph: 3,
    paceIncreaseValueMph: 0.5,
    backpack: [{ addon: mockAddon }, { addon: mockTrailMix }, {}, {}],
  });
  first.unmount();

  const second = await prepare();
  expect(second.queryByText("Ultralight II")).toBeNull();
  expect(second.queryByText("Trail Mix II")).toBeNull();
  fireEvent.press(second.getByText("Close"));
  fireEvent.press(second.getByText("Start Session"));
  await waitFor(() => expect(mockStart).toHaveBeenCalledTimes(2));
  expect(mockManager.createSessionEngine.mock.calls[1][0]).toMatchObject({
    currentPaceMph: 2,
    minPaceMph: 2,
    paceIncreaseValueMph: 0.25,
    backpack: [{ addon: null }, { addon: null }, { addon: null }, { addon: null }],
  });
  second.unmount();

  const third = await prepare();
  fireEvent.press(third.getByText("Equip Ultralight II"));
  fireEvent.press(third.getByText("Equip Trail Mix II"));
  fireEvent.press(third.getByText("Close"));
  fireEvent.press(third.getByText("Start Session"));
  await waitFor(() => expect(mockStart).toHaveBeenCalledTimes(3));
  expect(mockManager.createSessionEngine.mock.calls[2][0]).toMatchObject({
    currentPaceMph: 3,
    minPaceMph: 3,
    paceIncreaseValueMph: 0.5,
  });
});

test("used slots do not leak into a new session configuration", async () => {
  const first = await prepare();
  fireEvent.press(first.getByText("Equip Ultralight II"));
  fireEvent.press(first.getByText("Close"));
  fireEvent.press(first.getByText("Start Session"));
  await waitFor(() => expect(mockStart).toHaveBeenCalledTimes(1));
  expect(mockManager.requestNewSession.mock.calls[0][0].backpack[0].addon).toBe(mockAddon);
  first.unmount();
  const next = await prepare();
  expect(next.queryByText("Ultralight II")).toBeNull();
  fireEvent.press(next.getByText("Close"));
  fireEvent.press(next.getByText("Start Session"));
  await waitFor(() => expect(mockStart).toHaveBeenCalledTimes(2));
  expect(mockManager.requestNewSession.mock.calls[1][0].currentPaceMph).toBe(2);
});

test("applies the equipped pace on first start without resetting configured sets", async () => {
  const screen = await prepare();
  fireEvent.press(screen.getByText("Equip Ultralight II"));
  fireEvent.press(screen.getByText("Close"));
  fireEvent.press(screen.getByText("Start Session"));
  await waitFor(() => expect(mockStart).toHaveBeenCalledTimes(1));
  expect(mockManager.createSessionEngine.mock.calls[0][0]).toMatchObject({
    minPaceMph: 3,
    currentPaceMph: 3,
    totalSets: 5,
  });
});

test("observes inventory changes and removes depleted inventory from selection", async () => {
  const screen = await prepare();
  expect(screen.getByText("Equip Ultralight II")).toBeTruthy();
  expect(mockUser.usersAddons.observeWithColumns).toHaveBeenCalledWith(["quantity"]);
  act(() => mockInventoryListener([]));
  expect(screen.queryByText("Equip Ultralight II")).toBeNull();
  screen.unmount();
  expect(mockUnsubscribe).toHaveBeenCalled();
});

test("repeated start taps during persistence consume only once", async () => {
  let resolve: (session: any) => void = () => {};
  mockManager.requestNewSession.mockImplementationOnce(
    () =>
      new Promise(done => {
        resolve = done;
      }),
  );
  const screen = await prepare();
  fireEvent.press(screen.getByText("Close"));
  fireEvent.press(screen.getByText("Start Session"));
  fireEvent.press(screen.getByText("Start Session"));
  expect(mockManager.requestNewSession).toHaveBeenCalledTimes(1);
  await act(async () => resolve({ id: "session-1" }));
});

test("engine startup retries reuse the committed session and effects without consuming again", async () => {
  const errorLog = jest.spyOn(console, "error").mockImplementation(() => {});
  mockManager.createSessionEngine.mockRejectedValueOnce(new Error("engine unavailable"));
  try {
    const screen = await prepare();
    fireEvent.press(screen.getByText("Equip Ultralight II"));
    fireEvent.press(screen.getByText("Close"));
    fireEvent.press(screen.getByText("Start Session"));
    await waitFor(() => expect(errorLog).toHaveBeenCalled());
    expect(screen.queryByText("Ultralight II")).toBeNull();
    fireEvent.press(screen.getByText("Start Session"));
    await waitFor(() => expect(mockStart).toHaveBeenCalledTimes(1));
    expect(mockManager.requestNewSession).toHaveBeenCalledTimes(1);
    expect(mockManager.createSessionEngine).toHaveBeenCalledTimes(2);
    expect(mockManager.createSessionEngine.mock.calls[1][0]).toMatchObject({
      currentPaceMph: 3,
      backpack: [{ addon: mockAddon }, {}, {}, {}],
    });
  } finally {
    errorLog.mockRestore();
  }
});
