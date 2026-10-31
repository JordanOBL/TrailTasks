import { calculateWildXpProgress, User_Queued_Trail } from "./models.ts";
import { addPark, addTrails, addUser, testDb } from "./testDB.ts";

describe("calculateWildXpProgress", () => {
  beforeEach(async () => {
    await testDb.write(async () => {
      await testDb.unsafeResetDatabase();
    });
  });

  test("defaults invalid xp_to_next instead of looping forever", () => {
    expect(
      calculateWildXpProgress({
        currentXp: 0,
        xpToNext: 0,
        level: 0,
        rewardXp: 0,
      }),
    ).toEqual({ xp: 0, level: 1, xpToNext: 100 });
  });

  test("levels up with a positive threshold", () => {
    expect(
      calculateWildXpProgress({
        currentXp: 95,
        xpToNext: 100,
        level: 1,
        rewardXp: 10,
      }),
    ).toEqual({ xp: 5, level: 2, xpToNext: 150 });
  });
  test("pro users next trail pops and uses next queued trail if set", async () => {
    await addPark(testDb);
    const trails = await addTrails(testDb);
    const user = await addUser(testDb);

    const queued: User_Queued_Trail = await testDb.write(async () => {
      const queued = await testDb.get<User_Queued_Trail>("users_queued_trails").create(q => {
        q.trailId = trails?.[1]?.id;
        q.userId = user.id;
      });
      return queued;
    });

    await user.assignNewTrail({ completedTrailId: "1", isProMember: true });
    const currentlyQueued = await user.usersQueuedTrails;
    expect(user.trailId).toEqual(queued.trailId);
    expect(currentlyQueued.length).toBe(0);
  });
});
describe("assign new trail", () => {
  beforeEach(async () => {
    await testDb.write(async () => {
      await testDb.unsafeResetDatabase();
    });
  });

  test("pro users next trail pops and uses next queued trail if set", async () => {
    await addPark(testDb);
    const trails = await addTrails(testDb);
    const user = await addUser(testDb);

    const queued: User_Queued_Trail = await testDb.write(async () => {
      const queued = await testDb.get<User_Queued_Trail>("users_queued_trails").create(q => {
        q.trailId = trails?.[1]?.id;
        q.userId = user.id;
      });
      return queued;
    });

    await user.assignNewTrail({ completedTrailId: "1", isProMember: true });
    const currentlyQueued = await user.usersQueuedTrails;
    expect(user.trailId).toEqual(queued.trailId);
    expect(currentlyQueued.length).toBe(0);
  });

  test("non pro users doesnt use queued trail", async () => {
    await addPark(testDb);
    const trails = await addTrails(testDb);
    const user = await addUser(testDb);

    const queued: User_Queued_Trail = await testDb.write(async () => {
      const queued = await testDb.get<User_Queued_Trail>("users_queued_trails").create(q => {
        q.trailId = trails?.[1]?.id;
        q.userId = user.id;
      });
      return queued;
    });

    await user.assignNewTrail({ completedTrailId: "1", isProMember: false });
    const currentlyQueued = await user.usersQueuedTrails;
    // We dont check if the users new trail isnt the queued trail because there
    // could be a lucky case were their queueded trail is randomly chosen but not from their queue
    expect(currentlyQueued.length).toBe(1);
  });
});
