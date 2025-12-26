-- Claims Table
CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Customer Information
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  whatsapp_number VARCHAR(50) NOT NULL,
  city VARCHAR(100) NOT NULL,
  order_number VARCHAR(100) NOT NULL,
  
  -- Claim Details
  claim_type VARCHAR(50) NOT NULL, -- 'return', 'refund', 'warranty', 'complaint'
  message TEXT NOT NULL,
  images TEXT[], -- Array of image URLs
  
  -- Status and Progress
  status VARCHAR(50) DEFAULT 'pending' NOT NULL, -- 'pending', 'under_review', 'approved', 'rejected', 'resolved', 'cancelled'
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  
  -- Admin Notes and Tracking
  admin_notes TEXT,
  resolution_notes TEXT,
  assigned_to VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  
  -- Metadata
  user_agent TEXT,
  ip_address VARCHAR(45)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_created_at ON claims(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_claims_email ON claims(email);
CREATE INDEX IF NOT EXISTS idx_claims_order_number ON claims(order_number);
CREATE INDEX IF NOT EXISTS idx_claims_claim_number ON claims(claim_number);

-- Function to generate claim number
CREATE OR REPLACE FUNCTION generate_claim_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
BEGIN
  -- Get the count of claims today
  SELECT COUNT(*) + 1 INTO counter
  FROM claims
  WHERE DATE(created_at) = CURRENT_DATE;
  
  -- Generate claim number like CLM-20231226-0001
  new_number := 'CLM-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate claim number
CREATE OR REPLACE FUNCTION set_claim_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.claim_number IS NULL OR NEW.claim_number = '' THEN
    NEW.claim_number := generate_claim_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_claim_number
BEFORE INSERT ON claims
FOR EACH ROW
EXECUTE FUNCTION set_claim_number();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_claims_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_claims_updated_at
BEFORE UPDATE ON claims
FOR EACH ROW
EXECUTE FUNCTION update_claims_updated_at();

-- Enable RLS (Row Level Security) if using Supabase
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to do everything
CREATE POLICY "Service role full access"
ON claims
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Allow anyone (anon and authenticated) to insert claims
CREATE POLICY "Allow public to insert claims"
ON claims
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy: Allow anyone to view claims (admin will use service role for updates)
CREATE POLICY "Allow public to view claims"
ON claims
FOR SELECT
TO anon, authenticated
USING (true);

-- ============================================
-- STORAGE BUCKET SETUP
-- ============================================

-- Note: Run these commands separately in Supabase Dashboard > Storage

-- 1. Create 'claims' bucket (if not exists):
--    - Go to Storage in Supabase Dashboard
--    - Click "New bucket"
--    - Name: claims
--    - Public: Yes
--    - Click Create

-- 2. Or use SQL to create bucket:
INSERT INTO storage.buckets (id, name, public)
VALUES ('claims', 'claims', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set RLS policies for storage bucket:

CREATE POLICY IF NOT EXISTS "Allow public uploads to claims"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'claims');

CREATE POLICY IF NOT EXISTS "Allow public reads from claims"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'claims');

CREATE POLICY IF NOT EXISTS "Service role full access to claims bucket"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'claims')
WITH CHECK (bucket_id = 'claims');
