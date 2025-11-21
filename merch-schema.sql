-- Create merch table
CREATE TABLE IF NOT EXISTS merch (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  quantity_available INTEGER DEFAULT 0,
  meta_title VARCHAR(255) NOT NULL,
  meta_description TEXT NOT NULL,
  image_1 VARCHAR(500) NOT NULL,
  image_2 VARCHAR(500) NOT NULL,
  image_3 VARCHAR(500) NOT NULL,
  image_4 VARCHAR(500),
  image_5 VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create merch_features table for storing features
CREATE TABLE IF NOT EXISTS merch_features (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merch_id UUID NOT NULL REFERENCES merch(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_merch_slug ON merch(slug);
CREATE INDEX IF NOT EXISTS idx_merch_status ON merch(status);
CREATE INDEX IF NOT EXISTS idx_merch_created_at ON merch(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_merch_features_merch_id ON merch_features(merch_id);

-- Enable RLS
ALTER TABLE merch ENABLE ROW LEVEL SECURITY;
ALTER TABLE merch_features ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read merch" ON merch;
DROP POLICY IF EXISTS "Allow authenticated users to insert merch" ON merch;
DROP POLICY IF EXISTS "Allow authenticated users to update merch" ON merch;
DROP POLICY IF EXISTS "Allow authenticated users to delete merch" ON merch;
DROP POLICY IF EXISTS "Allow authenticated users to read merch_features" ON merch_features;
DROP POLICY IF EXISTS "Allow authenticated users to insert merch_features" ON merch_features;
DROP POLICY IF EXISTS "Allow authenticated users to update merch_features" ON merch_features;
DROP POLICY IF EXISTS "Allow authenticated users to delete merch_features" ON merch_features;

-- Create policies for merch table
CREATE POLICY "Allow authenticated users to read merch" ON merch
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Allow authenticated users to insert merch" ON merch
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Allow authenticated users to update merch" ON merch
  FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Allow authenticated users to delete merch" ON merch
  FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Create policies for merch_features table
CREATE POLICY "Allow authenticated users to read merch_features" ON merch_features
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Allow authenticated users to insert merch_features" ON merch_features
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Allow authenticated users to update merch_features" ON merch_features
  FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Allow authenticated users to delete merch_features" ON merch_features
  FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for merch table
CREATE TRIGGER update_merch_updated_at
  BEFORE UPDATE ON merch
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for merch images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('merch', 'merch', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload merch images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update merch images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete merch images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view merch images" ON storage.objects;

-- Create storage policies for merch bucket
CREATE POLICY "Allow authenticated users to upload merch images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'merch' AND
    (auth.role() = 'authenticated' OR auth.role() = 'anon')
  );

CREATE POLICY "Allow authenticated users to update merch images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'merch' AND
    (auth.role() = 'authenticated' OR auth.role() = 'anon')
  );

CREATE POLICY "Allow authenticated users to delete merch images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'merch' AND
    (auth.role() = 'authenticated' OR auth.role() = 'anon')
  );

CREATE POLICY "Allow public to view merch images" ON storage.objects
  FOR SELECT USING (bucket_id = 'merch');