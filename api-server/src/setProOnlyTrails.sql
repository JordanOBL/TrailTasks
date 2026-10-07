-- Permanent Pro policy for Trail Tasks MVP:
-- - Congaree (Scout's park) is the full starter park and stays non-Pro/free.
-- - Four sampler parks expose only their shortest/short trail as non-Pro.
-- - Every other trail is Pro-only by default.

WITH scout_park AS (
  SELECT park_id
  FROM wilds
  WHERE id = 'scout'
),
sampler_parks AS (
  SELECT id
  FROM parks
  WHERE park_name IN (
    'Cuyahoga Valley',
    'Saguaro',
    'Petrified Forest',
    'New River Gorge'
  )
),
sampler_short_trails AS (
  SELECT DISTINCT ON (park_id) id
  FROM trails
  WHERE park_id IN (SELECT id FROM sampler_parks)
  ORDER BY
    park_id,
    CASE WHEN LOWER(trail_difficulty) = 'short' THEN 0 ELSE 1 END,
    CAST(trail_distance AS REAL) ASC,
    id ASC
)
UPDATE trails
SET
  is_pro_only = NOT (
    park_id IN (SELECT park_id FROM scout_park)
    OR id IN (SELECT id FROM sampler_short_trails)
  ),
  is_free = park_id IN (SELECT park_id FROM scout_park),
  updated_at = CURRENT_TIMESTAMP;

-- Verification: expected with the 63-park/189-trail catalog is
-- non_pro_trails = 7, pro_only_trails = 182, permanent_free_trails = 3.
SELECT
  COUNT(*) AS total_trails,
  COUNT(*) FILTER (WHERE is_pro_only = false) AS non_pro_trails,
  COUNT(*) FILTER (WHERE is_pro_only = true) AS pro_only_trails,
  COUNT(*) FILTER (WHERE is_free = true) AS permanent_free_trails
FROM trails;
