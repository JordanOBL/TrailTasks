import { Sequelize, DataTypes, Model } from 'sequelize'
const PGUSER = 'jordan';
//const PGHOST = '192.168.76.16';
const PGHOST = 'localhost';
const PGDBNAME = 'trailtasks';
const PGPORT = 5433;
const PGPASSWORD = '4046';

const sequelize = new Sequelize(PGDBNAME, PGUSER, PGPASSWORD, {
  host: PGHOST,
  port: PGPORT,
  dialect: 'postgres',
});

const Park = sequelize.define('Park', {

        id :{ type: DataTypes.STRING, allowNull: false, primaryKey: true },
        park_name :{ type: DataTypes.STRING, allowNull: false },
        park_type :{ type: DataTypes.STRING, allowNull: false},
       park_image_url :{ type: DataTypes.STRING },
    
    }, {tableName: 'parks'}),
   const Trail =  sequelize.define('Trail',{
       
      id :{ type: DataTypes.STRING, allowNull: false, primaryKey: true },
       trail_name : { type: DataTypes.STRING, allowNull: false},
        trail_distance: { type: DataTypes.DECIMAL, allowNull: false},
       trail_lat : { type: DataTypes.DECIMAL, allowNull: false},
       trail_long : { type: DataTypes.DECIMAL, allowNull: false},
        trail_difficulty: { type: DataTypes.STRING, allowNull: false},
        park_id: { type: DataTypes.STRING, allowNull: false}, //ref
       trail_image_url : { type: DataTypes.STRING, allowNull: false, allowNull: true},
        trail_elevation: { type: 'number', allowNull: true},
    
    }, {tableName: 'trails'}),
    const User = sequelize.define( 'User', {

      id :{ type: DataTypes.STRING, allowNull: false, primaryKey: true },
        username: { type: DataTypes.STRING, allowNull: false},
       first_name : { type: DataTypes.STRING, allowNull: false},
       last_name : { type: DataTypes.STRING, allowNull: false},
        email: { type: DataTypes.STRING, allowNull: false},
       password : { type: DataTypes.STRING, allowNull: false},
        push_notifications_enabled: { type: DataTypes.BOOLEAN, defaultValue: false},
       theme_preference : { type: DataTypes.STRING, allowNull: false, defaultValue: 'light'},
        trail_id: { type: DataTypes.STRING, allowNull: false, defaultValue: "1"},
       trail_progress : { type: DataTypes.DECIMAL, allowNull: false, defaultValue: 0.00},
       trail_started_at : { type: DataTypes.STRING, allowNull: false},
    
    }, {tableName: 'users'}),
    const Park_State = sequelize.define('Park_State', {
id :{ type: DataTypes.STRING, allowNull: false, primaryKey: true },
       park_id :{  type: DataTypes.STRING, allowNull: false}, //ref
       state_code :{  type: DataTypes.STRING, allowNull: false},
       state :{  type: DataTypes.STRING, allowNull: false},
    
    }, {tableName: 'park_states'}),
    const Badge = sequelize.define('Badge', {
      
      id :{ type: DataTypes.STRING, allowNull: false, primaryKey: true },
       badge_name :{ type: DataTypes.STRING, allowNull: false, },
       badge_description :{ type: DataTypes.STRING, allowNull: false},
       badge_image_url :{ type: DataTypes.STRING, allowNull: false, allowNull: true},
    
    }, {tableName: 'badges'}),
    const Achievement = sequelize.define('Achievement',{
id :{ type: DataTypes.STRING, allowNull: false, primaryKey: true },
      achievement_name  :{ type: DataTypes.STRING, allowNull: false},
       achievement_description :{ type: DataTypes.STRING, allowNull: false},
       achievement_image_url :{ type: DataTypes.STRING, allowNull: false, allowNull: true},
    
    }),
    const User_Achievement = sequelize.define( 'User_Achievement',{
       'user_achievements',
      id :{ type: DataTypes.STRING, allowNull: false, primaryKey: true },
       user_id :{ type: DataTypes.STRING, allowNull: false}, //ref
      achievement_id  :{ type: DataTypes.STRING, allowNull: false}, //ref
       completed_at :{ type: DataTypes.DATE, allowNull: false},
    
    }, {tableName: 'user_achievements'}),
    const Completed_Hike = sequelize.define('Completed_Hike', {
 
      id :{ type: DataTypes.STRING, allowNull: false, primaryKey: true },
       user_id :{ type: DataTypes.STRING, allowNull: false}, //ref
       trail_id :{ type: DataTypes.STRING, allowNull: false}, //ref
        first_completed_at:{ type: DataTypes.STRING, allowNull: false},
       last_completed_at :{ type: DataTypes.STRING, allowNull: false},
       best_completed_time :{ type: DataTypes.STRING, allowNull: false},
    
    }, {tableName: 'completed_hikes'}),
    const Hiking_Queue = sequelize.define('Hiking_Queue', {
     
      id :{ type: DataTypes.STRING, allowNull: false, primaryKey: true },
       user_id :{ type: DataTypes.STRING, allowNull: false}, //ref
       trail_id :{ type: DataTypes.STRING, allowNull: false}, //ref
       created_at :{ type: DataTypes.DATE},
    
    }, {freezeTableName: true}),
    const User_Miles = sequelize.define( 'User_Miles', {

      id :{ type: DataTypes.STRING, allowNull: false, primaryKey: true },
       user_id :{ type: DataTypes.STRING, allowNull: false}, //reference user,
       total_miles :{ type: DataTypes.DECIMAL, allowNull: false},
    
    }, {tableName: 'users_miles'}),
    const User_Badge = sequelize.define( 'User_Badge',{
      
      id :{ type: DataTypes.STRING, allowNull: false, primaryKey: true },
       user_id :{  type: DataTypes.STRING, allowNull: false}, //reference user,
       badge_id :{  type: DataTypes.STRING, allowNull: false}, //ref
    
    }, {tableName: 'users_badges'}),
    const Session_Category = sequelize.define('Session_Category', {
      
      id :{ type: DataTypes.STRING, allowNull: false, primaryKey: true },
      session_category_name :{  type: DataTypes.STRING, allowNull: false},
    }, {tableName: 'session_categories'}),
    const User_Session = sequelize.define( 'User_Session', {
      
      id :{ type: DataTypes.STRING, allowNull: false, primaryKey: true },
       user_id :{  type: DataTypes.STRING, allowNull: false}, 
       session_name :{  type: DataTypes.STRING, allowNull: false},
      session_description  :{ 
          type: DataTypes.STRING,
          allowNull: true,
        },
       session_category_id :{  type: DataTypes.STRING, allowNull: false},
       date_added :{  type: DataTypes.STRING, allowNull: false},
       total_session_time :{  type: DataTypes.INTEGER, defaultValue: 0, allowNull: false},
       total_distance_hiked :{  type: DataTypes.DECIMAL, allowNull: false, defaultValue: 0.00}
    
    }, {tableName : 'user_sessions'}),