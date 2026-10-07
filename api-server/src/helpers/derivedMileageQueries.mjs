const derivedMilesExpression =
  "COALESCE(SUM(CAST(COALESCE(NULLIF(CAST(users_sessions.total_distance_hiked AS TEXT), ''), '0.00') AS DOUBLE PRECISION)), 0)";

const derivedMilesJoin =
  "LEFT JOIN users_sessions ON users_sessions.user_id = users.id";

export const globalLeaderboardQuery = `
SELECT
  users.username,
  ${derivedMilesExpression} AS total_miles
FROM users
${derivedMilesJoin}
GROUP BY users.id, users.username
ORDER BY total_miles DESC
LIMIT 100;
`;

export const userRankQuery = `
WITH UserMileage AS (
  SELECT
    users.id AS user_id,
    users.username,
    ${derivedMilesExpression} AS total_miles
  FROM users
  ${derivedMilesJoin}
  GROUP BY users.id, users.username
), RankedUsers AS (
  SELECT
    user_id,
    username,
    total_miles,
    RANK() OVER (ORDER BY total_miles DESC) AS rank
  FROM UserMileage
)
SELECT *
FROM RankedUsers
WHERE user_id = $1;
`;

export const friendSearchQuery = `
SELECT
  users.id as friend_id,
  users.username,
  ${derivedMilesExpression} AS total_miles,
  trails.trail_name as current_trail,
  users.trail_progress,
  users.room_id
FROM users
JOIN trails ON trails.id = users.trail_id
${derivedMilesJoin}
WHERE users.username = $1
GROUP BY users.id, users.username, trails.trail_name, users.trail_progress, users.room_id;
`;

export const cachedFriendsQuery = `
SELECT
  users.id as friend_id,
  users.username,
  ${derivedMilesExpression} AS total_miles,
  trails.trail_name as current_trail,
  users.room_id
FROM users
JOIN trails ON trails.id = users.trail_id
${derivedMilesJoin}
WHERE users.id IN (SELECT friend_id FROM users_friends WHERE user_id = $1)
GROUP BY users.id, users.username, trails.trail_name, users.room_id;
`;
