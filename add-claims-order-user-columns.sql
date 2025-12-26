-- Add order_id and user_id columns to claims table

-- Add order_id column to link claims to specific orders
ALTER TABLE claims 
ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE SET NULL;

-- Add user_id column to link claims to users
ALTER TABLE claims 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add admin_response column for admin replies
ALTER TABLE claims 
ADD COLUMN IF NOT EXISTS admin_response TEXT;

-- Create index for faster queries on order_id
CREATE INDEX IF NOT EXISTS idx_claims_order_id ON claims(order_id);

-- Create index for faster queries on user_id
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON claims(user_id);

-- Update existing claims to populate user_id from orders if possible
UPDATE claims c
SET user_id = o.user_id
FROM orders o
WHERE c.order_number = o.order_number
AND c.user_id IS NULL;

-- Update existing claims to populate order_id from orders if possible  
UPDATE claims c
SET order_id = o.id
FROM orders o
WHERE c.order_number = o.order_number
AND c.order_id IS NULL;
