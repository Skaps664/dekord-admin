-- Add merch support to cart_items table
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS merch_id UUID REFERENCES merch(id) ON DELETE CASCADE;
ALTER TABLE cart_items ALTER COLUMN product_id DROP NOT NULL;

-- Drop the old unique constraint
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_variant_id_key;

-- Drop any existing indexes that might conflict
DROP INDEX IF EXISTS unique_product_cart_item;
DROP INDEX IF EXISTS unique_merch_cart_item;

-- Create new unique indexes with partial constraints
-- For products: user_id + product_id + variant_id must be unique when product_id is not null
CREATE UNIQUE INDEX unique_product_cart_item 
  ON cart_items (user_id, product_id, variant_id) 
  WHERE product_id IS NOT NULL;

-- For merch: user_id + merch_id must be unique when merch_id is not null
CREATE UNIQUE INDEX unique_merch_cart_item 
  ON cart_items (user_id, merch_id) 
  WHERE merch_id IS NOT NULL;

-- Ensure either product_id or merch_id is set, but not both
ALTER TABLE cart_items ADD CONSTRAINT check_product_or_merch 
  CHECK (
    (product_id IS NOT NULL AND merch_id IS NULL) OR 
    (product_id IS NULL AND merch_id IS NOT NULL)
  );

-- Update RLS policies to allow merch operations
DROP POLICY IF EXISTS "Users can view their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can insert their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete their own cart items" ON cart_items;

CREATE POLICY "Users can view their own cart items" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" ON cart_items
  FOR DELETE USING (auth.uid() = user_id);