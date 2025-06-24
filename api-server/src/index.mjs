/* eslint-disable no-sparse-arrays */
/* eslint-disable prettier/prettier */

import {
    Achievement,
    Addon,
    Park,
    User_Completed_Trail,
    Park_State,
    SYNC,
    Session_Category,
    //Subscription,
    Trail,
    User,
    User_Addon,
    User_Achievement,
    User_Purchased_Trail,
    User_Session,
    Session_Addon,
    User_Park,
    User_Friend
} from './db/sequelizeModel.js';
// import pool from "./db/config.js";

import {Sequelize, Op, QueryTypes} from 'sequelize';
import achievementsWithIds from './assets/Achievements/addAchievementIds.js';
import bodyparser from 'body-parser';
import cors from 'cors';
import express from 'express';
import masterAchievementList from './assets/Achievements/masterAchievementList.js';
import dotenv from 'dotenv';
import cron from 'node-cron';
import {exec} from 'child_process';
import InitialParks from "./helpers/Parks/InitialParks.js";
import InitialParkStates from "./helpers/ParkState/InitialParkStates.js";
import InitialAddons from "./helpers/Addons/InitialAddons.js";
import InitialSessionCategories from "./helpers/Session/InitialSessionCategories.js";
import InitialTrails from "./helpers/Trails/InitialTrails.js";
import res from "express/lib/response.js";
// Load environment variables from the correct file based on the environment
dotenv.config({
    path: process.env.NODE_ENV === 'production' ? '.env.production' : process.env.NODE_ENV === 'development' ? '.env.development' : '.env.test'
});

const newAchievements = achievementsWithIds(masterAchievementList);

export const sequelize = new Sequelize(process.env.PGDBNAME, process.env.PGUSER, process.env.PGPASSWORD, {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    dialect: 'postgres',
    // dialectOptions: {
    //   ssl: {
    //     require: true,
    //     rejectUnauthorized: false,
    //   },
    // },
});

const app = express();
app.use(express.json());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));
app.use('*', cors());

//app.use("/api/sync", router);
console.log(`Current working directory: ${process.cwd()}`);

//Cron Scheduler for Changing Free Parks each month
cron.schedule('10 3 * * 6', () => {
  console.log('Running Free Trail ReRoll Cron');
  exec(process.env.REROLL_FREE_TRAILS, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error running Free Trail ReRoll Cron : ${err.message}`);
      return;
    }
    if (stderr) {
      console.error(`Stderr from Free Trail ReRoll Cron ${stderr}`);
      return;
    }
    console.log(`Output from Free Trail ReRoll Cron ${stdout}`);
  });
}, {timezone: "America/New_York"});

//Cron Scheduler for Changing Trail of the week
cron.schedule('10 3 * * 6', () => {
  console.log('Running Trail of The Week ReRoll Cron');
  exec(process.env.REROLL_TRAIL_OF_THE_WEEK, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error running Trail Of the Week Cron : ${err.message}`);
      return;
    }
    if (stderr) {
      console.error(`Stderr from Trail Of the Week Cron ${stderr}`);
      return;
    }
    console.log(`Output from Trail Of The Week Cron ${stdout}`);
  });
}, {timezone: "America/New_York"});

