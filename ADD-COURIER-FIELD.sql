-- Add courier field to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS courier TEXT;

-- Update existing orders to have null courier
UPDATE orders 
SET courier = NULL 
WHERE courier IS NULL;

COMMENT ON COLUMN orders.courier IS 'Courier service used for shipping: Trax, Postex, or Leopards';
