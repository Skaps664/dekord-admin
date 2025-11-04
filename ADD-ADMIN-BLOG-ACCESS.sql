-- Drop existing restrictive policies (if any)
DROP POLICY IF EXISTS "Users can read own blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can insert own blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can update own blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can delete own blog posts" ON blog_posts;

-- Create public policies for blog_posts (accessible by admin panel)
CREATE POLICY "Public can read all blog posts"
ON blog_posts FOR SELECT
TO public
USING (true);

CREATE POLICY "Public can insert blog posts"
ON blog_posts FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Public can update blog posts"
ON blog_posts FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can delete blog posts"
ON blog_posts FOR DELETE
TO public
USING (true);

-- Note: These policies allow the admin panel (using anon key) to manage blog posts.
-- The admin panel should be protected by authentication at the application level.
