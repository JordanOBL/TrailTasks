// app/model/migrations.js
//
// WatermelonDB migrations protect local device data when schema.js changes.
// When changing schema.js, increment its version by one and add a matching
// migration here. WatermelonDB supports createTable(...) and addColumns(...)
// for schema migrations; destructive cleanup needs a separate, explicit plan.

import { addColumns, createTable, schemaMigrations } from "@nozbe/watermelondb/Schema/migrations";

export default schemaMigrations({
  migrations: [],
  //   {
  //     toVersion: 2,
  //     steps: [
  //       addColumns({
  //         table: "trails",
  //         columns: [{ name: "is_pro_only", type: "boolean", isIndexed: true }],
  //       }),
  //     ],
  //   },
});
