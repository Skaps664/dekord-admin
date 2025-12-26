-- Fix reviews and user_profiles RLS policies
-- Run this in Supabase SQL Editor

-- Drop existing reviews policies
DROP POLICY IF EXISTS "Allow authenticated users to read reviews" ON reviews;
DROP POLICY IF EXISTS "Allow authenticated users to insert reviews" ON reviews;
DROP POLICY IF EXISTS "Allow users to update their own reviews" ON reviews;

-- Create new reviews policies with proper access
CREATE POLICY "Allow everyone to read reviews"
ON reviews
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow authenticated to insert reviews"
ON reviews
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own reviews"
ON reviews
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Drop existing user_profiles policies if any
DROP POLICY IF EXISTS "Allow public to read user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_profiles;

-- Create user_profiles SELECT policy (needed for joins)
CREATE POLICY "Allow everyone to read user profiles"
ON user_profiles
FOR SELECT
TO anon, authenticated
USING (true);

-- Verify
SELECT tablename, policyname, cmd FROM pg_policies 
WHERE tablename IN ('reviews', 'user_profiles')
ORDER BY tablename, policyname;
