-- ============================================
-- ADD ADMIN ACCESS TO ORDERS
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
DROP POLICY IF EXISTS "Users can create order items" ON order_items;

-- ORDERS TABLE POLICIES
-- Allow public to view all orders (for admin panel)
CREATE POLICY "Public can view all orders"
ON orders FOR SELECT
TO public
USING (true);

-- Allow public to insert orders (for checkout)
CREATE POLICY "Public can insert orders"
ON orders FOR INSERT
TO public
WITH CHECK (true);

-- Allow public to update orders (for admin status updates)
CREATE POLICY "Public can update orders"
ON orders FOR UPDATE
TO public
USING (true);

-- Allow public to delete orders (for admin)
CREATE POLICY "Public can delete orders"
ON orders FOR DELETE
TO public
USING (true);

-- ORDER_ITEMS TABLE POLICIES
-- Allow public to view all order items (for admin panel)
CREATE POLICY "Public can view all order items"
ON order_items FOR SELECT
TO public
USING (true);

-- Allow public to insert order items (for checkout)
CREATE POLICY "Public can insert order items"
ON order_items FOR INSERT
TO public
WITH CHECK (true);

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('orders', 'order_items')
ORDER BY tablename, policyname;

SELECT '✅ Admin access to orders enabled successfully!' as message;
