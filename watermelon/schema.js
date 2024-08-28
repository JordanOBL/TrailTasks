import {appSchema, tableSchema} from '@nozbe/watermelondb';

const schema = appSchema({
  version: 3,
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
        {name: 'trail_distance', type: 'string'},
        {name: 'trail_lat', type: 'string'},
        {name: 'trail_long', type: 'string'},
        {name: 'trail_difficulty', type: 'string', isIndexed: true},
        {name: 'park_id', type: 'string'}, //ref
        {name: 'trail_image_url', type: 'string', isOptional: true},
        {name: 'all_trails_url', type: 'string', isOptional: true},
        {name: 'nps_url', type: 'string', isOptional: true},
        {name: 'hiking_project_url', type: 'string', isOptional: true},
        {name: 'trail_elevation', type: 'string', isOptional: true},
        {
          name: 'is_free',
          type: 'boolean',
          isIndexed: true,
          defaultValue: false,
        },
        {
          name: 'is_subscribers_only',
          type: 'boolean',
          isIndexed: true,
          defaultValue: false,
        },
        {
          name: 'trail_of_the_week',
          type: 'boolean',
          isIndexed: true,
          defaultValue: false,
        },
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
        {name: 'daily_streak', type: 'number', isOptional: true},
        {name: 'last_daily_streak_date', type: 'number', isOptional: true},
        {name: 'push_notifications_enabled', type: 'boolean'},
        {name: 'theme_preference', type: 'string'},
        {name: 'trail_id', type: 'string'}, //reference
        {name: 'trail_progress', type: 'string'},
        {name: 'trail_started_at', type: 'string'},
        {name: 'trail_tokens', type: 'number'},
        {name: 'total_miles', type: 'string'},
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
        {name: 'achievement_type', type: 'string', isIndexed: true}, // e.g., "Total Miles", "Trail Completion"
        {name: 'achievement_condition', type: 'string'}, // Conditions associated with the achievement
        {name: 'achievement_fact', type: 'string', isOptional: true}, // Conditions associated with the achievement
      ],
    }),
    tableSchema({
      name: 'users_achievements',
      columns: [
        {name: 'user_id', type: 'string'}, //ref
        {name: 'achievement_id', type: 'string'}, //ref
        {name: 'completed_at', type: 'string'},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
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
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),
    tableSchema({
      name: 'queued_trails',
      columns: [
        {name: 'user_id', type: 'string'}, //ref
        {name: 'trail_id', type: 'string'}, //ref
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),
    tableSchema({
      name: 'users_purchased_trails',
      columns: [
        {name: 'user_id', type: 'string'}, //reference user,
        {name: 'trail_id', type: 'string'},
        {name: 'purchased_at', type: 'string'},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),
    tableSchema({
      name: 'users_badges',
      columns: [
        {name: 'user_id', type: 'string'}, //reference user,
        {name: 'badge_id', type: 'string'},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
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
        {name: 'total_session_time', type: 'number', isIndexed: true},
        {name: 'total_distance_hiked', type: 'string'},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),
    tableSchema({
      name: 'users_subscriptions',
      columns: [
        {name: 'user_id', type: 'string'}, //ref
        {name: 'is_active', type: 'boolean'}, //ref
        {name: 'expires_at', type: 'string', isOptional: true}, //ref
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),
  ],
});

export default schema;
