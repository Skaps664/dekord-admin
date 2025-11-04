-- ============================================
-- ADMIN PANEL ACCESS TO USERS
-- ============================================
-- This script allows the admin panel (using anon key) to view user data
-- Note: auth.users table needs service role key for full access
-- We'll create policies for user_profiles which the admin can access

-- Drop existing policies (both old and new)
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;
DROP POLICY IF EXISTS "Public can read all user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Public can insert user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Public can update user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Public can delete user profiles" ON user_profiles;

-- Create public policies for user_profiles (accessible by admin panel)
CREATE POLICY "Public can read all user profiles"
ON user_profiles FOR SELECT
TO public
USING (true);

CREATE POLICY "Public can insert user profiles"
ON user_profiles FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Public can update user profiles"
ON user_profiles FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can delete user profiles"
ON user_profiles FOR DELETE
TO public
USING (true);

-- Note about auth.users access:
-- The auth.users table is managed by Supabase Auth and cannot be directly
-- accessed with anon key for security reasons. To show user emails and auth data
-- in the admin panel, you have two options:
--
-- Option 1: Use Supabase service role key (NOT RECOMMENDED for client-side)
-- Option 2: Create a server-side API endpoint that uses service role key
-- Option 3: Create a database function with security definer (recommended)

-- Drop existing functions
DROP FUNCTION IF EXISTS get_users_with_profiles();
DROP FUNCTION IF EXISTS get_user_with_profile(UUID);

-- Create a function to get users with profiles (using security definer)
CREATE OR REPLACE FUNCTION get_users_with_profiles()
RETURNS TABLE (
  id UUID,
  email VARCHAR(255),
  created_at TIMESTAMPTZ,
  full_name TEXT,
  phone TEXT,
  city TEXT,
  province TEXT,
  order_count BIGINT,
  total_spent NUMERIC
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email::VARCHAR(255),
    au.created_at,
    up.full_name,
    up.phone,
    up.city,
    up.province,
    COUNT(DISTINCT o.id) as order_count,
    COALESCE(SUM(o.total), 0) as total_spent
  FROM auth.users au
  LEFT JOIN user_profiles up ON au.id = up.id
  LEFT JOIN orders o ON au.id = o.user_id
  GROUP BY 
    au.id, 
    au.email, 
    au.created_at,
    up.full_name,
    up.phone,
    up.city,
    up.province
  ORDER BY au.created_at DESC;
END;
$$;

-- Grant execute permission to public (anon role)
GRANT EXECUTE ON FUNCTION get_users_with_profiles() TO public;

-- Create a function to get single user with profile
CREATE OR REPLACE FUNCTION get_user_with_profile(user_id UUID)
RETURNS TABLE (
  id UUID,
  email VARCHAR(255),
  created_at TIMESTAMPTZ,
  full_name TEXT,
  phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  marketing_emails BOOLEAN,
  order_count BIGINT,
  total_spent NUMERIC
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email::VARCHAR(255),
    au.created_at,
    up.full_name,
    up.phone,
    up.address_line1,
    up.address_line2,
    up.city,
    up.province,
    up.postal_code,
    up.marketing_emails,
    COUNT(DISTINCT o.id) as order_count,
    COALESCE(SUM(o.total), 0) as total_spent
  FROM auth.users au
  LEFT JOIN user_profiles up ON au.id = up.id
  LEFT JOIN orders o ON au.id = o.user_id
  WHERE au.id = get_user_with_profile.user_id
  GROUP BY 
    au.id, 
    au.email, 
    au.created_at,
    up.full_name,
    up.phone,
    up.address_line1,
    up.address_line2,
    up.city,
    up.province,
    up.postal_code,
    up.marketing_emails;
END;
$$;

-- Grant execute permission to public (anon role)
GRANT EXECUTE ON FUNCTION get_user_with_profile(UUID) TO public;

-- Note: These policies allow the admin panel (using anon key) to manage user profiles.
-- The admin panel should be protected by authentication at the application level.
