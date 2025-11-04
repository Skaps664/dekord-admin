-- ============================================
-- ADD SKU AND IS_DEFAULT TO DATABASE
-- Run this in your Supabase SQL Editor
-- ============================================

-- Add SKU field to products table (for product's own SKU)
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT;

-- Add unique index on product SKU
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku ON products(sku) WHERE sku IS NOT NULL;

-- Add is_default field to variants table (to mark the base/default variant)
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- Add index on is_default for faster queries
CREATE INDEX IF NOT EXISTS idx_variants_is_default ON product_variants(product_id, is_default);

-- ============================================
-- DONE!
-- Now products have their own SKU
-- And variants can be marked as default/base
-- ============================================
