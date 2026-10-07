import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  SAMPLER_PARK_NAMES,
  monthlyTrailAccessRerollSql,
  permanentTrailAccessPolicySql,
} from './trailAccessPolicy.mjs';

describe('trail access policy SQL', () => {
  it('keeps the Scout park free and uses exactly four sampler parks', () => {
    assert.equal(SAMPLER_PARK_NAMES.length, 4);
    assert.match(permanentTrailAccessPolicySql, /WHERE id = 'scout'/);
    assert.match(permanentTrailAccessPolicySql, /is_free = park_id IN/);
  });

  it('monthly reroll preserves Scout free trails and chooses five bonus trails', () => {
    assert.match(monthlyTrailAccessRerollSql, /park_id NOT IN \(SELECT park_id FROM scout_park\)/);
    assert.match(monthlyTrailAccessRerollSql, /WHERE is_pro_only = true/);
    assert.match(monthlyTrailAccessRerollSql, /LIMIT 5/);
  });
});
