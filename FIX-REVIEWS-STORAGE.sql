-- =====================================================
-- FIX REVIEWS STORAGE BUCKET
-- Run this in Supabase SQL Editor if bucket was not created properly
-- =====================================================

-- First, check if bucket exists (this will show error if it doesn't exist)
-- If you see error, go to Supabase Dashboard → Storage → Create bucket named "reviews"

-- Then run these policies to allow uploads and reads:

-- Delete old policies if they exist
DROP POLICY IF EXISTS "Users can upload review images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view review images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own review images" ON storage.objects;

-- Allow authenticated users to upload review images
CREATE POLICY "Users can upload review images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'reviews');

-- Allow anyone to view review images (public bucket)
CREATE POLICY "Anyone can view review images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'reviews');

-- Users can delete their own review images
CREATE POLICY "Users can delete own review images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'reviews' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update existing policy for authenticated users to also handle reviews bucket
CREATE POLICY "Authenticated users can update review images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'reviews' AND auth.uid()::text = (storage.foldername(name))[1]);
