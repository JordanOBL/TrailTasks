import {DataTypes, Sequelize} from 'sequelize';


//const PGUSER = 'jordan';
//const PGHOST = '192.168.1.208';
//const PGHOST = 'localhost';
//const PGDBNAME = 'trailtasks';
//const PGPORT = 5433;
//const PGPASSWORD = '4046';
//railway.app pgdatabase
// const PGUSER = 'postgres';
// const PGHOST = "monorail.proxy.rlwy.net";
// const PGDBNAME = 'railway';
// const PGPORT = 47370;
// const PGPASSWORD = 'SpFDCqoKArXHeXwSrLruWVzRcZQNcuwL';
import dotenv from 'dotenv'
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : process.env.NODE_ENV === 'development' ? '.env.development' : '.env.test'
});

const sequelize = new Sequelize(process.env.PGDBNAME, process.env.PGUSER, process.env.PGPASSWORD, {
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  password: process.env.PGPASSWORD,
  dialect: 'postgres',
  // dialectOptions: {
  //   ssl: {
  //     require: true,
  //     rejectUnauthorized: false,
  //   },
  // },
});

export const Park = sequelize.define(
  'Park',
  {
    id: {type: DataTypes.STRING, allowNull: false, primaryKey: true},
    park_name: {type: DataTypes.STRING, allowNull: false},
    park_type: {type: DataTypes.STRING, allowNull: false},
    park_image_url: {type: DataTypes.STRING},
  },
  {
    tableName: 'parks',
    underscored: true,
    indexes: [
      // Create a unique index on field
      {
        unique: true,
        fields: ['park_name'],
      },
    ],
  }
);
export const Trail = sequelize.define(
  'Trail',
  {
    id: {type: DataTypes.STRING, allowNull: false, primaryKey: true},
    trail_name: {type: DataTypes.STRING, allowNull: false},
    trail_distance: {type: DataTypes.DECIMAL, allowNull: false},
    trail_lat: {type: DataTypes.DECIMAL, allowNull: true},
    trail_long: {type: DataTypes.DECIMAL, allowNull: true},
    trail_difficulty: {type: DataTypes.STRING, allowNull: false},
    park_id: {type: DataTypes.STRING, allowNull: false},
    trail_image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    all_trails_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nps_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hiking_project_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    trail_elevation: {type: DataTypes.STRING, allowNull: true},
    is_free: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
    is_subscribers_only: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    trail_of_the_week: {
      name: 'trail_of_the_week',
      type: 'boolean',
      isIndexed: true,
      defaultValue: false,
    },
  },
  {
    tableName: 'trails',
    underscored: true,
    indexes: [
      // Create a unique index on field
      {
        unique: true,
        fields: ['trail_name'],
      },
    ],
  }
);
export const User = sequelize.define(
  'User',
  {
    id: {type: DataTypes.STRING, allowNull: false, primaryKey: true},
    username: {type: DataTypes.STRING, allowNull: false, unique: true},
    email: {type: DataTypes.STRING, allowNull: false, unique: true},
    password: {type: DataTypes.STRING, allowNull: false},
    push_notifications_enabled: {type: DataTypes.BOOLEAN, defaultValue: false},
    daily_streak: {type: DataTypes.INTEGER, defaultValue: 0},
    last_daily_streak_date: {type: DataTypes.DATEONLY, defaultValue: 0},
    theme_preference: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'light',
    },
    total_miles:{type: DataTypes.STRING, defaultValue: '0.00'},
    trail_id: {type: DataTypes.STRING, allowNull: false},
    trail_progress: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '0.00',
    },
    trail_started_at: {type: DataTypes.STRING, allowNull: false},
    trail_tokens: {type: DataTypes.INTEGER, allowNull: false},
    prestige_level: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    room_id: {type: DataTypes.STRING, allowNull: true},
  },
  {
    tableName: 'users',
    underscored: true,
    indexes: [
      // Create a unique index on field
      {
        unique: true,
        fields: ['username', 'email', 'id', 'total_miles']
      },
    ],
  }
);
export const Park_State = sequelize.define(
  'Park_State',
  {
    id: {type: DataTypes.STRING, allowNull: false, primaryKey: true},
    park_id: {type: DataTypes.STRING, allowNull: false},
    state_code: {type: DataTypes.STRING, allowNull: false},
    state: {type: DataTypes.STRING, allowNull: false},
  },
  {tableName: 'park_states', underscored: true}
);
export const Achievement = sequelize.define(
  'Achievement',
  {
    id: {type: DataTypes.STRING, allowNull: false, primaryKey: true},
    achievement_name: {type: DataTypes.STRING, allowNull: false},
    achievement_description: {type: DataTypes.STRING, allowNull: false},
    achievement_image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    achievement_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    achievement_condition: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    achievement_fact: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'achievements',
    underscored: true,
    indexes: [
      // Create a unique index on field
      {
        unique: true,
        fields: ['achievement_name'],
      },
    ],
  }
);
export const User_Achievement = sequelize.define(
  'User_Achievement',
  {
    id: {type: DataTypes.STRING, allowNull: false, primaryKey: true},
    completed_at: {type: DataTypes.STRING, allowNull: false},
    user_id: {type: DataTypes.STRING, allowNull: false},
    achievement_id: {type: DataTypes.STRING, allowNull: false},
  },
  {
    tableName: 'users_achievements',
    underscored: true,
    indexes: [
      // Create a unique index on field
      {
        fields: ['user_id'],
      },
    ],
  }
);
export const User_Completed_Trail = sequelize.define(
  'User_Completed_Trail',
  {
    id: {type: DataTypes.STRING, allowNull: false, primaryKey: true},
    first_completed_at: {type: DataTypes.STRING, allowNull: false},
    last_completed_at: {type: DataTypes.STRING, allowNull: false},
    best_completed_time: {type: DataTypes.STRING, allowNull: false},
    completion_count: {type: DataTypes.INTEGER, allowNull: false},
  },
  {
    tableName: 'users_completed_trails',
    underscored: true,
    indexes: [
      // Create a unique index on field
      {
        fields: ['user_id'],
      },
    ],
  }
);
export const Users_Queued_Trail = sequelize.define(
  'Users_Queued_Trail',
  {
    id: {type: DataTypes.STRING, allowNull: false, primaryKey: true},
    user_id: {type: DataTypes.STRING, allowNull: false},
    trail_id: {type: DataTypes.STRING, allowNull: false},
  },
  {tableName: 'users_queued_trails', underscored: true}
);
export const User_Purchased_Trail = sequelize.define(
  'User_Purchased_Trail',
  {
    id: {type: DataTypes.STRING, allowNull: false, primaryKey: true},
    user_id: {type: DataTypes.STRING, allowNull: false},
    trail_id: {type: DataTypes.STRING, allowNull: false},
    purchased_at: {type: DataTypes.STRING, allowNull: true},
  },
  {
    tableName: 'users_purchased_trails',
    underscored: true,
    indexes: [
      // Create a unique index on field
      {
        fields: ['user_id'],
      },
    ],
  }
);


