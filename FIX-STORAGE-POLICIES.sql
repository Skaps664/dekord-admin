-- ============================================
-- FIX STORAGE BUCKET POLICIES
-- Run this in your Supabase SQL Editor
-- ============================================

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for products" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload products" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update products" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON storage.objects;

-- Create products storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Allow ANYONE (including anon) to read from products bucket
CREATE POLICY "Public read access for products"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

-- Allow ANYONE (including anon) to upload to products bucket
CREATE POLICY "Anyone can upload to products"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'products');

-- Allow ANYONE (including anon) to update products
CREATE POLICY "Anyone can update products"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'products');

-- Allow ANYONE (including anon) to delete from products
CREATE POLICY "Anyone can delete products"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'products');

-- Add og_image field to products table if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS og_image TEXT;

-- ============================================
-- DONE! Image uploads should now work
-- ============================================
