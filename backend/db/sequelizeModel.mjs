import {Sequelize, DataTypes} from 'sequelize';
//const {Sequelize, DataTypes} = require('sequelize');

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
    trail_image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    trail_elevation: {type: DataTypes.INTEGER, allowNull: true},
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
    username: {type: DataTypes.STRING, allowNull: false},
    first_name: {type: DataTypes.STRING, allowNull: false},
    last_name: {type: DataTypes.STRING, allowNull: false},
    email: {type: DataTypes.STRING, allowNull: false},
    password: {type: DataTypes.STRING, allowNull: false},
    push_notifications_enabled: {type: DataTypes.BOOLEAN, defaultValue: false},
    theme_preference: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'light',
    },
    trail_id: {type: DataTypes.STRING, allowNull: false, defaultValue: '1'},
    trail_progress: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0.0,
    },
    trail_started_at: {type: DataTypes.STRING, allowNull: false},
  },
  {
    tableName: 'users',
    underscored: true,
    indexes: [
      // Create a unique index on field
      {
        unique: true,
        fields: ['username', 'email'],
      },
    ],
  }
);
export const Park_State = sequelize.define(
  'Park_State',
  {
    id: {type: DataTypes.STRING, allowNull: false, primaryKey: true},
    state_code: {type: DataTypes.STRING, allowNull: false},
    state: {type: DataTypes.STRING, allowNull: false},
  },
  {tableName: 'park_states', underscored: true}
);
export const Badge = sequelize.define(
  'Badge',
  {
    id: {type: DataTypes.STRING, allowNull: false, primaryKey: true},
    badge_name: {type: DataTypes.STRING, allowNull: false},
    badge_description: {type: DataTypes.STRING, allowNull: false},
    badge_image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'badges',
    underscored: true,
    indexes: [
      // Create a unique index on field
      {
        unique: true,
        fields: ['badge_name'],
      },
    ],
  }
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
    completed_at: {type: DataTypes.DATE, allowNull: false},
  },
  {tableName: 'users_achievements', underscored: true}
);
export const Completed_Hike = sequelize.define(
  'Completed_Hike',
  {
    id: {type: DataTypes.STRING, allowNull: false, primaryKey: true},
    first_completed_at: {type: DataTypes.STRING, allowNull: false},
    last_completed_at: {type: DataTypes.STRING, allowNull: false},
    best_completed_time: {type: DataTypes.STRING, allowNull: false},
  },
  {tableName: 'completed_hikes', underscored: true}
);
export const Hiking_Queue = sequelize.define(
  'Hiking_Queue',
  {
    id: {type: DataTypes.STRING, allowNull: false, primaryKey: true},
  },
  {tableName: 'hiking_queue', underscored: true}
);
export const User_Miles = sequelize.define(
  'User_Miles',
  {
    id: {type: DataTypes.STRING, allowNull: false, primaryKey: true},

    total_miles: {type: DataTypes.DECIMAL, allowNull: false},
  },
  {
    tableName: 'users_miles',
    underscored: true,
    indexes: [
      // Create a unique index on field
      {
        unique: true,
        fields: ['user_id'],
      },
    ],
  }
);
export const User_Badge = sequelize.define(
  'User_Badge',
  {
    id: {type: DataTypes.STRING, allowNull: false, primaryKey: true},
  },
  {tableName: 'users_badges', underscored: true}
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
  {tableName: 'users_sessions', underscored: true}
);

User.belongsTo(Trail, {foreignKey: 'trail_id'});
Trail.hasMany(User, {foreignKey: 'trail_id'});

Session_Category.hasOne(User_Session, {foreignKey: 'session_category_id'});
User_Session.belongsTo(Session_Category);

User.hasOne(User_Miles, {foreignKey: 'user_id'});
User_Miles.belongsTo(User, {foreignKey: 'user_id'});

Park.hasOne(Park_State, {foreignKey: 'park_id'});
Park_State.belongsTo(Park);

Park.hasMany(Trail, {foreignKey: 'park_id'});
Trail.belongsTo(Park, {foreignKey: 'park_id'});

Achievement.belongsToMany(User, {through: 'users_achievements'});
User.belongsToMany(Achievement, {through: 'users_achievements'});

Badge.belongsToMany(User, {through: 'users_badges'});
User.belongsToMany(Badge, {through: 'users_badges'});

User.belongsToMany(Trail, {through: 'completed_hikes'});
Trail.belongsToMany(User, {through: 'completed_hikes'});

User.belongsToMany(Trail, {through: 'hiking_queue'});
Trail.belongsToMany(User, {through: 'hiking_queue'});

User.hasMany(User_Session, {foriegnKey: 'id'});
User_Session.belongsTo(User);

export const SYNC = async () => {
  await sequelize.sync();
  console.log('All models were synchronized successfully.');
};
