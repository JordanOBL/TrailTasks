import assert from 'node:assert/strict';
import test from 'node:test';

import {
  cachedFriendsQuery,
  friendSearchQuery,
  globalLeaderboardQuery,
  userRankQuery,
} from './derivedMileageQueries.js';

const queries = [
  ['global leaderboard', globalLeaderboardQuery],
  ['user rank', userRankQuery],
  ['friend search', friendSearchQuery],
  ['cached friends', cachedFriendsQuery],
];

test('leaderboard and friend mileage queries derive miles from users_sessions', () => {
  for (const [name, query] of queries) {
    assert.match(query, /users_sessions/i, `${name} should read session facts`);
    assert.match(query, /total_distance_hiked/i, `${name} should sum completed session distance`);
    assert.match(query, /COALESCE\(SUM/i, `${name} should default missing session totals to zero`);
    assert.doesNotMatch(query, /users\.total_miles/i, `${name} must not use cached users.total_miles`);
  }
});
