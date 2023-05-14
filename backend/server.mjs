import express from 'express';
import cors from 'cors';
import bodyparser from 'body-parser';
import {
  Achievement,
  Park,
  Park_State,
  Session_Category,
  Trail,
  User,
  SYNC,
} from '../backend/db/sequelizeModel.mjs';
//import routes from "../routes/syncRoutes";
// import pool from "./db/config.js";
import {Sequelize} from 'sequelize';
// import pkg from "pg";
// const {Pool} = pkg;

const PGUSER = 'jordan';
//const PGHOST = "192.168.76.16";
const PGHOST = 'localhost';
const PGDBNAME = 'trailtasks';
const PGPORT = 5433;
const PGPASSWORD = '4046';

const sequelize = new Sequelize(PGDBNAME, PGUSER, PGPASSWORD, {
  host: PGHOST,
  port: PGPORT,
  dialect: 'postgres',
});

const app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));
app.use(cors());

//app.use("/api/sync", routes);

app.get('/api/seed', async (req, res) => {
  console.log('seeding postgres table...');

  const parks = await Park.bulkCreate([
    {id: '1', park_name: 'Acadia', park_type: 'National'},
    {id: '2', park_name: 'American Samoa', park_type: 'National'},
    {id: '3', park_name: 'Arches', park_type: 'National'},
    {id: '4', park_name: 'Badlands', park_type: 'National'},
    {id: '5', park_name: 'Big Bend', park_type: 'National'},
    {id: '6', park_name: 'Biscayne', park_type: 'National'},
    {
      id: '7',
      park_name: 'Black Canyon of the Gunnison',
      park_type: 'National',
    },
    {id: '8', park_name: 'Bryce Canyon', park_type: 'National'},
    {id: '9', park_name: 'Canyonlands', park_type: 'National'},
    {id: '10', park_name: 'Capitol Reef', park_type: 'National'},
    {id: '11', park_name: 'Carlsbad Caverns', park_type: 'National'},
    {id: '12', park_name: 'Channel Islands', park_type: 'National'},
    {id: '13', park_name: 'Congaree', park_type: 'National'},
    {id: '14', park_name: 'Crater Lake', park_type: 'National'},
    {id: '15', park_name: 'Cuyahoga Valley', park_type: 'National'},
    {id: '16', park_name: 'Death Valley', park_type: 'National'},
    {id: '17', park_name: 'Denali', park_type: 'National'},
    {id: '18', park_name: 'Dry Tortugas', park_type: 'National'},
    {id: '19', park_name: 'Everglades', park_type: 'National'},
    {
      id: '20',
      park_name: 'Gates of the Arctic',
      park_type: 'National',
    },
    {id: '21', park_name: 'Gateway Arch', park_type: 'National'},
    {id: '22', park_name: 'Glacier Bay', park_type: 'National'},
    {id: '23', park_name: 'Glacier', park_type: 'National'},
    {id: '24', park_name: 'Grand Canyon', park_type: 'National'},
    {id: '25', park_name: 'Grand Teton', park_type: 'National'},
    {id: '26', park_name: 'Great Basin', park_type: 'National'},
    {id: '27', park_name: 'Great Sand Dunes', park_type: 'National'},
    {
      id: '28',
      park_name: 'Great Smoky Mountains',
      park_type: 'National',
    },
    {
      id: '29',
      park_name: 'Guadalupe Mountains',
      park_type: 'National',
    },
    {id: '30', park_name: 'Haleakala', park_type: 'National'},
    {id: '31', park_name: 'Hawaii Volcanoes', park_type: 'National'},
    {id: '32', park_name: 'Hot Springs', park_type: 'National'},
    {id: '33', park_name: 'Indiana Dunes', park_type: 'National'},
    {id: '34', park_name: 'Isle Royale', park_type: 'National'},
    {id: '35', park_name: 'Joshua Tree', park_type: 'National'},
    {id: '36', park_name: 'Katmai', park_type: 'National'},
    {id: '37', park_name: 'Kenai Fjords', park_type: 'National'},
    {id: '38', park_name: 'Kings Canyon', park_type: 'National'},
    {id: '39', park_name: 'Kobuk Valley', park_type: 'National'},
    {id: '40', park_name: 'Lake Clark', park_type: 'National'},
    {id: '41', park_name: 'Lassen Volcanic', park_type: 'National'},
    {id: '42', park_name: 'Mammoth Cave', park_type: 'National'},
    {id: '43', park_name: 'Mesa Verde', park_type: 'National'},
    {id: '44', park_name: 'Mount Rainier', park_type: 'National'},
    {id: '45', park_name: 'New River Gorge', park_type: 'National'},
    {id: '46', park_name: 'North Cascades', park_type: 'National'},
    {id: '47', park_name: 'Olympic', park_type: 'National'},
    {id: '48', park_name: 'Petrified Forest', park_type: 'National'},
    {id: '49', park_name: 'Pinnacles', park_type: 'National'},
    {id: '50', park_name: 'Redwood', park_type: 'National'},
    {id: '51', park_name: 'Rocky Mountain', park_type: 'National'},
    {id: '52', park_name: 'Saguaro', park_type: 'National'},
    {id: '53', park_name: 'Sequoia', park_type: 'National'},
    {id: '54', park_name: 'Shenandoah', park_type: 'National'},
    {
      id: '55',
      park_name: 'Theodore Roosevelt',
      park_type: 'National',
    },
    {id: '56', park_name: 'Virgin Islands', park_type: 'National'},
    {id: '57', park_name: 'Voyageurs', park_type: 'National'},
    {id: '58', park_name: 'White Sands', park_type: 'National'},
    {id: '59', park_name: 'Wind Cave', park_type: 'National'},
    {
      id: '60',
      park_name: 'Wrangell-St. Elias',
      park_type: 'National',
    },
    {id: '61', park_name: 'Yellowstone', park_type: 'National'},
    {id: '62', park_name: 'Yosemite', park_type: 'National'},
    {id: '63', park_name: 'Zion', park_type: 'National'},
  ]);
  const park_states = await Park_State.bulkCreate([
    {
      id: '1',
      park_id: '1',
      state_code: 'ME',
      state: 'Maine',
    },
    {
      id: '2',
      park_id: '2',
      state_code: 'AS',
      state: 'American Samoa',
    },
    {
      id: '3',
      park_id: '3',
      state_code: 'UT',
      state: 'Utah',
    },
    {
      id: '4',
      park_id: '4',
      state_code: 'SD',
      state: 'South Dakota',
    },
    {
      id: '5',
      park_id: '5',
      state_code: 'TX',
      state: 'Texas',
    },
    {
      id: '6',
      park_id: '6',
      state_code: 'FL',
      state: 'Florida',
    },
    {
      id: '7',
      park_id: '7',
      state_code: 'CO',
      state: 'Colorado',
    },
    {
      id: '8',
      park_id: '8',
      state_code: 'UT',
      state: 'Utah',
    },
    {
      id: '9',
      park_id: '9',
      state_code: 'UT',
      state: 'Utah',
    },
    {
      id: '10',
      park_id: '10',
      state_code: 'UT',
      state: 'Utah',
    },
    {
      id: '11',
      park_id: '11',
      state_code: 'NM',
      state: 'New Mexico',
    },
    {
      id: '12',
      park_id: '12',
      state_code: 'CA',
      state: 'California',
    },
    {
      id: '13',
      park_id: '13',
      state_code: 'SC',
      state: 'South Carolina',
    },
    {
      id: '14',
      park_id: '13',
      state_code: 'VA',
      state: 'Virginia',
    },
    {
      id: '15',
      park_id: '14',
      state_code: 'OR',
      state: 'Oregon',
    },
    {
      id: '16',
      park_id: '15',
      state_code: 'OH',
      state: 'Ohio',
    },
    {
      id: '17',
      park_id: '16',
      state_code: 'CA',
      state: 'California',
    },
    {
      id: '18',
      park_id: '16',
      state_code: 'NV',
      state: 'Nevada',
    },
    {
      id: '19',
      park_id: '17',
      state_code: 'AK',
      state: 'Alaska',
    },
    {
      id: '20',
      park_id: '18',
      state_code: 'FL',
      state: 'Florida',
    },
    {
      id: '21',
      park_id: '19',
      state_code: 'FL',
      state: 'Florida',
    },
    {
      id: '22',
      park_id: '20',
      state_code: 'AK',
      state: 'Alaska',
    },
    {
      id: '23',
      park_id: '21',
      state_code: 'MO',
      state: 'Missouri',
    },
    {
      id: '24',
      park_id: '22',
      state_code: 'AK',
      state: 'Alaska',
    },
    {
      id: '25',
      park_id: '23',
      state_code: 'MT',
      state: 'Montana',
    },
    {
      id: '26',
      park_id: '24',
      state_code: 'AZ',
      state: 'Arizona',
    },
    {
      id: '27',
      park_id: '25',
      state_code: 'WY',
      state: 'Wyoming',
    },
    {
      id: '28',
      park_id: '26',
      state_code: 'NV',
      state: 'Nevada',
    },
    {
      id: '29',
      park_id: '27',
      state_code: 'CO',
      state: 'Colorado',
    },
    {
      id: '30',
      park_id: '28',
      state_code: 'TN',
      state: 'Tennessee',
    },
    {
      id: '31',
      park_id: '28',
      state_code: 'NC',
      state: 'North Carolina',
    },
    {
      id: '32',
      park_id: '29',
      state_code: 'TX',
      state: 'Texas',
    },
    {
      id: '33',
      park_id: '30',
      state_code: 'HI',
      state: 'Hawaii',
    },
    {
      id: '34',
      park_id: '31',
      state_code: 'HI',
      state: 'Hawaii',
    },
    {
      id: '35',
      park_id: '32',
      state_code: 'AR',
      state: 'Arkansas',
    },
    {
      id: '36',
      park_id: '33',
      state_code: 'IN',
      state: 'Indiana',
    },
    {
      id: '37',
      park_id: '34',
      state_code: 'MI',
      state: 'Michigan',
    },
    {
      id: '38',
      park_id: '35',
      state_code: 'CA',
      state: 'California',
    },
    {
      id: '39',
      park_id: '36',
      state_code: 'AK',
      state: 'Alaska',
    },
    {
      id: '40',
      park_id: '37',
      state_code: 'AK',
      state: 'Alaska',
    },
    {
      id: '41',
      park_id: '38',
      state_code: 'CA',
      state: 'California',
    },
    {
      id: '42',
      park_id: '39',
      state_code: 'AK',
      state: 'Alaska',
    },
    {
      id: '43',
      park_id: '40',
      state_code: 'AK',
      state: 'Alaska',
    },
    {
      id: '44',
      park_id: '41',
      state_code: 'CA',
      state: 'California',
    },
    {
      id: '45',
      park_id: '42',
      state_code: 'KY',
      state: 'Kentucky',
    },
    {
      id: '46',
      park_id: '43',
      state_code: 'CO',
      state: 'Colorado',
    },
    {
      id: '47',
      park_id: '44',
      state_code: 'WA',
      state: 'Washington',
    },
    {
      id: '48',
      park_id: '45',
      state_code: 'WV',
      state: 'West Virginia',
    },
    {
      id: '49',
      park_id: '46',
      state_code: 'WA',
      state: 'Washington',
    },

    {
      id: '50',
      park_id: '47',
      state_code: 'WA',
      state: 'Washington',
    },
    {
      id: '51',
      park_id: '48',
      state_code: 'AZ',
      state: 'Arizona',
    },
    {
      id: '52',
      park_id: '49',
      state_code: 'CA',
      state: 'California',
    },
    {
      id: '53',
      park_id: '50',
      state_code: 'CA',
      state: 'California',
    },
    {
      id: '54',
      park_id: '51',
      state_code: 'CO',
      state: 'Colorado',
    },
    {
      id: '55',
      park_id: '52',
      state_code: 'AZ',
      state: 'Arizona',
    },
    {
      id: '56',
      park_id: '53',
      state_code: 'CA',
      state: 'California',
    },
    {
      id: '57',
      park_id: '54',
      state_code: 'VA',
      state: 'Virginia',
    },
    {
      id: '58',
      park_id: '55',
      state_code: 'ND',
      state: 'North Dakota',
    },
    {
      id: '59',
      park_id: '56',
      state_code: 'VI',
      state: 'Virgin Islands',
    },
    {
      id: '60',
      park_id: '57',
      state_code: 'MN',
      state: 'Minnesota',
    },
    {
      id: '61',
      park_id: '58',
      state_code: 'NM',
      state: 'New Mexico',
    },
    {
      id: '62',
      park_id: '59',
      state_code: 'SD',
      state: 'South Dakota',
    },
    {
      id: '63',
      park_id: '60',
      state_code: 'AK',
      state: 'Alaska',
    },
    {
      id: '64',
      park_id: '61',
      state_code: 'WY',
      state: 'Idaho',
    },
    {
      id: '65',
      park_id: '61',
      state_code: 'MO',
      state: 'Montana',
    },
    {
      id: '66',
      park_id: '61',
      state_code: 'ID',
      state: 'Idaho',
    },
    {
      id: '67',
      park_id: '62',
      state_code: 'CA',
      state: 'California',
    },
    {
      id: '68',
      park_id: '63',
      state_code: 'UT',
      state: 'Utah',
    },
  ]);
  const trails = await Trail.bulkCreate([
    {
      id: '1',
      trail_name: 'Old Faithful trail',
      trail_distance: '2.2',
      trail_lat: '44.4601',
      trail_long: '-110.8281',
      trail_difficulty: 'short',
      park_id: '61',
      trail_image_url:
        'https://www.nps.gov/articles/images/19255d.jpg?maxwidth=1300&maxheight=1300&autorotate=false',
      trail_elevation: '0',
    },
    {
      id: '2',
      trail_name: 'Mount Washburn trail',
      trail_distance: '6.2',
      trail_lat: '44.8938',
      trail_long: '-110.4037',
      trail_difficulty: 'moderate',
      park_id: '61',
      trail_image_url:
        'https://www.nps.gov/common/uploads/place/import/f3f0cc30-0062-4229-af63-db99985d9ab2_image_350.jpg',
      trail_elevation: '0',
    },
    {
      id: '3',
      trail_name: 'Fairy Falls trail',
      trail_distance: '8.3',
      trail_lat: '44.6677',
      trail_long: '-110.8656',
      trail_difficulty: 'moderate',
      park_id: '61',
      trail_image_url:
        'https://www.nps.gov/common/uploads/cropped_image/primary/6E135C3B-1DD8-B71B-0B48ABBCAE1A44D6.jpg?width=1300&quality=90&mode=crop',
      trail_elevation: '0',
    },
    {
      id: '4',
      trail_name: 'Yosemite Falls trail',
      trail_distance: '7.2',
      trail_lat: '37.7459',
      trail_long: '-119.5965',
      trail_difficulty: 'moderate',
      park_id: '62',
      trail_image_url: 'https://www.nps.gov/yose/planyourvisit/index.htm',
      trail_elevation: '0',
    },
    {
      id: '5',
      trail_name: 'Half Dome trail',
      trail_distance: '14.2',
      trail_lat: '37.746',
      trail_long: '-119.5336',
      trail_difficulty: 'long',
      park_id: '62',
      trail_image_url:
        'https://www.myyosemitepark.com/wp-content/uploads/2021/12/YO-HalfDome-cables-trail_distance_Ordelheide_1500.jpg',
      trail_elevation: '0',
    },
    {
      id: '6',
      trail_name: 'Mist trail',
      trail_distance: '3',
      trail_lat: '37.7324',
      trail_long: '-119.5634',
      trail_difficulty: 'short',
      park_id: '62',
      trail_image_url:
        'https://www.yosemite.com/wp-content/uploads/2016/05/Vernal-Fall-at-Yosemite-Mariposa.jpg',
      trail_elevation: '0',
    },
    {
      id: '7',
      trail_name: 'Jordan Pond Path',
      trail_distance: '3.3',
      trail_lat: '44.3276',
      trail_long: '-68.2978',
      trail_difficulty: 'short',
      park_id: '1',
      trail_image_url:
        'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.mainetrailfinder.com%2Ftrails%2Ftrail%2Facadia-national-park-jordan-pond-path&psig=AOvVaw1hLlupTifHsIknQM9uLGG4&ust=1682896155063000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCKCVhO6a0P4CFQAAAAAdAAAAABAJ',
      trail_elevation: '0',
    },
    {
      id: '8',
      trail_name: 'Lower Sauma Ridge Trail',
      trail_distance: '1.5',
      trail_lat: '-14.2462',
      trail_long: '-170.6858',
      trail_difficulty: 'short',
      park_id: '2',
      trail_image_url:
        'https://s3-media0.fl.yelpcdn.com/bphoto/toIXdbXHxbeZ2bVLCS_-Zg/348s.jpg',
      trail_elevation: '0',
    },
    {
      id: '9',
      trail_name: 'Park Avenue Trail',
      trail_distance: '2',
      trail_lat: '38.7343',
      trail_long: '-109.5943',
      trail_difficulty: 'short',
      park_id: '3',
      trail_image_url:
        'https://www.encirclephotos.com/wp-content/uploads/Utah-Arches-National-Park-Park-Avenue-Viewpoint-1440x954.jpg',
      trail_elevation: '320',
    },
    {
      id: '10',
      trail_name: 'Door Trail',
      trail_distance: '0.75',
      trail_lat: '43.7226',
      trail_long: '-102.4842',
      trail_difficulty: 'short',
      park_id: '4',
      trail_image_url:
        'https://www.flashpackingamerica.com/wp-content/uploads/2021/09/best-hikes-in-badlands-door-trail-2-.jpeg',
      trail_elevation: '30',
    },
    {
      id: '11',
      trail_name: 'Lost Mine Trail',
      trail_distance: '4.8',
      trail_lat: '29.2708',
      trail_long: '-103.3219',
      trail_difficulty: 'short',
      park_id: '5',
      trail_image_url:
        'https://static1.squarespace.com/static/56bfc6c722482edc3dc304c8/5b4001b9562fa7b8dd8b2bf1/5b4108551ae6cf2d20d169b3/1607449693180/?format=1500w',
      trail_elevation: '1100',
    },
    {
      id: '12',
      trail_name: 'Jones Lagoon Trail',
      trail_distance: '1.5',
      trail_lat: '25.5015',
      trail_long: '-80.2105',
      trail_difficulty: 'short',
      park_id: '6',
      trail_image_url:
        'https://www.miamiandbeaches.com/getmedia/70a278ec-2691-4425-a5e6-4e2238ea2ae9/gmcvb21_biscayne_map_joneslagoon_1440x900.jpeg',
      trail_elevation: '0',
    },
  ]);
  const session_categories = await Session_Category.bulkCreate([
    {id: '1', session_category_name: 'Chores'},
    {id: '2', session_category_name: 'Cooking'},
    {id: '3', session_category_name: 'Drawing'},
    {id: '4', session_category_name: 'Driving'},
    {id: '5', session_category_name: 'Errands'},
    {id: '6', session_category_name: 'Family'},
    {id: '7', session_category_name: 'Meditating'},
    {id: '8', session_category_name: 'Other'},
    {id: '9', session_category_name: 'Outdoors'},
    {id: '10', session_category_name: 'Pets'},
    {id: '11', session_category_name: 'Reading'},
    {id: '12', session_category_name: 'Social'},
    {id: '13', session_category_name: 'Sports'},
    {id: '14', session_category_name: 'Study'},
    {id: '15', session_category_name: 'Work'},
    {id: '16', session_category_name: 'Workout'},
    {id: '17', session_category_name: 'Writing'},
    {id: '18', session_category_name: 'Yoga'},
  ]);
  const achievements = await Achievement.bulkCreate([
    {
      id: '1',
      achievement_name: 'Hiker Extraordinaire',
      achievement_description: 'Hiked 50 miles',
      achievement_image_url: 'https://example.com/achievement1.png',
    },
    {
      id: '2',
      achievement_name: 'Hiker Novice',
      achievement_description: 'Hiked 20 miles',
      achievement_image_url: 'https://example.com/achievement2.png',
    },
    {
      id: '3',
      achievement_name: 'First of Many',
      achievement_description: 'First 1.0 Miles',
      achievement_image_url: 'https://example.com/achievement2.png',
    },
  ]);
  console.log('Seed Successful)');
  res.status(200).json(trails);
});

const connect = async () => {
  try {
    await SYNC();

    console.log('connected to Postgres database trailtasks viia Sequelize!');

    app.listen(5500, () => {
      console.log('listening and connected to express server trailtasks!');
    });
  } catch (err) {
    console.log(err);
  }
};

connect();
