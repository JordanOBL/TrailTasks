// app/model/migrations.js

import { schemaMigrations, createTable, addColumns } from '@nozbe/watermelondb/Schema/migrations'

export default schemaMigrations({
  migrations: [
    {
      // ⚠️ Set this to a number one larger than the current schema version
      toVersion: 2,
      steps: [
        createTable({
          name: 'users_friends',
          columns: [
            { name: 'user_id', type: 'string', isIndexed: true },
            { name: 'friend_id', type: 'string', isIndexed: true },
            { name: 'created_at', type: 'number' },
            { name: 'updated_at', type: 'number' },
          ],
        }), 
        createTable({
          name: 'cached_friends',
          columns: [
            { name: 'user_id', type: 'string', isIndexed: true },
            { name: 'friend_id', type: 'string', isIndexed: true },
            { name: 'total_miles', type: 'string', isOptional: false },
            { name: 'current_trail', type: 'string', isOptional: false }, // Friend status
            {name: 'username', type: 'string', isOptional: false},
            {name: 'room_id', type: 'string', isOptional: true},
            { name: 'created_at', type: 'number' },
            { name: 'updated_at', type: 'number' },
          ],
        }), 
        addColumns({
          table: 'users',
          columns: [
            {name: 'room_id', type: 'string', isOptional: true},
          ]
        })
      ],
    },
    {
      // ⚠️ Set this to a number one larger than the current schema version
      toVersion: 3,
      steps: [
        addColumns({
          table: 'cached_friends',
          columns: [
            { name: 'trail_progress', type: 'string', isOptional: false },
          ]
        })      
      ],
    }
  ],

});
