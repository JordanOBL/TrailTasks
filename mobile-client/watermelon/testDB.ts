import {
  Achievement,
  Addon,
  Cached_Friend,
  Park,
  Park_State,
  Park_Wild,
  Session_Addon,
  Session_Category,
  Trail,
  Token_Transaction,
  User,
  User_Achievement,
  User_Addon,
  User_Completed_Trail,
  User_Friend,
  User_Park,
  User_Purchased_Trail,
  User_Queued_Trail,
  User_Session,
  User_Wild,
  Wild,
} from "./models";

import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import migrations from "./migrations";
import mySchema from "./schema";

// Create the Node-based SQLite adapter
const adapter = new SQLiteAdapter({
  schema: mySchema,
  // Watermelon checks if we’re on RN or Node.
  // Because we mocked index.native, it’ll use `better-sqlite3` in Node.
  synchronous: true,
  migrations,
  jsi: false, // If your version of Watermelon complains about JSI, ensure it's off
});

export const testDb = new Database({
  adapter,
  modelClasses: [
    Achievement,
    User_Completed_Trail,
    Park,
    Park_State,
    User_Queued_Trail,
    Session_Category,
    Trail,
    Token_Transaction,
    User,
    User_Achievement,
    User_Purchased_Trail,
    User_Session,
    Addon,
    User_Addon,
    Session_Addon,
    User_Park,
    Cached_Friend,
    User_Friend,
    Wild,
    User_Wild,
    Park_Wild, // Ensure this is included in the model classes
  ],
  //@ts-ignore
  actionsEnabled: true,
});

const testTrails = [
  {
    id: "1",
    trail_name: "The Beehive Loop Trail",
    trail_distance: "1.5",
    trail_lat: "44.333805",
    trail_long: "-68.188822",
    trail_difficulty: "short",
    park_id: "1",
    trail_image_url:
      // 'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvMjE1NTUyOTYvODE4ZGJiMzQ5NjllOWU1ZGI5ZTE4ZjVjNjI0OGNlMjIuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      null,

    trail_elevation: "508",
    all_trails_url: "https://www.alltrails.com/trail/us/maine/the-beehive-loop-trail",
    nps_url: "https://www.nps.gov/thingstodo/hike-beehive-loop.htm",
    hiking_project_url: null,
    is_free: true,
  },
  {
    id: "2",
    trail_name: "Jordan Pond Path",
    trail_distance: "3.3",
    trail_lat: "44.3276",
    trail_long: "-68.2978",
    trail_difficulty: "short",
    park_id: "1",
    trail_image_url:
      "https://hikingproject.com/assets/photos/hike/7066444_medium_1579631798.jpg?cache=1686958647",
    trail_elevation: "0",
    all_trails_url: "https://www.alltrails.com/trail/us/maine/jordan-pond-path",
    nps_url: "https://www.nps.gov/thingstodo/hike-jordan-pond-path.htm",
    hiking_project_url: "https://www.hikingproject.com/trail/7007410/jordan-pond-path",
    is_free: true,
  },
  {
    id: "3",
    trail_name: "Cadillac South Ridge Trail",
    trail_distance: "6.7",
    trail_lat: "44.3276",
    trail_long: "-68.2978",
    trail_difficulty: "moderate",
    park_id: "1",
    // badge: 'Tallest Mountain on the East Coast
    trail_image_url:
      "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.travel-experience-live.com%2Fhiking-cadillac-mountain-maine%2F&psig=AOvVaw1hryp6NbJnZ5Sj1o71RLTN&ust=1687216177341000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCJiqkpn4zf8CFQAAAAAdAAAAABAJ",
    trail_elevation: "1530",
    all_trails_url: "https://www.alltrails.com/trail/us/maine/cadillac-south-ridge-trail--2",
    nps_url: "https://www.nps.gov/thingstodo/hike-cadillac-south-ridge-trail.htm",
    hiking_project_url: "https://www.hikingproject.com/trail/7007423/cadillac-south-ridge-trail",
    is_free: true,
  },
];

const testPark = {
  id: "1",
  park_name: "Acadia",
  park_type: "National",
  terrain_type: "coastal",
  climate: "average",
};

const testUser = {
  id: "1",
  // Basic fields so your code can read them
  username: "testusername",
  email: "testemail@example.com",
  password: "dfghjk23456iuy6y3uwk",
  dailyStreak: 0,
  trailProgress: "0.0",
  trailId: "1",
  trailStartedAt: new Date(),
  pushNotificationsEnabled: true,
  themePreference: "light",
};

export async function addPark(database: Database, overrides: Partial<Park> = {}) {
  if (!database) throw new Error("No database supplied");
  const parkToAdd = { ...structuredClone(testPark), ...overrides };
  const newPark = await database.write(async () => {
    const park = await database.collections.get<Park>("parks").create(park => {
      park._raw.id = parkToAdd.id;
      park.parkName = parkToAdd.park_name;
      park.parkType = parkToAdd.park_type;
      park.terrainType = parkToAdd.terrain_type;
      park.climate = parkToAdd.climate;
    });
    return park;
  });

  return newPark;
}
export async function addTrails(database: Database): Promise<Trail[]> {
  if (!database) throw new Error("No database supplied");

  const newTrails = await database.write(async () => {
    const preparedTrailArr = testTrails.map((t, index) =>
      database.collections.get<Trail>("trails").prepareCreate(trail => {
        trail._raw.id = t.id;
        trail.trailName = t.trail_name;
        trail.trailDifficulty = t.trail_difficulty;
        trail.trailDistance = t.trail_distance;
        trail.trailLat = t.trail_lat;
        trail.trailLong = t.trail_long;
        trail.parkId = t.park_id;
        trail.isFree = t.is_free;
      }),
    );

    await database.batch(...preparedTrailArr);
    return preparedTrailArr;
  });

  return newTrails ?? [];
}

export async function addUser(database: Database, overrides: Partial<User> = {}) {
  if (!database) throw new Error("No database supplied");
  const fixedUser = structuredClone(testUser);
  const userToAdd = { ...fixedUser, ...overrides };

  const newUser = await database.write(async () => {
    const user = await database.get<User>("users").create((user: User) => {
      user.username = userToAdd.username;
      user.email = userToAdd.email;
      user.trailId = userToAdd.trailId;
      user.trailProgress = userToAdd.trailProgress;
    });
    return user;
  });

  return newUser || null;
}