export const Session_Category = sequelize.define(
  'Session_Category',
  {
    id: {type: DataTypes.STRING, allowNull: false, primaryKey: true},
    session_category_name: {type: DataTypes.STRING, allowNull: false},
  },
  {tableName: 'session_categories', underscored: true}
);
export const User_Session = sequelize.define(
  'User_Session',
  {
    id: {type: DataTypes.STRING, allowNull: false, primaryKey: true},
    user_id: {type: DataTypes.STRING, allowNull: false},
    session_name: {type: DataTypes.STRING, allowNull: false},
    session_description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date_added: {type: DataTypes.STRING, allowNull: false},
    total_session_time: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    total_distance_hiked: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0.0,
    },
  },
  {
    tableName: 'users_sessions',
    underscored: true,
    indexes: [
      // Create a unique index on field
      {
        fields: ['user_id'],
      },
    ],
  }
);

export const Session_Addon = sequelize.define(
  'Session_Addon',
  {
    id: {type: DataTypes.STRING, allowNull: false, primaryKey: true},
    session_id: {type: DataTypes.STRING, allowNull: false},
    addon_id: {type: DataTypes.STRING, allowNull: false},
  },
  {tableName: 'sessions_addons', underscored: true}
)

//export const Subscription = sequelize.define(
//  'Subscription',
//  {
//    id: {type: DataTypes.STRING, allowNull: false, primaryKey: true},
//    user_id: {type: DataTypes.STRING, allowNull: false},
//    is_active: {
//      type: DataTypes.BOOLEAN,
//      allowNull: false,
//      defaultValue: false,
//    },
//    expires_at: {type: DataTypes.STRING, allowNull: true},
//  },
//  {tableName: 'users_subscriptions'}
//);

export const Addon = sequelize.define(
  'Addon',
  {
    id: {type: DataTypes.STRING, allowNull: false, primaryKey: true},
    name: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING, allowNull: false},
    level: {type: DataTypes.INTEGER, allowNull: false},
    price: {type: DataTypes.INTEGER, allowNull: false},
    image_url: {type: DataTypes.STRING, allowNull: true},
    required_total_miles: {type: DataTypes.DOUBLE, allowNull: false},
    effect_type: {type: DataTypes.STRING, allowNull: false},
    effect_value: {type: DataTypes.DOUBLE, allowNull: false},
  },
  {tableName: 'addons', indexes: [{fields: ['level', 'effect_value', 'required_total_miles']}]},
);

