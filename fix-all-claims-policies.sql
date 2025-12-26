-- ============================================
-- COMPLETE FIX: Claims Table + Storage Policies
-- Run this ENTIRE file in Supabase SQL Editor
-- ============================================

-- ============================================
-- PART 1: Drop ALL existing policies
-- ============================================

-- Drop table policies
DROP POLICY IF EXISTS "Public can insert claims" ON claims;
DROP POLICY IF EXISTS "Users can insert their own claims" ON claims;
DROP POLICY IF EXISTS "Users can view their own claims" ON claims;
DROP POLICY IF EXISTS "Service role can do everything on claims" ON claims;
DROP POLICY IF EXISTS "Allow public to insert claims" ON claims;
DROP POLICY IF EXISTS "Allow public to view claims" ON claims;
DROP POLICY IF EXISTS "Service role full access" ON claims;
DROP POLICY IF EXISTS "Allow authenticated to update claims" ON claims;
DROP POLICY IF EXISTS "Allow authenticated to delete claims" ON claims;

-- Drop storage policies
DROP POLICY IF EXISTS "Allow public uploads to claims" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads from claims" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated to update claims objects" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated to delete claims objects" ON storage.objects;
DROP POLICY IF EXISTS "Service role full access to claims bucket" ON storage.objects;

-- ============================================
-- PART 2: Create Claims Table Policies
-- ============================================

-- 1. Allow anyone (anon and authenticated) to INSERT claims
CREATE POLICY "Allow public to insert claims"
ON claims
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 2. Allow anyone to SELECT/VIEW claims
CREATE POLICY "Allow public to view claims"
ON claims
FOR SELECT
TO anon, authenticated
USING (true);

-- 3. Allow anyone (anon and authenticated) to UPDATE claims (for admin panel)
CREATE POLICY "Allow authenticated to update claims"
ON claims
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 4. Allow anyone (anon and authenticated) to DELETE claims (for admin panel)
CREATE POLICY "Allow authenticated to delete claims"
ON claims
FOR DELETE
TO anon, authenticated
USING (true);

-- 5. Allow service role FULL access (backup)
CREATE POLICY "Service role full access"
ON claims
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- PART 3: Create Storage Bucket & Policies
-- ============================================

-- Create claims bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('claims', 'claims', true)
ON CONFLICT (id) DO NOTHING;

-- 1. Allow public to UPLOAD to claims bucket
CREATE POLICY "Allow public uploads to claims"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'claims');

-- 2. Allow public to READ from claims bucket
CREATE POLICY "Allow public reads from claims"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'claims');

-- 3. Allow authenticated users to UPDATE objects
CREATE POLICY "Allow authenticated to update claims objects"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'claims')
WITH CHECK (bucket_id = 'claims');

-- 4. Allow authenticated users to DELETE objects
CREATE POLICY "Allow authenticated to delete claims objects"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'claims');

-- 5. Service role full access to storage
CREATE POLICY "Service role full access to claims bucket"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'claims')
WITH CHECK (bucket_id = 'claims');

-- ============================================
-- PART 4: Verification Queries
-- ============================================

-- Check claims table policies
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'claims'
ORDER BY policyname;

-- Check storage bucket exists
SELECT id, name, public FROM storage.buckets WHERE name = 'claims';

-- Check storage policies
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'objects' AND policyname LIKE '%claims%'
ORDER BY policyname;

-- ============================================
-- SUCCESS! Now test:
-- 1. Submit a claim from frontend with images
-- 2. Update status in admin panel
-- 3. Refresh page - status should persist
-- ============================================
