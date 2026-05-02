-- Add star_rating column to reviews table
-- Run this in your Supabase SQL editor before deploying the star rating feature

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS star_rating smallint CHECK (star_rating BETWEEN 1 AND 5);

-- Optional: index for analytics queries (avg rating per client, etc.)
CREATE INDEX IF NOT EXISTS reviews_star_rating_client_idx
  ON reviews (client_id, star_rating)
  WHERE star_rating IS NOT NULL;
