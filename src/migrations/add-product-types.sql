-- ============================================================
-- Migration: Add Product Types system + hero_image to products
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Create product_types table
CREATE TABLE IF NOT EXISTS product_types (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  
  -- Specifications section (expandable accordion)
  specifications jsonb DEFAULT '[]'::jsonb,
  -- quick_specs: the 3 highlighted specs shown in collapsed view
  quick_specs jsonb DEFAULT '[]'::jsonb,
  
  -- Specialty Showcase section
  showcase_heading text DEFAULT 'Details that matter',
  showcase_subheading text DEFAULT '',
  showcase_items jsonb DEFAULT '[]'::jsonb,
  
  -- Comparison section
  comparison_heading text DEFAULT 'REDEFINING THE STANDARD',
  comparison_subheading text DEFAULT 'Not all products are created equal. Here''s why we stand apart.',
  comparison_features jsonb DEFAULT '[]'::jsonb,
  
  -- Features section
  features_heading text DEFAULT 'Why you''ll love it',
  feature_cards jsonb DEFAULT '[]'::jsonb,
  
  -- Lookbook section
  lookbook_images jsonb DEFAULT '[]'::jsonb,
  
  -- Purchase panel points (3 points under Buy now button)
  purchase_points jsonb DEFAULT '[]'::jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Add type_id and hero_image columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS type_id uuid REFERENCES product_types(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS hero_image text;

-- 3. Enable RLS on product_types
ALTER TABLE product_types ENABLE ROW LEVEL SECURITY;

-- 4. Create permissive policies for product_types (matching existing table patterns)
CREATE POLICY "Allow public read access on product_types" ON product_types
  FOR SELECT USING (true);

CREATE POLICY "Allow all insert on product_types" ON product_types
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update on product_types" ON product_types
  FOR UPDATE USING (true);

CREATE POLICY "Allow all delete on product_types" ON product_types
  FOR DELETE USING (true);

-- 5. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_type_id ON products(type_id);
CREATE INDEX IF NOT EXISTS idx_product_types_slug ON product_types(slug);
