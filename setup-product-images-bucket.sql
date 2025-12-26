-- Create product-images storage bucket for review images
-- Run this in Supabase SQL Editor

-- First, insert the bucket into storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public to view product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload review images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to upload review images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their review images" ON storage.objects;

-- Policy 1: Allow anyone to view product images (public bucket)
CREATE POLICY "Allow public to view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Policy 2: Allow authenticated users to upload review images
CREATE POLICY "Allow authenticated users to upload review images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] = 'reviews'
);

-- Policy 3: Allow anonymous users to upload review images (for guest reviews)
CREATE POLICY "Allow users to upload review images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] = 'reviews'
);

-- Policy 4: Allow users to delete their own review images
CREATE POLICY "Allow users to delete their review images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] = 'reviews'
);

-- Policy 5: Allow service role full access (backup)
CREATE POLICY "Service role has full access to product images"
ON storage.objects FOR ALL
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');
