-- ============================================
-- ADD ADMIN POLICIES FOR PRODUCT MANAGEMENT
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- PRODUCTS TABLE - ADD INSERT, UPDATE, DELETE
-- ============================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Public can insert products" ON products;
DROP POLICY IF EXISTS "Public can update products" ON products;
DROP POLICY IF EXISTS "Public can delete products" ON products;
DROP POLICY IF EXISTS "Public can view active products" ON products;
DROP POLICY IF EXISTS "Public can view all products" ON products;

-- Allow anyone to view ALL products (not just active ones) for admin
CREATE POLICY "Public can view all products"
  ON products FOR SELECT
  TO public
  USING (true);

-- Allow anyone to insert products (for admin panel)
CREATE POLICY "Public can insert products"
  ON products FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anyone to update products (for admin panel)
CREATE POLICY "Public can update products"
  ON products FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete products (for admin panel)
CREATE POLICY "Public can delete products"
  ON products FOR DELETE
  TO public
  USING (true);

-- ============================================
-- PRODUCT VARIANTS - ADD INSERT, UPDATE, DELETE
-- ============================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Public can insert variants" ON product_variants;
DROP POLICY IF EXISTS "Public can update variants" ON product_variants;
DROP POLICY IF EXISTS "Public can delete variants" ON product_variants;

-- Allow anyone to insert variants
CREATE POLICY "Public can insert variants"
  ON product_variants FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anyone to update variants
CREATE POLICY "Public can update variants"
  ON product_variants FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete variants
CREATE POLICY "Public can delete variants"
  ON product_variants FOR DELETE
  TO public
  USING (true);

-- ============================================
-- COLLECTIONS - ADD INSERT, UPDATE, DELETE
-- ============================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Public can view active collections" ON collections;
DROP POLICY IF EXISTS "Public can view all collections" ON collections;
DROP POLICY IF EXISTS "Public can insert collections" ON collections;
DROP POLICY IF EXISTS "Public can update collections" ON collections;
DROP POLICY IF EXISTS "Public can delete collections" ON collections;

-- Allow anyone to view ALL collections (not just active)
CREATE POLICY "Public can view all collections"
  ON collections FOR SELECT
  TO public
  USING (true);

-- Allow anyone to insert collections
CREATE POLICY "Public can insert collections"
  ON collections FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anyone to update collections
CREATE POLICY "Public can update collections"
  ON collections FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete collections
CREATE POLICY "Public can delete collections"
  ON collections FOR DELETE
  TO public
  USING (true);

-- ============================================
-- COLLECTION PRODUCTS - ADD INSERT, UPDATE, DELETE
-- ============================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Public can insert collection products" ON collection_products;
DROP POLICY IF EXISTS "Public can update collection products" ON collection_products;
DROP POLICY IF EXISTS "Public can delete collection products" ON collection_products;

-- Allow anyone to insert collection-product links
CREATE POLICY "Public can insert collection products"
  ON collection_products FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anyone to update collection-product links
CREATE POLICY "Public can update collection products"
  ON collection_products FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete collection-product links
CREATE POLICY "Public can delete collection products"
  ON collection_products FOR DELETE
  TO public
  USING (true);

-- ============================================
-- DONE!
-- Your admin panel can now create, update, and delete products
-- ============================================

-- NOTE: In production, you should restrict these policies to
-- authenticated admin users only. For now, this allows the
-- admin panel to work with the anon key.
