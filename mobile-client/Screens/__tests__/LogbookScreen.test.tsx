import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { FlatList } from "react-native";
import LogbookScreen from "../LogbookScreen";

const mockParks = [
  { id: "acadia", parkName: "Acadia" },
  { id: "badlands", parkName: "Badlands" },
  { id: "congaree", parkName: "Congaree" },
];
const mockRelations = [
  { id: "r1", parkId: "acadia", wildId: "wild-a" },
  { id: "r2", parkId: "badlands", wildId: "wild-b" },
  { id: "r3", parkId: "congaree", wildId: "scout" },
];
let mockParkWilds: any[];
const mockUser = { id: "logbook-user", usersParks: [{ parkId: "congaree" }], usersWilds: [] };
const mockDb = {
  get: (table: string) => ({ query: () => ({ fetch: async () => table === "parks" ? mockParks : mockParkWilds }) }),
};

jest.mock("@nozbe/watermelondb/react", () => ({ useDatabase: () => mockDb }));
jest.mock("../../services/AuthContext", () => ({ useAuthContext: () => ({ user: mockUser }) }));
jest.mock("../../contexts/ThemeProvider", () => ({ useTheme: () => ({ theme: require("../../theme").darkTheme }) }));
jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (callback: () => void) => require("react").useEffect(callback, [callback]),
}));
jest.mock("../../components/Wilds/WildAvatar", () => () => null);
jest.mock("../../components/Parks/ParkCard", () => {
  const { Pressable, Text } = require("react-native");
  return ({ parkId, parkName, wildId, navigation }: any) => (
    <Pressable testID={`park-card-${parkId}`} onPress={() => navigation.navigate("ParkDetails", { parkId, wildId })}>
      <Text>{parkName}</Text>
    </Pressable>
  );
});

beforeEach(() => { mockParkWilds = mockRelations; });

it("renders one card per park even when the complete relation list is repeated with different row IDs", async () => {
  mockParkWilds = [...mockRelations, ...mockRelations.map(r => ({ ...r, id: `duplicate-${r.id}` }))];
  const screen = render(<LogbookScreen navigation={{ navigate: jest.fn() }} />);
  await waitFor(() => expect(screen.getAllByText("Acadia")).toHaveLength(1));
  const list = screen.UNSAFE_getByType(FlatList);
  expect(list.props.data).toHaveLength(3);
  const keys = list.props.data.map((item: any) => list.props.keyExtractor(item));
  expect(new Set(keys).size).toBe(3);
  for (const park of mockParks) expect(screen.getAllByTestId(`park-card-${park.id}`)).toHaveLength(1);
  // Rendering must not mutate or delete the source records.
  expect(mockParkWilds).toHaveLength(6);
});

it("preserves park/Wild navigation and completion/unlock flags for unique cards", async () => {
  const navigate = jest.fn();
  const screen = render(<LogbookScreen navigation={{ navigate }} />);
  await waitFor(() => expect(screen.getByTestId("park-card-congaree")).toBeTruthy());
  const list = screen.UNSAFE_getByType(FlatList);
  expect(list.props.data.find((p: any) => p.parkId === "congaree")).toMatchObject({
    wildId: "scout", isParkPassCompleted: true, isWildUnlocked: false,
  });
  fireEvent.press(screen.getByTestId("park-card-congaree"));
  expect(navigate).toHaveBeenCalledWith("ParkDetails", { parkId: "congaree", wildId: "scout" });
});
