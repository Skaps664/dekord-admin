-- ============================================================
-- Migration: Add availability field to products table
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================
-- Adds an 'availability' column to products to explicitly track
-- whether a product is in_stock, out_of_stock, or coming_soon.
-- This replaces the previous convention of using stock=0 for
-- out-of-stock and stock=99999 for pre-order/coming-soon.
-- ============================================================

-- 1. Add availability column with default 'in_stock'
ALTER TABLE products ADD COLUMN IF NOT EXISTS availability text DEFAULT 'in_stock';

-- 2. Backfill existing products based on current stock convention
UPDATE products SET availability = 'out_of_stock' WHERE stock = 0;
UPDATE products SET availability = 'coming_soon' WHERE stock = 99999;
UPDATE products SET availability = 'in_stock' WHERE stock > 0 AND stock != 99999;

-- 3. Add a CHECK constraint to ensure valid values
ALTER TABLE products ADD CONSTRAINT products_availability_check 
  CHECK (availability IN ('in_stock', 'out_of_stock', 'coming_soon'));
