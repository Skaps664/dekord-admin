-- ============================================
-- STORAGE BUCKET SETUP FOR PRODUCT IMAGES
-- Run this in your Supabase SQL Editor
-- ============================================

-- Create products storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to products bucket
CREATE POLICY IF NOT EXISTS "Public read access for products"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Allow authenticated users to upload to products bucket
CREATE POLICY IF NOT EXISTS "Authenticated users can upload products"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their uploads
CREATE POLICY IF NOT EXISTS "Authenticated users can update products"
ON storage.objects FOR UPDATE
USING (bucket_id = 'products' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete their uploads
CREATE POLICY IF NOT EXISTS "Authenticated users can delete products"
ON storage.objects FOR DELETE
USING (bucket_id = 'products' AND auth.role() = 'authenticated');

-- Add og_image field to products table for SEO
ALTER TABLE products ADD COLUMN IF NOT EXISTS og_image TEXT;

-- ============================================
-- DONE! 
-- Now you can upload product images through the admin panel
-- ============================================
