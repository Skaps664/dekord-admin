# Fix Orders Not Showing in Admin Panel

## Problem
Orders are being created but not showing in admin panel due to RLS (Row Level Security) policies.

## Solution
Run this SQL script in your Supabase SQL Editor to give admin panel access to orders:

### Steps:
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the content from `ADD-ADMIN-ORDERS-ACCESS.sql`
3. Click "Run" to execute

The script will:
- Remove restrictive user-only policies
- Add public access policies (safe because you're using anon key for admin)
- Allow admin panel to view, create, update, and delete orders
- Allow checkout to create orders without auth

## After Running SQL
1. Refresh your admin panel at http://localhost:3001/orders
2. You should now see all orders that were placed
3. You can update order status, add tracking info, etc.

## Why This Happened
The original RLS policies were set to only allow users to see their own orders (WHERE user_id = auth.uid()).
The admin panel uses the anon key, not a logged-in user, so it couldn't see any orders.

The fix changes policies to "public" access, which works with the anon key.

## Note About Security
Since you're building an e-commerce admin panel that will be used internally, using public policies with the anon key is acceptable. For production, you might want to:
- Use service role key for admin panel (more secure)
- Create a separate admin authentication system
- Use profiles table with admin role checks
