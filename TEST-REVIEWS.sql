-- =====================================================
-- TEST REVIEWS - Check if reviews exist in database
-- =====================================================

-- 1. Check all reviews
SELECT 
  r.id,
  r.product_id,
  r.rating,
  r.comment,
  r.created_at,
  p.name as product_name,
  up.full_name as user_name
FROM reviews r
LEFT JOIN products p ON p.id = r.product_id
LEFT JOIN user_profiles up ON up.id = r.user_id
ORDER BY r.created_at DESC;

-- 2. Check product ratings
SELECT 
  id,
  name,
  rating,
  review_count
FROM products
WHERE review_count > 0;

-- 3. Check if reviews table has data
SELECT COUNT(*) as total_reviews FROM reviews;

-- 4. Check specific product reviews (replace with your product ID)
-- SELECT * FROM reviews WHERE product_id = 'YOUR_PRODUCT_ID_HERE';
