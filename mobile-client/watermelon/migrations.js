// app/model/migrations.js
//
// WatermelonDB migrations protect local device data when schema.js changes.
// When changing schema.js, increment its version by one and add a matching
// migration here. WatermelonDB supports createTable(...) and addColumns(...)
// for schema migrations; destructive cleanup needs a separate, explicit plan.

import { addColumns, createTable, schemaMigrations } from "@nozbe/watermelondb/Schema/migrations";

export default schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        addColumns({
          table: "trails",
          columns: [{ name: "is_pro_only", type: "boolean", isIndexed: true }],
        }),
      ],
    },
    {
      toVersion: 3,
      steps: [
        createTable({
          name: "token_transactions",
          columns: [
            { name: "user_id", type: "string", isIndexed: true },
            { name: "amount", type: "number" },
            { name: "type", type: "string", isIndexed: true },
            { name: "source_type", type: "string", isOptional: true },
            { name: "source_id", type: "string", isOptional: true },
            { name: "idempotency_key", type: "string", isIndexed: true },
            { name: "balance_after", type: "number", isOptional: true },
            { name: "rule_version", type: "string", isOptional: true },
            { name: "metadata", type: "string", isOptional: true },
            { name: "created_at", type: "number" },
            { name: "updated_at", type: "number" },
          ],
        }),
      ],
    },
  ],
});
