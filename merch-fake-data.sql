-- Insert fake merch data
INSERT INTO merch (
  name, slug, description, price, sku, status, quantity_available,
  meta_title, meta_description,
  image_1, image_2, image_3, image_4, image_5
) VALUES
(
  'Dekord Canvas Tote',
  'dekord-canvas-tote',
  'Premium canvas tote with dekord logo embroidery. Perfect for carrying your essentials in style. Made from high-quality canvas material that''s both durable and stylish.',
  1200.00,
  'DKD-TOTE-001',
  'active',
  50,
  'Dekord Canvas Tote - Premium Quality Merchandise',
  'Shop the official Dekord Canvas Tote. Premium canvas with logo embroidery, perfect for everyday use. Available in limited quantities.',
  '/merch-tote.webp',
  '/merch-tote-2.webp',
  '/merch-tote-3.webp',
  '/merch-tote-4.webp',
  '/merch-tote-5.webp'
),
(
  'Copper Accent Mug',
  'copper-accent-mug',
  'Elegant ceramic mug with copper accents. Keeps your drinks hot or cold for hours. Perfect for coffee, tea, or any beverage.',
  850.00,
  'DKD-MUG-001',
  'active',
  75,
  'Copper Accent Mug - Premium Ceramic Merchandise',
  'Discover the Dekord Copper Accent Mug. Elegant ceramic design with copper details, keeps drinks at perfect temperature.',
  '/merch-mug.webp',
  '/merch-mug-2.webp',
  '/merch-mug-3.webp',
  '/merch-mug-4.webp',
  NULL
),
(
  'Vinyl Sticker Pack',
  'vinyl-sticker-pack',
  'Collection of 8 vinyl stickers featuring dekord designs. Waterproof and durable. Perfect for laptops, water bottles, and more.',
  350.00,
  'DKD-STICKER-001',
  'active',
  100,
  'Vinyl Sticker Pack - Dekord Merchandise Collection',
  'Get the complete Dekord Vinyl Sticker Pack. 8 waterproof stickers with unique designs. Perfect for personalizing your gear.',
  '/merch-stickers.webp',
  '/merch-stickers-2.webp',
  '/merch-stickers-3.webp',
  '/merch-stickers-4.webp',
  '/merch-stickers-5.webp'
),
(
  'Dekord Essential Tee',
  'dekord-essential-tee',
  'Comfortable cotton t-shirt with minimalist dekord logo. Premium quality and fit. Available in multiple sizes.',
  1500.00,
  'DKD-TEE-001',
  'active',
  30,
  'Dekord Essential Tee - Premium Cotton Merchandise',
  'Shop the Dekord Essential Tee. Comfortable cotton with minimalist logo design. Premium quality and perfect fit.',
  '/merch-tshirt.webp',
  '/merch-tshirt-2.webp',
  '/merch-tshirt-3.webp',
  '/merch-tshirt-4.webp',
  NULL
),
(
  'Dekord Hoodie',
  'dekord-hoodie',
  'Cozy hoodie with dekord branding. Made from premium fleece material. Perfect for casual wear and comfort.',
  2800.00,
  'DKD-HOODIE-001',
  'active',
  25,
  'Dekord Hoodie - Premium Fleece Merchandise',
  'Stay warm with the official Dekord Hoodie. Premium fleece material with comfortable fit and stylish branding.',
  '/merch-hoodie.webp',
  '/merch-hoodie-2.webp',
  '/merch-hoodie-3.webp',
  '/merch-hoodie-4.webp',
  '/merch-hoodie-5.webp'
);

-- Insert features for each merch item
INSERT INTO merch_features (merch_id, feature, sort_order) VALUES
-- Tote Bag Features
((SELECT id FROM merch WHERE slug = 'dekord-canvas-tote'), 'Premium Canvas Material', 1),
((SELECT id FROM merch WHERE slug = 'dekord-canvas-tote'), 'Logo Embroidery', 2),
((SELECT id FROM merch WHERE slug = 'dekord-canvas-tote'), 'Reinforced Handles', 3),
((SELECT id FROM merch WHERE slug = 'dekord-canvas-tote'), 'Spacious Interior', 4),
((SELECT id FROM merch WHERE slug = 'dekord-canvas-tote'), 'Water Resistant', 5),

-- Mug Features
((SELECT id FROM merch WHERE slug = 'copper-accent-mug'), 'Ceramic Body', 1),
((SELECT id FROM merch WHERE slug = 'copper-accent-mug'), 'Copper Accents', 2),
((SELECT id FROM merch WHERE slug = 'copper-accent-mug'), 'Thermal Retention', 3),
((SELECT id FROM merch WHERE slug = 'copper-accent-mug'), 'Dishwasher Safe', 4),
((SELECT id FROM merch WHERE slug = 'copper-accent-mug'), 'Microwave Safe', 5),

-- Sticker Pack Features
((SELECT id FROM merch WHERE slug = 'vinyl-sticker-pack'), '8 Unique Designs', 1),
((SELECT id FROM merch WHERE slug = 'vinyl-sticker-pack'), 'Waterproof Vinyl', 2),
((SELECT id FROM merch WHERE slug = 'vinyl-sticker-pack'), 'Easy Application', 3),
((SELECT id FROM merch WHERE slug = 'vinyl-sticker-pack'), 'Long-lasting', 4),
((SELECT id FROM merch WHERE slug = 'vinyl-sticker-pack'), 'UV Resistant', 5),

-- T-Shirt Features
((SELECT id FROM merch WHERE slug = 'dekord-essential-tee'), '100% Cotton', 1),
((SELECT id FROM merch WHERE slug = 'dekord-essential-tee'), 'Premium Fit', 2),
((SELECT id FROM merch WHERE slug = 'dekord-essential-tee'), 'Screen Printed', 3),
((SELECT id FROM merch WHERE slug = 'dekord-essential-tee'), 'Pre-shrunk', 4),
((SELECT id FROM merch WHERE slug = 'dekord-essential-tee'), 'Tagless Design', 5),

-- Hoodie Features
((SELECT id FROM merch WHERE slug = 'dekord-hoodie'), 'Premium Fleece', 1),
((SELECT id FROM merch WHERE slug = 'dekord-hoodie'), 'Kangaroo Pocket', 2),
((SELECT id FROM merch WHERE slug = 'dekord-hoodie'), 'Ribbed Cuffs', 3),
((SELECT id FROM merch WHERE slug = 'dekord-hoodie'), 'Drawstring Hood', 4),
((SELECT id FROM merch WHERE slug = 'dekord-hoodie'), 'Machine Washable', 5);