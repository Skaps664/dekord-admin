-- ============================================
-- Quick Fix for Claims RLS Policies
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Drop existing problematic policies
DROP POLICY IF EXISTS "Public can insert claims" ON claims;
DROP POLICY IF EXISTS "Users can insert their own claims" ON claims;
DROP POLICY IF EXISTS "Users can view their own claims" ON claims;
DROP POLICY IF EXISTS "Service role can do everything on claims" ON claims;

-- Step 2: Create working policies

-- Allow anyone (anon and authenticated) to insert claims
CREATE POLICY "Allow public to insert claims"
ON claims
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anyone to view claims
CREATE POLICY "Allow public to view claims"
ON claims
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow authenticated users to update all claims (for admin panel)
CREATE POLICY "Allow authenticated to update claims"
ON claims
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow service role full access (for admin panel)
CREATE POLICY "Service role full access"
ON claims
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- Verification Query
-- ============================================

-- Check if policies were created successfully
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'claims';

-- ============================================
-- Create Storage Bucket (if not exists)
-- ============================================

-- Create claims storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('claims', 'claims', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Storage Bucket Policies for Claims
-- ============================================

-- Allow anyone to upload to claims folder
CREATE POLICY IF NOT EXISTS "Allow public uploads to claims"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'claims');

-- Allow anyone to read from claims bucket
CREATE POLICY IF NOT EXISTS "Allow public reads from claims"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'claims');

-- Allow service role full access to claims bucket
CREATE POLICY IF NOT EXISTS "Service role full access to claims bucket"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'claims')
WITH CHECK (bucket_id = 'claims');

-- Verify bucket was created
SELECT * FROM storage.buckets WHERE name = 'claims';
