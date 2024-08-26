import { MockTestData } from '../../mockTestData.js';
import sessionCategories from '../../../helpers/Session/sessionCategories';
import { setGenerator } from '@nozbe/watermelondb/utils/common/randomId';
//import { testDb } from '../../../watermelon/testDB'; // Import the test database instance
import { v4 as uuidv4 } from 'uuid';
import { Q } from "@nozbe/watermelondb";
import handleError from "../../../helpers/ErrorHandler";
import {testDb} from "../../../watermelon/testDB";

 setGenerator(uuidv4);
 jest.mock('@nozbe/watermelondb/utils/common/randomId/randomId', () => {});

beforeEach(async () => {
    await testDb.write(async () => {
        try {
            // Create parks
            const parks = await Promise.all(
                MockTestData.parks.map(async (mockPark, idx) => {
                    return testDb.collections.get('parks').prepareCreate(park => {
                        park._raw._id = (idx + 1).toString();
                        park.parkName = mockPark.park_name;
                        park.parkType = mockPark.park_type;
                    });
                })
            );

            // Create trails
            const trails = await Promise.all(
                MockTestData.trails.map(async (mockTrail, idx) => {
                    return testDb.collections.get('trails').prepareCreate(trail => {
                        trail._raw._id = (idx + 1).toString(); // Use `id` instead of `_id`
                        trail.trailName = mockTrail.trail_name;
                        trail.parkId = mockTrail.park_id;
                        trail.trailDifficulty = mockTrail.trail_difficulty;
                        trail.trailLat = mockTrail.trail_lat;
                        trail.trailLong = mockTrail.trail_long;
                        trail.trailImageUrl = mockTrail.trail_image_url;
                        trail.trailElevation = mockTrail.trail_elevation;
                    });
                })
            );

            // Create parkStates
            const parkStates = await Promise.all(
                MockTestData.park_states.map(async (mockParkState, idx) => {
                    return testDb.collections.get('park_states').prepareCreate(parkState => {
                        parkState._raw._id = (idx + 1).toString(); // Ensure id is a string
                        parkState.parkId = mockParkState.park_id;
                        parkState.stateCode = mockParkState.state_code;
                        parkState.state = mockParkState.state_name;
                    });
                })
            );

            // Save all prepared records to the database in one batch operation
            await testDb.batch(...parks, ...trails, ...parkStates);

        } catch (err) {
            handleError(err, "test trail before each");
        }
    });
});

// Delete database after all describes and tests are run
afterAll(async () => {
    await testDb.write(async () => {
        await testDb.unsafeResetDatabase();
    });
});

describe('WatermelonDB trail getters', () => {
    test('gets trail by name', async () => {
        // Get all trails created before the test
        const trails = await testDb.collections.get('trails').query(Q.where('_id', '1'))
        console.log(trails[0]);
        // const fullRecord =  testDb.get('trails').query(
        //     Q.experimentalJoinTables(['parks']),
        //     Q.experimentalNestedJoin('parks', 'parks_states'),
        //     Q.unsafeSqlQuery(
        //         'select * from trails ' +
        //         'left join parks on trail.park_id is park.id ' +
        //         'left join park_states on parks.id is park_states.park_id' +
        //         'where trail.trail_name = ?', ["Old Faithful trail"]
        //     ),
        // ).unsafeFetchRaw()
        // console.log({fullRecord})

        //const trailParkDetail = await trail.getTrailParkDetail()
        expect(trails[0].trailName).toBe('Old Faithful trail')
        //expect(trailParkDetail.state).toBe("Maine"); // Ensure that the trails are fetched
    });
});