export const User_Addon = sequelize.define(
  'User_Addon',
  {
    id: {type: DataTypes.STRING, allowNull: false, primaryKey: true},
    user_id: {type: DataTypes.STRING, allowNull: false},
    addon_id: {type: DataTypes.STRING, allowNull: false},
    quantity: {type: DataTypes.INTEGER, allowNull: false},
  },
  {tableName: 'users_addons',
    underscored: true,
    indexes: [
      // Create a unique index on field
      {
        fields: ['user_id'],
      },
    ],
  }
);
export const User_Park = sequelize.define(
  'User_Park',
  {
    id: {type: DataTypes.STRING, allowNull: false, primaryKey: true},
    user_id: {type: DataTypes.STRING, allowNull: false},
    park_id: {type: DataTypes.STRING, allowNull: false},
    park_level: {type: DataTypes.INTEGER, allowNull: false},
    is_reward_redeemed: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true},
    last_completed: {type: DataTypes.STRING, allowNull: true},
  },
  {tableName: 'users_parks',
    underscored: true,
    indexes: [
      // Create a unique index on field
      {
        fields: ['user_id'],
      },
    ],
  }
)

export const User_Friend = sequelize.define(
  'User_Friend',
  {
    id: {type: DataTypes.STRING, allowNull: false, primaryKey: true},
    user_id: {type: DataTypes.STRING, allowNull: false},
    friend_id: {type: DataTypes.STRING, allowNull: false},
  },
  {tableName: 'users_friends',
    indexes: [
      // Create a unique index on field
      {
        fields: ['user_id', 'friend_id'],
      },
    ],
  }
)

User.belongsTo(Trail, {foreignKey: 'trail_id'});
Trail.hasMany(User, {foreignKey: 'trail_id'});

Session_Category.hasOne(User_Session, {foreignKey: 'session_category_id'});
User_Session.belongsTo(Session_Category);

Park.hasOne(Park_State, {foreignKey: 'park_id'});
Park_State.belongsTo(Park);

Park.hasMany(Trail, {foreignKey: 'park_id'});
Trail.belongsTo(Park, {foreignKey: 'park_id'});

User.hasMany(User_Achievement, {foriegnKey: 'user_id'});
User_Achievement.belongsTo(User);

Achievement.hasMany(User_Achievement, {foriegnKey: 'achievement_id'});
User_Achievement.belongsTo(Achievement);

// Achievement.belongsToMany(User, {through: 'users_achievements'});
// User.belongsToMany(Achievement, {through: 'users_achievements'});


// User.belongsToMany(Trail, {through: 'completed_hikes'});
// Trail.belongsToMany(User, {through: 'completed_hikes'});
User_Completed_Trail.belongsTo(User, {foreignKey: 'user_id'});
User.hasMany(User_Completed_Trail, {foreignKey: 'user_id'});

User_Completed_Trail.belongsTo(Trail, {foreignKey: 'trail_id'});

User.belongsToMany(Trail, {through: 'queued_trails'});
Trail.belongsToMany(User, {through: 'queued_trails'});

User_Purchased_Trail.belongsTo(User, {foreignKey: 'user_id'});
User.hasMany(User_Purchased_Trail, {foreignKey: 'user_id'});

User_Purchased_Trail.belongsTo(Trail, {foreignKey: 'trail_id'});

// User has many User_Addons
User.hasMany(User_Addon, { foreignKey: 'user_id' });
User_Addon.belongsTo(User, { foreignKey: 'user_id' });

// User_Addon belongs to an Addon
User_Addon.belongsTo(Addon, { foreignKey: 'addon_id' });
Addon.hasMany(User_Addon, { foreignKey: 'addon_id' });

// User has many User_Sessions
User.hasMany(User_Session, { foreignKey: 'user_id' });
User_Session.belongsTo(User, { foreignKey: 'user_id' });

// User_Session has many Session_Addons
User_Session.hasMany(Session_Addon, { foreignKey: 'session_id' });
Session_Addon.belongsTo(User_Session, { foreignKey: 'session_id' });


User.hasMany(User_Park, { foreignKey: 'user_id' });
User_Park.belongsTo(User, { foreignKey: 'user_id' });

Park.hasMany(User_Park, { foreignKey: 'park_id' });
User_Park.belongsTo(Park, { foreignKey: 'park_id' });

// Session_Addon belongs to an Addon
Session_Addon.belongsTo(Addon, { foreignKey: 'addon_id' });
Addon.hasMany(Session_Addon, { foreignKey: 'addon_id' });

User_Friend.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(User_Friend, { foreignKey: 'user_id' });

User_Friend.belongsTo(User, { foreignKey: 'friend_id' });
User.hasMany(User_Friend, { foreignKey: 'friend_id' });


//Subscription.hasOne(User, {foreignKey: 'user_id'});
//User.belongsTo(Subscription, {key: 'id'});

export const SYNC = async (cb) => {
  await sequelize.sync({...cb});
  console.log('All models were synchronized successfully.');
};
