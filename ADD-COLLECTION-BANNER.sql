-- Add banner image field to collections table
ALTER TABLE collections 
ADD COLUMN IF NOT EXISTS banner_image TEXT;

COMMENT ON COLUMN collections.banner_image IS 'Hero banner image for collection page';
