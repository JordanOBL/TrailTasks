import {appSchema, tableSchema} from '@nozbe/watermelondb';

const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'parks',
      columns: [
        {name: 'park_name', type: 'string', isIndexed: true},
        {name: 'park_type', type: 'string'},
        {name: 'park_image_url', type: 'string', isOptional: true},
      ],
    }),
    tableSchema({
      name: 'trails',
      columns: [
        {name: 'trail_name', type: 'string', isIndexed: true},
        {name: 'trail_distance', type: 'number'},
        {name: 'trail_lat', type: 'number'},
        {name: 'trail_long', type: 'number'},
        {name: 'trail_difficulty', type: 'string', isIndexed: true},
        {name: 'park_id', type: 'string'}, //ref
        {name: 'trail_image_url', type: 'string', isOptional: true},
        {name: 'trail_elevation', type: 'number', isOptional: true},
      ],
    }),
    tableSchema({
      name: 'users',
      columns: [
        {name: 'username', type: 'string'},
        {name: 'first_name', type: 'string'},
        {name: 'last_name', type: 'string'},
        {name: 'email', type: 'string'},
        {name: 'password', type: 'string'},
        {name: 'push_notifications_enabled', type: 'boolean'},
        {name: 'theme_preference', type: 'string'},
        {name: 'trail_id', type: 'string'}, //reference
        {name: 'trail_progress', type: 'string'},
        {name: 'trail_started_at', type: 'string'},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),
    tableSchema({
      name: 'park_states',
      columns: [
        {name: 'park_id', type: 'string'}, //ref
        {name: 'state_code', type: 'string'},
        {name: 'state', type: 'string', isIndexed: true},
      ],
    }),
    tableSchema({
      name: 'badges',
      columns: [
        {name: 'badge_name', type: 'string', is_Indexed: true},
        {name: 'badge_description', type: 'string'},
        {name: 'badge_image_url', type: 'string', isOptional: true},
      ],
    }),
    tableSchema({
      name: 'achievements',
      columns: [
        {name: 'achievement_name', type: 'string', isIndexed: true},
        {name: 'achievement_description', type: 'string'},
        {name: 'achievement_image_url', type: 'string'},
      ],
    }),
    tableSchema({
      name: 'users_achievements',
      columns: [
        {name: 'user_id', type: 'string'}, //ref
        {name: 'achievement_id', type: 'string'}, //ref
        {name: 'completed_at', type: 'string'},
      ],
    }),
    tableSchema({
      name: 'completed_hikes',
      columns: [
        {name: 'user_id', type: 'string'}, //ref
        {name: 'trail_id', type: 'string'}, //ref
        {name: 'first_completed_at', type: 'string'},
        {name: 'last_completed_at', type: 'string'},
        {name: 'best_completed_time', type: 'string'},
      ],
    }),
    tableSchema({
      name: 'hiking_queue',
      columns: [
        {name: 'user_id', type: 'string'}, //ref
        {name: 'trail_id', type: 'string'}, //ref
        {name: 'created_at', type: 'number'},
      ],
    }),
    tableSchema({
      name: 'users_miles',
      columns: [
        {name: 'user_id', type: 'string'}, //reference user,
        {name: 'total_miles', type: 'string'},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),
    tableSchema({
      name: 'users_badges',
      columns: [
        {name: 'user_id', type: 'string'}, //reference user,
        {name: 'badge_id', type: 'string'}, //ref
      ],
    }),
    tableSchema({
      name: 'session_categories',
      columns: [{name: 'session_category_name', type: 'string'}],
    }),
    tableSchema({
      name: 'users_sessions',
      columns: [
        {name: 'user_id', type: 'string'}, //ref
        {name: 'session_name', type: 'string'},
        {
          name: 'session_description',
          type: 'string',
          isOptional: true,
        },
        {name: 'session_category_id', type: 'string'}, //ref
        {name: 'date_added', type: 'string', isIndexed: true},
        {name: 'total_session_time', type: 'number'},
        {name: 'total_distance_hiked', type: 'number'},
      ],
    }),
  ],
});

export default schema;
