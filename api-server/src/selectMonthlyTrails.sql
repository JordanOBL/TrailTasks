-- Monthly bonus access reroll.
-- Keeps Congaree/Scout starter trails free, picks five random Pro-only trails
-- from five different parks, and marks the longest of those five as featured.
-- This uses one UPDATE so PostgreSQL does not try to update the same trail row
-- twice in one statement.

WITH scout_park AS (
  SELECT park_id
  FROM wilds
  WHERE id = 'scout'
),
monthly_candidates AS (
  SELECT
    id,
    park_id,
    trail_distance,
    ROW_NUMBER() OVER (PARTITION BY park_id ORDER BY RANDOM()) AS park_random_rank
  FROM trails
  WHERE is_pro_only = true
),
one_candidate_per_park AS (
  SELECT id, trail_distance
  FROM monthly_candidates
  WHERE park_random_rank = 1
  ORDER BY RANDOM()
  LIMIT 5
),
featured_trail AS (
  SELECT id
  FROM one_candidate_per_park
  ORDER BY CAST(trail_distance AS REAL) DESC, RANDOM()
  LIMIT 1
)
UPDATE trails
SET
  is_free = (
    park_id IN (SELECT park_id FROM scout_park)
    OR id IN (SELECT id FROM one_candidate_per_park)
  ),
  trail_of_the_week = id IN (SELECT id FROM featured_trail),
  updated_at = CURRENT_TIMESTAMP;

-- Verification: after the permanent policy runs, expected free_trails is 8
-- because it includes 3 permanent Congaree trails plus 5 monthly bonus trails.
SELECT
  COUNT(*) FILTER (WHERE is_free = true) AS free_trails,
  COUNT(*) FILTER (WHERE is_free = true AND is_pro_only = true) AS monthly_bonus_trails,
  COUNT(*) FILTER (WHERE trail_of_the_week = true) AS featured_trails
FROM trails;
