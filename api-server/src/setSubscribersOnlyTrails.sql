-- Step 1: Set all trails to subscribers_only = true
UPDATE trails
SET is_subscribers_only = true, updated_at = CURRENT_TIMESTAMP;

-- Step 2: Select 3 random trails under 5 miles and set subscribers_only = false
WITH random_under_5_miles AS (
    SELECT id
    FROM trails
    WHERE CAST(trail_distance AS REAL) < 5
      AND CAST(id AS INTEGER) BETWEEN 1 AND 93
    ORDER BY RANDOM()
    LIMIT 3
    )
UPDATE trails
SET is_subscribers_only = false, updated_at = CURRENT_TIMESTAMP
WHERE id IN (SELECT id FROM random_under_5_miles);

-- Step 3: Select 3 random trails between 5 and 10 miles and set subscribers_only = false
WITH random_5_to_10_miles AS (
    SELECT id
    FROM trails
    WHERE CAST(trail_distance AS REAL) >= 5 AND CAST(trail_distance AS REAL) < 10
      AND CAST(id AS INTEGER) BETWEEN 1 AND 93
    ORDER BY RANDOM()
    LIMIT 3
    )
UPDATE trails
SET is_subscribers_only = false, updated_at = CURRENT_TIMESTAMP
WHERE id IN (SELECT id FROM random_5_to_10_miles);

-- Step 4: Select 2 random trails over 10 miles and set subscribers_only = false
WITH random_over_10_miles AS (
    SELECT id
    FROM trails
    WHERE CAST(trail_distance AS REAL) >= 10
      AND CAST(id AS INTEGER) BETWEEN 1 AND 93
    ORDER BY RANDOM()
    LIMIT 2
    )
UPDATE trails
SET is_subscribers_only = false, updated_at = CURRENT_TIMESTAMP
WHERE id IN (SELECT id FROM random_over_10_miles);