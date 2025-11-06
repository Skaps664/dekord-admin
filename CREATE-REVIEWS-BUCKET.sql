-- =====================================================
-- CREATE REVIEWS STORAGE BUCKET - COMPLETE SETUP
-- =====================================================

-- STEP 1: First, manually create the bucket in Supabase Dashboard
-- Go to: Storage → New bucket
-- Name: reviews (lowercase, no spaces)
-- Public: YES (check the box)
-- Then come back and run this SQL

-- =====================================================
-- STEP 2: Run this SQL to create policies
-- =====================================================

-- Clean up old policies if they exist
DROP POLICY IF EXISTS "Users can upload review images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view review images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own review images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update review images" ON storage.objects;

-- Policy 1: Allow authenticated users to upload (INSERT)
CREATE POLICY "Users can upload review images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'reviews');

-- Policy 2: Allow everyone to view (SELECT) - public bucket
CREATE POLICY "Anyone can view review images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'reviews');

-- Policy 3: Users can delete their own images
CREATE POLICY "Users can delete own review images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'reviews' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy 4: Users can update their own images
CREATE POLICY "Authenticated users can update review images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'reviews' AND (storage.foldername(name))[1] = auth.uid()::text);

-- =====================================================
-- STEP 3: Verify bucket exists
-- =====================================================
-- Run this query to check if bucket is created:
SELECT * FROM storage.buckets WHERE id = 'reviews';

-- You should see:
-- id: reviews
-- name: reviews
-- public: true

-- =====================================================
-- STEP 4: Test upload (after creating bucket)
-- =====================================================
-- Go to: Storage → reviews bucket
-- Try uploading a test image manually
-- If it works, the review image uploads will work too
