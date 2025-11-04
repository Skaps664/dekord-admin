-- ============================================
-- Add user_email column to orders table
-- ============================================

-- Step 1: Add the column if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_email TEXT;

-- Step 2: Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON orders(user_email);

-- Step 3: Add comment
COMMENT ON COLUMN orders.user_email IS 'Email address of the logged-in user who placed the order';

-- Step 4: Populate existing orders with user email (if user_id exists)
-- This updates all existing orders to include the user's email from auth.users
UPDATE orders o
SET user_email = u.email
FROM auth.users u
WHERE o.user_id = u.id
  AND o.user_email IS NULL;

-- Step 5: Verify the changes
SELECT 
  COUNT(*) as total_orders,
  COUNT(user_id) as orders_with_user_id,
  COUNT(user_email) as orders_with_user_email
FROM orders;

-- Expected result: orders_with_user_email should match orders_with_user_id
