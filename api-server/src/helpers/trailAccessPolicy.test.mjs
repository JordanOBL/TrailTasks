import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  SAMPLER_PARK_NAMES,
  monthlyTrailAccessRerollSql,
  permanentTrailAccessPolicySql,
  rerollMonthlyTrailAccess,
  trailAccessSummarySql,
} from './trailAccessPolicy.mjs';

describe('trail access policy SQL', () => {
  it('keeps the Scout park free and uses exactly four sampler parks', () => {
    assert.equal(SAMPLER_PARK_NAMES.length, 4);
    assert.match(permanentTrailAccessPolicySql, /WHERE id = 'scout'/);
    assert.match(permanentTrailAccessPolicySql, /is_free = park_id IN/);
  });

  it('monthly reroll applies the permanent Pro policy before choosing bonus trails', async () => {
    const queries = [];
    const sequelize = {
      query: async (sql) => {
        queries.push(sql);
        return sql === trailAccessSummarySql ? [[{ total_trails: 189 }]] : [];
      },
    };

    await rerollMonthlyTrailAccess(sequelize);

    assert.equal(queries[0], permanentTrailAccessPolicySql);
    assert.equal(queries[1], monthlyTrailAccessRerollSql);
    assert.equal(queries[2], trailAccessSummarySql);
  });
});
