-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
  min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount_amount DECIMAL(10, 2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  usage_limit_per_user INTEGER DEFAULT 1,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create coupon_usage tracking table
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  discount_amount DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add coupon fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_discount DECIMAL(10, 2) DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_dates ON coupons(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_id ON coupon_usage(user_id);

-- Create updated_at trigger for coupons
CREATE OR REPLACE FUNCTION update_coupons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_coupons_updated_at ON coupons;
CREATE TRIGGER trigger_update_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_coupons_updated_at();

-- RLS Policies for coupons
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- Public can manage all coupons (admin panel uses anon key)
CREATE POLICY "Public can view all coupons" ON coupons
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert coupons" ON coupons
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update coupons" ON coupons
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Public can delete coupons" ON coupons
  FOR DELETE
  TO public
  USING (true);

-- Public can manage coupon usage
CREATE POLICY "Public can view coupon usage" ON coupon_usage
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert coupon usage" ON coupon_usage
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update coupon usage" ON coupon_usage
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Public can delete coupon usage" ON coupon_usage
  FOR DELETE
  TO public
  USING (true);

-- Function to validate and apply coupon
CREATE OR REPLACE FUNCTION validate_coupon(
  coupon_code_input VARCHAR(50),
  user_id_input UUID,
  cart_total DECIMAL(10, 2)
)
RETURNS JSON AS $$
DECLARE
  coupon_record RECORD;
  usage_count INTEGER;
  discount_amount DECIMAL(10, 2);
  result JSON;
BEGIN
  -- Get coupon details
  SELECT * INTO coupon_record
  FROM coupons
  WHERE code = coupon_code_input
    AND is_active = true
    AND start_date <= NOW()
    AND (end_date IS NULL OR end_date >= NOW());

  -- Check if coupon exists
  IF NOT FOUND THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Invalid or expired coupon code'
    );
  END IF;

  -- Check minimum purchase amount
  IF cart_total < coupon_record.min_purchase_amount THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Minimum purchase amount not met',
      'min_amount', coupon_record.min_purchase_amount
    );
  END IF;

  -- Check total usage limit
  IF coupon_record.usage_limit IS NOT NULL AND coupon_record.used_count >= coupon_record.usage_limit THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Coupon usage limit reached'
    );
  END IF;

  -- Check per-user usage limit
  IF user_id_input IS NOT NULL AND coupon_record.usage_limit_per_user IS NOT NULL THEN
    SELECT COUNT(*) INTO usage_count
    FROM coupon_usage
    WHERE coupon_id = coupon_record.id
      AND user_id = user_id_input;

    IF usage_count >= coupon_record.usage_limit_per_user THEN
      RETURN json_build_object(
        'valid', false,
        'error', 'You have already used this coupon'
      );
    END IF;
  END IF;

  -- Calculate discount
  IF coupon_record.discount_type = 'percentage' THEN
    discount_amount := (cart_total * coupon_record.discount_value) / 100;
    IF coupon_record.max_discount_amount IS NOT NULL THEN
      discount_amount := LEAST(discount_amount, coupon_record.max_discount_amount);
    END IF;
  ELSE
    discount_amount := coupon_record.discount_value;
  END IF;

  -- Ensure discount doesn't exceed cart total
  discount_amount := LEAST(discount_amount, cart_total);

  -- Return success with discount details
  RETURN json_build_object(
    'valid', true,
    'coupon_id', coupon_record.id,
    'code', coupon_record.code,
    'discount_type', coupon_record.discount_type,
    'discount_value', coupon_record.discount_value,
    'discount_amount', discount_amount,
    'description', coupon_record.description
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample coupons (optional - remove if you don't want sample data)
INSERT INTO coupons (code, description, discount_type, discount_value, min_purchase_amount, start_date, end_date, usage_limit)
VALUES 
  ('WELCOME10', 'Welcome discount - 10% off', 'percentage', 10.00, 500.00, NOW(), NOW() + INTERVAL '30 days', 100),
  ('SAVE500', 'Save Rs. 500 on orders above Rs. 2000', 'fixed_amount', 500.00, 2000.00, NOW(), NOW() + INTERVAL '7 days', 50),
  ('NEWYEAR25', 'New Year Special - 25% off (max Rs. 1000)', 'percentage', 25.00, 1000.00, NOW(), NOW() + INTERVAL '60 days', NULL)
ON CONFLICT (code) DO NOTHING;

UPDATE coupons SET max_discount_amount = 1000.00 WHERE code = 'NEWYEAR25';
