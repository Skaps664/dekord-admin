-- ============================================
-- URGENT FIX: Storage Bucket Policies for Claims
-- Run this immediately in Supabase SQL Editor
-- ============================================

-- Create claims bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('claims', 'claims', true)
ON CONFLICT (id) DO NOTHING;

-- Drop any existing problematic policies
DROP POLICY IF EXISTS "Allow public uploads to claims" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads from claims" ON storage.objects;
DROP POLICY IF EXISTS "Service role full access to claims bucket" ON storage.objects;

-- Create new working policies for storage bucket
CREATE POLICY "Allow public uploads to claims"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'claims');

CREATE POLICY "Allow public reads from claims"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'claims');

CREATE POLICY "Service role full access to claims bucket"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'claims')
WITH CHECK (bucket_id = 'claims');

-- Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'objects' AND policyname LIKE '%claims%';

-- Verify bucket exists and is public
SELECT id, name, public FROM storage.buckets WHERE name = 'claims';
