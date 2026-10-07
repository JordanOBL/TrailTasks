import { Trail } from '../db/sequelizeModel.js';

export const SCOUT_WILD_ID = 'scout';
export const SAMPLER_PARK_NAMES = [
  'Cuyahoga Valley',
  'Saguaro',
  'Petrified Forest',
  'New River Gorge',
];

const samplerParkNamesSql = SAMPLER_PARK_NAMES.map(name => `'${name.replace(/'/g, "''")}'`).join(', ');

export const permanentTrailAccessPolicySql = `
WITH scout_park AS (
  SELECT park_id
  FROM wilds
  WHERE id = '${SCOUT_WILD_ID}'
),
sampler_parks AS (
  SELECT id
  FROM parks
  WHERE park_name IN (${samplerParkNamesSql})
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
`;

export const monthlyTrailAccessRerollSql = `
WITH scout_park AS (
  SELECT park_id
  FROM wilds
  WHERE id = '${SCOUT_WILD_ID}'
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
`;

export const trailAccessSummarySql = `
SELECT
  COUNT(*)::integer AS total_trails,
  COUNT(*) FILTER (WHERE is_pro_only = false)::integer AS non_pro_trails,
  COUNT(*) FILTER (WHERE is_pro_only = true)::integer AS pro_only_trails,
  COUNT(*) FILTER (WHERE is_free = true)::integer AS free_trails,
  COUNT(*) FILTER (WHERE trail_of_the_week = true)::integer AS featured_trails
FROM trails;
`;

export async function applyPermanentTrailAccessPolicy(sequelize = Trail.sequelize) {
  await sequelize.query(permanentTrailAccessPolicySql);
  const [rows] = await sequelize.query(trailAccessSummarySql);
  return rows[0];
}

export async function rerollMonthlyTrailAccess(sequelize = Trail.sequelize) {
  // The monthly pool depends on the permanent policy first marking most trails
  // as Pro-only. This keeps a fresh/default database from rerolling against an
  // all-non-Pro catalog and selecting zero monthly bonus trails.
  await sequelize.query(permanentTrailAccessPolicySql);
  await sequelize.query(monthlyTrailAccessRerollSql);
  const [rows] = await sequelize.query(trailAccessSummarySql);
  return rows[0];
}
