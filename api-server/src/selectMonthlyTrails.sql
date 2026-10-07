-- Monthly bonus access reroll.
-- Keeps Congaree/Scout starter trails free, clears the previous monthly bonus
-- trails, picks five random Pro-only trails from five different parks, and marks
-- the longest of those five as the featured trail.

WITH scout_park AS (
  SELECT park_id
  FROM wilds
  WHERE id = 'scout'
),
cleared_monthly_free AS (
  UPDATE trails
  SET is_free = false, updated_at = CURRENT_TIMESTAMP
  WHERE is_free = true
    AND park_id NOT IN (SELECT park_id FROM scout_park)
  RETURNING id
),
cleared_featured AS (
  UPDATE trails
  SET trail_of_the_week = false, updated_at = CURRENT_TIMESTAMP
  WHERE trail_of_the_week = true
  RETURNING id
),
monthly_candidates AS (
  SELECT
    id,
    park_id,
    ROW_NUMBER() OVER (PARTITION BY park_id ORDER BY RANDOM()) AS park_random_rank
  FROM trails
  WHERE is_pro_only = true
),
one_candidate_per_park AS (
  SELECT id
  FROM monthly_candidates
  WHERE park_random_rank = 1
  ORDER BY RANDOM()
  LIMIT 5
),
updated_monthly_free AS (
  UPDATE trails
  SET is_free = true, updated_at = CURRENT_TIMESTAMP
  WHERE id IN (SELECT id FROM one_candidate_per_park)
  RETURNING id, trail_distance
),
featured_trail AS (
  SELECT id
  FROM updated_monthly_free
  ORDER BY CAST(trail_distance AS REAL) DESC, RANDOM()
  LIMIT 1
)
UPDATE trails
SET trail_of_the_week = true, updated_at = CURRENT_TIMESTAMP
WHERE id IN (SELECT id FROM featured_trail);

-- Verification: after the permanent policy runs, expected free_trails is 8
-- because it includes 3 permanent Congaree trails plus 5 monthly bonus trails.
SELECT
  COUNT(*) FILTER (WHERE is_free = true) AS free_trails,
  COUNT(*) FILTER (WHERE is_free = true AND is_pro_only = true) AS monthly_bonus_trails,
  COUNT(*) FILTER (WHERE trail_of_the_week = true) AS featured_trails
FROM trails;