const findUser = async (req, res, next) => {
    let { email, password } = req.body;

    try {
        email = email.toLowerCase();
        
        // Query the database for the user
        const user = await User.findOne({ where: { email, password } });
        console.log('user from server findUser()', user);

        // Set userId in res.locals
        if (user) {

            //const userSubscription = await Subscription.findAll({ where: { user_id: user.id } });
            const userSessions = await User_Session.findAll({ where: { user_id: user.id } });
            const userPurchasedTrails = await User_Purchased_Trail.findAll({ where: { user_id: user.id } });
            const userAchievements = await User_Achievement.findAll({ where: { user_id: user.id } });
            const usersCompletedTrails = await User_Completed_Trail.findAll({where: {user_id: user.id}});
            const userAddons = await User_Addon.findAll({where: {user_id: user.id}});
            const userParks = await User_Park.findAll({where: {user_id: user.id}});
            const userFriends = await User_Friend.findAll({where: {user_id: user.id}});
            res.locals.user = user;
            //res.locals.userSubscription = userSubscription;
            res.locals.userSessions = userSessions;
            res.locals.userPurchasedTrails = userPurchasedTrails;
            res.locals.userAchievements = userAchievements;
            res.locals.userCompletedTrails = usersCompletedTrails;
            res.locals.userAddons = userAddons;
            res.locals.userParks = userParks;
            res.locals.userFriends = userFriends;

        } else {
            res.locals.user = null;
            //res.locals.userSubscription = null;
            res.locals.userSessions = null;
            res.locals.userPurchasedTrails = null;
            res.locals.userAchievements = null;
            res.locals.userCompletedTrails = null; 
            res.locals.userAddons = null;
            res.locals.userParks = null;
            res.locals.userFriends = null;

        }

        // Continue to the next middleware/route handler
        return next();
    } catch (error) {
        // Handle any errors that occur
        console.error('Error in findUser middleware:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
const registerValidation = async (req, res, next) => {
    let { email, username } = req.body;
    email = email.toLowerCase();
    username = username.toLowerCase();
    let user;

    try {
        // Query the database for the user
        user = await User.findOne({ where: { email } });

        // Set userId in res.locals
        if (user) {
            console.debug('registerValidation User already exists via email', user )
            res.locals.duplicateAttribute = 'Email';
            return next();
        } 
        user = await User.findOne({ where: { username } });

         if (user) {
            console.debug('registerValidation User already exists via username', user)
            res.locals.duplicateAttribute = 'Username';
            return next();
        } 
        // Continue to the next middleware/route handler
        console.debug('registerValidation User does not exist', user)
        res.locals.duplicateAttribute = '';
        return next();
    } catch (error) {
        // Handle any errors that occur
        console.error('Error in registerValidation middleware:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const getGlobalLeaderboards = async (req, res, next) => {
    const query = 'SELECT users.username, CAST(COALESCE(NULLIF(users.total_miles, \'\'), \'0.00\') AS DOUBLE PRECISION) AS total_miles  FROM users ' +
        'WHERE users.total_miles IS NOT NULL ' +
        'ORDER BY CAST(users.total_miles AS DOUBLE PRECISION) DESC ' +
        'LIMIT 100;'

    try {
        const [results, metadata] = await sequelize.query(query);

        if (results && results.length > 0) {
            res.locals.top100Rankings = results;
            console.log('Global Leaderboards:', results);
        } else {
            res.locals.top100Rankings = []; // Handle the case where no results are found
            console.log('No data found for the query');
        }

        return next();

    } catch (err) {
        console.error('Error in getGlobalLeaderboards:', err); // Improved error logging
        return next({ err, message: 'Error in server getGlobalLeaderboards' });
    }
}
const getUserRank = async (req, res, next) => {
    const { userId } = req.body;
    if (!userId) {
        return next(new Error('No User'));
    }
    try {
        const results = await sequelize.query(`
WITH RankedUsers AS (
SELECT
users.id AS user_id,
users.username,
CAST(COALESCE(NULLIF(users.total_miles, ''), '0.00') AS DOUBLE PRECISION) AS total_miles,
RANK() OVER (ORDER BY CAST(COALESCE(NULLIF(users.total_miles, ''), '0.00') AS DOUBLE PRECISION) DESC) AS rank
FROM users
)
SELECT *
FROM RankedUsers
WHERE user_id = $1
`,
            {
                bind: [userId],
                type: QueryTypes.SELECT,
            }// Ensures results are returned as objects
        );

        if (results.length > 0) {

            res.locals.userRank = results[0]; // Since you're likely getting an array, take the first item
            // Log the user's rank
        } else {
            res.locals.userRank = null;
            console.log('User not found');
        }
        return next();

    } catch (err) {
        return next({ err, message: 'Error in server getLeaderboards' });
    }
}


//Friends search
const friendSearch = async (req, res, next) => {
    let username = req.query.username
    username = username.toLowerCase();
    try {
        
       // const friend = await User.findOne({ where: { username } });
        //const {password, ...safeFriend} = friend;
            const query = `SELECT users.id as friend_id, users.username, users.total_miles, trails.trail_name as current_trail, users.trail_progress, users.room_id FROM users JOIN trails ON trails.id = users.trail_id WHERE users.username = $1;`
        const results = await sequelize.query(query, {
            bind: [username],
            type: QueryTypes.SELECT,
        })
        console.log('friend from server friendSearch()', results);
        if (!results || results.length === 0) {
            res.locals.friend = null;
            return next();
        }

        res.locals.friend = results[0];
        return next();
    } catch (error) {
        console.error('Error in searchUser middleware:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


app.get('/api/searchFriends', friendSearch, async (req, res, next) => {

    if (res.locals.friend) {
        console.debug('searchFriends', res.locals.friend)
        // Respond with userId if found
        return res.status(200).json({ friend: res.locals.friend, message: 'Friend found' });
    } else {
        // Respond with a 404 status code if user not found
        return res.status(404).json({ friend: null, message: 'Friend not found' });
    }
})
const getCachedFriends = async (req, res, next) => {
    const userId  = req.query.userId;
    console.log('getCachedFriends UserId param', userId);
    const query = `SELECT users.id as friend_id, users.username, users.total_miles, trails.trail_name as current_trail, users.room_id FROM users JOIN trails ON trails.id = users.trail_id WHERE users.id IN (SELECT friend_id FROM users_friends WHERE user_id = $1);`
    //const query = `SELECT * FROM users_friends WHERE user_id = $1;`


    try {
        const results = await sequelize.query(query, {
            bind: [userId],
            type: QueryTypes.SELECT,
        });
        if (results && results.length > 0) {

            console.log('Global Friends:', results);
            const friendMap = {}
            results.forEach((friend) => {

                friendMap[friend.friend_id] = friend

            })
            console.log(friendMap)
            res.locals.friends = friendMap;
        } else {
            res.locals.friends = []; // Handle the case where no results are found
            console.log('No data found for the query');
        }
        return next();
    } catch (err) {
        console.error('Error in getCachedFriends:', err); // Improved error logging
        return next({ err, message: 'Error in server getCachedFriends' });
    }
 }
app.get('/api/cachedFriends', getCachedFriends, async (req, res, next) => {
    console.log('calling getCachedFriends');

    if (res.locals.friends) {
        // Respond with friends if found
        return res.status(200).json({ friends: res.locals.friends });
    } else {
        // Respond with a 404 status code if friends not found
        return res.status(404).json({ message: 'Friends not found' });
    }
});
app.post('/api/users', findUser, async (req, res, next) => {
    const { user, userSessions, userPurchasedTrails, userAchievements, userCompletedTrails, userAddons, userParks} = res.locals;

    if (user) {
        // Respond with userId if found
        return res.status(200).json({ user, userSessions, userPurchasedTrails, userAchievements, userCompletedTrails, userAddons, userParks });
    } else {
        // Respond with a 404 status code if user not found
        return res.status(404).json({ message: 'User not found' });
    }
});

app.post('/api/registerValidation', registerValidation, async (req, res, next) => {
    const {duplicateAttribute} = res.locals;

    if (duplicateAttribute != '') {
        // Respond with a 409 status code if user already exists
        return res.status(409).json({ duplicateAttribute, message: `${duplicateAttribute} already exists` });
    } else {
        // Continue to the next middleware/route handler
        return res.status(200).json({ duplicateAttribute: '', message: 'Validation successful' }); 
    }
});

app.post('/api/leaderboards', getGlobalLeaderboards, getUserRank, async (req, res, next)=>{
    const {top100Rankings, userRank} = res.locals;
    if (top100Rankings && userRank) {
        // Respond with userId if found
        return res.status(200).json({top100Rankings,userRank});
    } else {
        // Respond with a 404 status code if user not found
        return res.status(404).json({ message: 'No Data Found' });
    }
})

const getSafeLastPulledAt = (lastPulledAt) =>
{
    console.debug({lastPulledAt})
    if (lastPulledAt !== 'null') {
        console.debug('last pulled at exists and it is', lastPulledAt);
        return new Date(parseInt(lastPulledAt, 10)).toISOString();
    }
    console.debug('last pulled does NOT exist and it is null', lastPulledAt);
    return new Date(0).toISOString();
};
//send updated and new changes to the user that were done after 'lastPulledAt
//*currently successfully send new users to users watermelon database !
app.get('/pull', async (req, res) => {
    try {
        let lastPulledAt = getSafeLastPulledAt(req.query.last_pulled_at);
        const userId = req.query.userId;
        console.debug('user in pull id', userId);
        console.log('last pulled at', {lastPulledAt});
        if (lastPulledAt === new Date(0).toISOString()) {
            console.log("Initial Data Pull From Server...")
            const createdAddons = await Addon.findAll({});
            const createdAchievements = await Achievement.findAll({});

            const createdParks = await Park.findAll({});

            const createdTrails = await Trail.findAll({});

            const createdParkStates = await Park_State.findAll({});

            const createdSessionCategories = await Session_Category.findAll({});

            const responseData = {
                changes: {
                    addons: {
                        created:[],
                        updated: createdAddons,
                        deleted: [],
                    },
                    achievements: {
                        created:[],
                        updated: createdAchievements,
                        deleted: [],
                    },
                    parks: {
                        created:[],
                        updated: createdParks,
                        deleted: [],
                    },
                    trails: {
                        created:[],
                        updated: createdTrails,
                        deleted: [],
                    },
                    park_states: {
                        created:[],
                        updated: createdParkStates,
                        deleted: [],
                    },
                    session_categories: {
                        created: [],
                        updated:  createdSessionCategories,
                        deleted: [],
                    },

                },
                timestamp: Date.now(),
            };

            console.log('Initial Data Pull Complete...');
            return res.json(responseData);
        } else {
            console.log(`Server: sending all data changes for user: ${userId} since last device pull at: ${lastPulledAt} `)
            const createdAddons = await Addon.findAll({
                where: {
                    createdAt: {
                        [Sequelize.Op.gt]: lastPulledAt,
                    },
                },
            });
           const createdUserAddons = await User_Addon.findAll({
                where: {
                    createdAt: {
                        [Sequelize.Op.gt]: lastPulledAt,
                    },
                    user_id: userId,
                },
            });
            const createdParks = await Park.findAll({
                where: {
                    createdAt: {
                        [Sequelize.Op.gt]: lastPulledAt,
                    },
                },
            });
            const createdUsers = await User.findAll({
                where: {
                    createdAt: {
                        [Sequelize.Op.gt]: lastPulledAt,
                    },
                    id:{[Sequelize.Op.eq]: userId},
                },
            });
//            const createdSubscriptions = await Subscription.findAll({
//                where: {
//                    createdAt: {
//                        [Sequelize.Op.gt]: lastPulledAt,
//                    },
//                },
//            });
//
            const createdTrails = await Trail.findAll({
                where: {
                    createdAt: {
                        [Sequelize.Op.gt]: lastPulledAt,
                    },
                },
            });
            const createdAchievements = await Achievement.findAll({
                where: {
                    createdAt: {
                        [Sequelize.Op.gt]: lastPulledAt,
                    },
                },
            });
            const createdUserAchievements = await User_Achievement.findAll({
                where: {
                    createdAt: {
                        [Sequelize.Op.gt]: lastPulledAt,
                    },
                    user_id: userId,
                },
            });

            const createdUserParks = await User_Park.findAll({
                where: {
                    createdAt: {
                        [Sequelize.Op.gt]: lastPulledAt,
                    },
                    user_id: userId,
                },
            });

            const createdUserSessions = await User_Session.findAll({
                where: {
                    createdAt: {
                        [Sequelize.Op.gt]: lastPulledAt,
                    },
                    user_id: userId,
                },
            });
            const createdUserPurchasedTrails = await User_Purchased_Trail.findAll({
                where: {
                    createdAt: {
                        [Sequelize.Op.gt]: lastPulledAt,
                    },
                    user_id: userId,
                },
            });
            const createdParkStates = await Park_State.findAll({
                where: {
                    createdAt: {
                        [Sequelize.Op.gt]: lastPulledAt,
                    },
                },
            });
            const createdSessionCategories = await Session_Category.findAll({
                where: {
                    createdAt: {
                        [Sequelize.Op.gt]: lastPulledAt,
                    },
                },
            });

            const createdUserCompletedTrails = await User_Completed_Trail.findAll({
                where: {
                    updatedAt: {
                        [Sequelize.Op.gt]: lastPulledAt,
                    },
                    user_id: userId,
                },
            })

//            const updatedSubscriptions = await Subscription.findAll({
//                where: {
//                    updatedAt: {
//                        [Sequelize.Op.gt]: lastPulledAt,
//                    },
//                    user_id: userId,
//                },
//            });

            const updatedParks = await Park.findAll({
                where: {
                    updatedAt: {
                        [Sequelize.Op.gt]: lastPulledAt,
                    },
                },
            });
            const updatedUsers = await User.findAll({
                where: {
                    updatedAt: {
                        [Sequelize.Op.gt]: lastPulledAt,
                    },
                    id:{[Sequelize.Op.eq]: userId},
                },
            });
            const updatedAddons = await Addon.findAll({
                where: {
                    updatedAt: {
                        [Sequelize.Op.gt]: lastPulledAt,
                    },
                },
            })
            const updatedUserAddons = await User_Addon.findAll({
                where: {
                    updatedAt: {
                        [Sequelize.Op.gt]: lastPulledAt,
                    },
                    user_id: userId,
                },
            })
              const updatedUserParks = await User_Park.findAll({
                where: {
                    updatedAt: {
                        [Sequelize.Op.gt]: lastPulledAt,
                    },
                    user_id: userId,
                },
            })
            const updatedUserSessions = await User_Session.findAll({
                where: {
                    updatedAt: {
                        [Sequelize.Op.gt]: lastPulledAt,
                    },
                    user_id: userId,
                },
            });

            const updatedTrails = await Trail.findAll({
                where: {
                    updatedAt: {
                        [Sequelize.Op.gt]: lastPulledAt,
                    },
                },
            });
            const updatedUserCompletedTrails = await User_Completed_Trail.findAll({
                where: {
                    updatedAt: {
                        [Sequelize.Op.gt]: lastPulledAt,
                    },
                    user_id: userId,
                },
            });
            const updatedFriends = await User_Friend.findAll({
                where: {
                    updatedAt: {
                        [Sequelize.Op.gt]: lastPulledAt,
                    },
                    user_id: userId,
                },
            })
            //!Removed createdusers, createdUsersSubscriptinos, and created UsersMiles arrays. This removed the fail to update error.
            const responseData = {
                changes: {
                    addons: {
                        created: [],
                        updated: [...updatedAddons],
                        deleted: [],
                    },
                    parks: {
                        created: [],
                        updated: createdParks,
                        deleted: [],
                    },
                    users: {
                        created: [],
                        updated: updatedUsers.length ? updatedUsers : [],
                        deleted: [],
                    },
                users_addons: {
                    created: [],
                    updated: [...updatedUserAddons],
                    deleted: [],
                },
                    users_completed_trails: {
                        created: [],
                        updated: updatedUserCompletedTrails.length ? updatedUserCompletedTrails : [],
                        deleted: [],
                    },
                    users_parks:{
                        created: [],
                        updated: createdUserParks.length ? createdUserParks : [],
                        deleted: [],
                    },
//                    users_subscriptions: {
//                        created: [],
//                        updated: updatedSubscriptions.length ? updatedSubscriptions : [],
//                        deleted: [],
//                    },
                    users_achievements: {
                        created: [],
                        updated: createdUserAchievements,
                        deleted: [],
                    },
                    users_purchased_trails: {
                        created: [],
                        updated: createdUserPurchasedTrails,
                        deleted: [],
                    },
                    users_sessions: {
                        created: [],
                        updated: updatedUserSessions,
                        deleted: [],
                    },
                    users_friends: {
                        created: [],
                        updated: updatedFriends,
                        deleted: [],
                    },
                    trails: {
                        created: [],
                        updated: updatedTrails,
                        deleted: [],
                    },
                    park_states: {
                        created: [],
                        updated: createdParkStates,
                        deleted: [],
                    },
                    achievements: {
                        created: [],
                        updated: createdAchievements,
                        deleted: [],
                    },
                    session_categories: {
                        created: [],
                        updated: createdSessionCategories,
                        deleted: [],
                    },
                },
                timestamp: Date.now(),
            };

            console.log('responseData from pull', responseData);
            return res.json(responseData);
        }
    } catch (err) {
        console.log('Error in server /pull', err);
    }
});

//pull changes from users watermelon database
app.post('/push', async (req, res) => {
    try {
        const changes = await req.body.changes;
        const lastPulledAt = req.query.last_pulled_at;
        console.log('sending changes to pg', {changes, lastPulledAt});
        if (lastPulledAt !== 'null') {
            if (changes?.users?.created[0] !== undefined) {
                const users = await User.bulkCreate(changes.users.created, {updateOnDuplicate: ['id']});
            }
            if (changes?.users_achievements?.created[0] !== undefined) {
                const users_achievements = await User_Achievement.bulkCreate(
                    changes.users_achievements.created, {updateOnDuplicate: ['id']}
                );
            }
            if (changes?.users_addons?.created[0] !== undefined) {
                const users_addons = await User_Addon.bulkCreate(
                    changes.users_addons.created, {updateOnDuplicate: ['id']}
                );
            }
            if (changes?.users_parks?.created[0] !== undefined) {
                const users_parks = await User_Park.bulkCreate(
                    changes.users_parks.created, {updateOnDuplicate: ['id']}
                );
            }
            if (changes?.users_sessions?.created[0] !== undefined) {
                const users_sessions = await User_Session.bulkCreate(
                    changes.users_sessions.created, {updateOnDuplicate: ['id']}
                );
            }
            if(changes?.sessions_addons?.created[0] !== undefined) {
                const sessions_addons = await Session_Addon.bulkCreate(
                    changes.sessions_addons.created, {updateOnDuplicate: ['id']}
                );
            }
            if (changes?.users_purchased_trails?.created[0] !== undefined) {
                const users_purchased_trails = await User_Purchased_Trail.bulkCreate(
                    changes.users_purchased_trails.created, {updateOnDuplicate: ['id']}
                );
            }
            if (changes?.users_friends?.created[0] !== undefined) {
                const users_friends = await User_Friend.bulkCreate(
                    changes.users_friends.created, {updateOnDuplicate: ['id']}
                );
            }
//            if (changes?.users_subscriptions?.created[0] !== undefined) {
//                const users_subscriptions = await Subscription.bulkCreate(
//                    changes.users_subscriptions.created, {updateOnDuplicate: ['id']}
//                );
//            }
            if (changes?.users_completed_trails?.created[0] !== undefined) {
                const users_completed_trails = await User_Completed_Trail.bulkCreate(
                    changes.users_completed_trails.created, {updateOnDuplicate: ['id']}
                );
            }
            //updates to created rows in pg database
            if (changes?.users?.updated[0] !== undefined) {
                const updateQueries = changes.users.updated.map((remoteEntry) => {
                    //console.log({remoteEntry});
                    return User.update({...remoteEntry}, {
                        where: {
                            id: remoteEntry.id,
                        },
                    });
                });
                await Promise.all(updateQueries);
            }

            if (changes?.users_addons?.updated[0] !== undefined) {
                const updateQueries = changes.users_addons.updated.map(
                    (remoteEntry) => {
                        console.log({remoteEntry});
                        return User_Addon.update(
                            {...remoteEntry},
                            {
                                where: {
                                    user_id: remoteEntry.user_id,
                                    addon_id: remoteEntry.addon_id,
                                },
                            }
                        );
                    }
                );
                await Promise.all(updateQueries);
            }
            if (changes?.users_sessions?.updated[0] !== undefined) {
                const updateQueries = changes.users_sessions.updated.map(
                    (remoteEntry) => {
                        //console.log({remoteEntry});
                        return User_Session.update(
                            {...remoteEntry},
                            {
                                where: {
                                    id: remoteEntry.id,
                                },
                            }
                        );
                    }
                );
                await Promise.all(updateQueries);
            }

            if (changes?.users_parks?.updated[0] !== undefined) {
                const updateQueries = changes.users_parks.updated.map(
                    (remoteEntry) => {
                        //console.log({remoteEntry});
                        return User_Park.update(
                            {...remoteEntry},
                            {
                                where: {
                                    id: remoteEntry.id,
                                },
                            }
                        );
                    }
                );
                await Promise.all(updateQueries);
            }

            if(changes?.sessions_addons?.updated[0] !== undefined) {
                const updateQueries = changes.sessions_addons.updated.map(
                    (remoteEntry) => {
                        console.log({remoteEntry});
                        return Session_Addon.update(
                            {...remoteEntry},
                            {
                                where: {
                                    session_id: remoteEntry.session_id,
                                    addon_id: remoteEntry.addon_id,
                                },
                            }
                        );
                    }
                );
                await Promise.all(updateQueries);
            }
            if (changes?.users_achievements?.updated[0] !== undefined) {
                const updateQueries = changes.users_achievements.updated.map(
                    (remoteEntry) => {
                        //console.log({remoteEntry});
                        return User_Achievement.update(
                            {...remoteEntry},
                            {
                                where: {
                                    id: remoteEntry.id,
                                },
                            }
                        );
                    }
                );
                await Promise.all(updateQueries);
            }
//            if (changes?.users_subscriptions?.updated[0] !== undefined) {
//                const updateQueries = changes.users_subscriptions.updated.map(
//                    (remoteEntry) => {
//                        // console.log({remoteEntry});
//                        return Subscription.update(
//                            {...remoteEntry},
//                            {
//                                where: {
//                                    id: remoteEntry.id,
//                                },
//                            }
//                        );
//                    }
//                );
//                await Promise.all(updateQueries);
//            }
            if (changes?.users_completed_trails?.updated[0] !== undefined) {
                const updateQueries = changes.users_completed_trails.updated.map(
                    (remoteEntry) => {

                        return User_Completed_Trail.update(
                            {...remoteEntry},
                            {
                                where: {
                                    user_id: remoteEntry.user_id,
                                    trail_id: remoteEntry.trail_id,
                                },
                            }
                        );
                    }
                );
                await Promise.all(updateQueries);
            }
            if (changes?.users?.deleted[0]) {
                await User.destroy({
                    where: {
                        id: changes.users.deleted,
                    },
                });
            }
            if (changes?.users_addons?.deleted[0]) {
                await User_Addon.destroy({
                    where: {
                        id: changes.users_addons.deleted,
                    },
                });
            }
        }
        res.sendStatus(200);
    } catch (err) {
        console.error('Error in server /push:', err);
        res.status(500).json({ error: 'An error occurred during the push operation.' });
    }});
async function seedDatabase(){
    try {
        // Query the database for the user
        const trails = await Trail.findAll()

        // Set userId in res.locals
//        if (trails.length > 0) {
//            console.log("initial Database  already loaded")
//            return
//        }
        console.log('seeding postgres table...');
        try {
            await Park.bulkCreate(
                InitialParks,
                {ignoreDuplicates: true}
            );
            await Park_State.bulkCreate(
                InitialParkStates,
                {ignoreDuplicates: true}
            );
            await Trail.bulkCreate(
                InitialTrails, {ignoreDuplicates: true}
            );
            await Achievement.bulkCreate(newAchievements, {
                ignoreDuplicates: true,
            });

            await Session_Category.bulkCreate(
                InitialSessionCategories,
                {ignoreDuplicates: true}
            );
            await Addon.bulkCreate(
                InitialAddons,{ignoreDuplicates: true}
            )

            console.log('Seeding Server Successful');
        } catch (err) {
            console.log('Error in server seeding pgdb', err);
        }

    } catch (error) {
        // Handle any errors that occur
        console.error('Error in seedDatabase Function severside', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
const connect = async () => {
    try {
        await SYNC({alter: true});
        await seedDatabase()
        //set random free trails
        exec(process.env.REROLL_FREE_TRAILS, (err, stdout, stderr) => {
            if (err) {
                console.error(`Error running Free Trail ReRoll Cron : ${err.message}`);
                return;
            }
            if (stderr) {
                console.error(`Stderr from Free Trail ReRoll Cron ${stderr}`);
                return;
            }
            console.log(`Output from Free Trail ReRoll Cron ${stdout}`);
        });
        //set random trail of the week
        exec(process.env.REROLL_TRAIL_OF_THE_WEEK, (err, stdout, stderr) => {
            if (err) {
                console.error(`Error running Trail Of the Week Cron : ${err.message}`);
                return;
            }
            if (stderr) {
                console.error(`Stderr from Trail Of the Week Cron ${stderr}`);
                return;
            }
            console.log(`Output from Trail Of The Week Cron ${stdout}`);
        });


        console.log(
            'SERVER - connected to Postgres database trailtasks viia Sequelize!'
        );
        const PORT = process.env.PORT || 5500;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
         
        });
    } catch (err) {
        console.log(err.message);
    }
};

connect().catch(e => {
    console.error("error in connect server", e)
});
