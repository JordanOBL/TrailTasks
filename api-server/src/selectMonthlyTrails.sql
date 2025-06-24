-- Update all trails where is_free is true to set is_free to false and update the updated_at timestamp
UPDATE trails
SET is_free = false, updated_at = CURRENT_TIMESTAMP
WHERE is_free = true;

-- Update the current trail of the week to set trail_of_the_week to false and update the updated_at timestamp
UPDATE trails
SET trail_of_the_week = false, updated_at = CURRENT_TIMESTAMP
WHERE trail_of_the_week = true;

-- Select 5 random trails with IDs between 1 and 93 and set is_free to true and update the updated_at timestamp
WITH random_trails AS (
    SELECT id
    FROM trails
    WHERE id::integer BETWEEN 1 AND 93  -- Cast the id to integer
ORDER BY RANDOM()
    LIMIT 5
    )
UPDATE trails
SET is_free = true, updated_at = CURRENT_TIMESTAMP
WHERE id IN (SELECT id FROM random_trails);

-- Select 1 random trail where distance is > 10 miles and ID is between 1 and 93, then set trail_of_the_week to true and update the updated_at timestamp
WITH random_long_trail AS (
    SELECT id
    FROM trails
    WHERE trail_distance::real > 10  -- Cast the trail_distance to REAL (floating point number)
    AND id::integer BETWEEN 1 AND 93  -- Cast the id to integer
ORDER BY RANDOM()
    LIMIT 1
    )
UPDATE trails
SET trail_of_the_week = true, updated_at = CURRENT_TIMESTAMP
WHERE id IN (SELECT id FROM random_long_trail);