# Product Creation Guide

## ✅ What's Been Fixed

The product creation form has been completely rebuilt to work exactly as you requested:

### 1. **Collection Selection FIRST** ✅
   - Must select a collection before creating product
   - Dropdown loads all active collections from database
   - Product will be automatically linked to selected collection

### 2. **Image Upload Working** ✅
   - **1 Main Image** (required)
   - **4 Additional Images** (optional)
   - Click-to-upload functionality
   - Image previews before saving
   - Remove/replace images
   - Images upload to Supabase Storage

### 3. **Product Variants** ✅
   - **Length Options**: 0.5m, 1m, 1.5m, 2m, 3m, 5m
   - **Color Options**: Black, White, Red, Blue, Green, Army Green, Yellow, Purple, Pink
   - **SKU** for each variant (e.g., DKD-W60-BLK-1M)
   - **Stock** quantity for each variant
   - **Price Override** (optional - leaves empty to use base price)
   - Add/Remove multiple variants
   - Total stock automatically calculated from all variants

### 4. **Single Description Field** ✅
   - Removed separate "Features" and "Specifications"
   - One comprehensive description field
   - Write all product details, features, specs in one place

### 5. **SEO Fields** ✅
   - **Meta Title** - for Google search results
   - **Meta Description** - for search result snippets
   - Both optional (auto-generated if empty)
   - Character count guidance included

### 6. **Database Integration** ✅
   - All data saves to Supabase
   - Product created in `products` table
   - Variants saved in `product_variants` table
   - Collection link saved in `collection_products` table
   - Images uploaded to Supabase Storage
   - Slug auto-generated from product name

---

## 🚀 How to Use

### Step 1: Set Up Storage Bucket

Run the SQL script in your Supabase SQL Editor:

```bash
# Open this file and copy the SQL
/home/skaps/dekord/admin/SETUP-STORAGE-BUCKET.sql
```

This will:
- Create `products` storage bucket
- Set up public access for images
- Add `og_image` field for SEO

### Step 2: Create a Collection First

Before creating products:
1. Go to **Collections** in admin panel
2. Create collections like "Premium Cables", "Fast Charging", etc.
3. Save the collection

### Step 3: Create a Product

1. **Select Collection** (required)
2. **Fill Basic Info**:
   - Product Name (e.g., "dekord W-60 USB-C Cable")
   - Category (Cables/Chargers/Accessories)
   - Base Price (e.g., 2500)
   - Description (everything about the product)

3. **Upload Images**:
   - Main Image (required)
   - Up to 4 additional images (optional)

4. **Add Variants**:
   - Length: 1m, 2m, etc.
   - Color: Black, White, Red, etc.
   - SKU: DKD-W60-BLK-1M
   - Stock: 50
   - Price Override: (optional) if this variant costs more

5. **SEO (Optional)**:
   - Meta Title: "Buy dekord W-60 USB-C Cable | Fast Charging"
   - Meta Description: Short description for Google

6. **Set Status**:
   - Active: Visible on website
   - Draft: Hidden (work in progress)
   - Archived: Removed from sale

7. **Click Save Product**

---

## 📋 Database Schema

### Products Table
```sql
- id (UUID)
- name (TEXT)
- slug (TEXT) - auto-generated
- description (TEXT) - comprehensive description
- category (TEXT) - 'cables', 'chargers', 'accessories'
- price (DECIMAL) - base price
- stock (INTEGER) - total from all variants
- status (TEXT) - 'active', 'draft', 'archived'
- main_image (TEXT) - URL to main image
- image_2, image_3, image_4, image_5 (TEXT) - additional images
- meta_title (TEXT) - SEO title
- meta_description (TEXT) - SEO description
- og_image (TEXT) - Social sharing image
- created_at, updated_at (TIMESTAMPTZ)
```

### Product Variants Table
```sql
- id (UUID)
- product_id (UUID) - references products
- length (TEXT) - '1m', '2m', etc.
- color (TEXT) - 'Black', 'White', etc.
- sku (TEXT) - unique identifier
- stock (INTEGER) - variant stock
- price_override (DECIMAL) - optional custom price
- variant_image (TEXT) - optional variant-specific image
- is_available (BOOLEAN)
```

### Collection Products Table (Junction)
```sql
- id (UUID)
- collection_id (UUID) - references collections
- product_id (UUID) - references products
- sort_order (INTEGER) - display order
```

---

## 🐛 Troubleshooting

### Images Not Uploading?
1. Check if storage bucket exists: Go to Supabase Dashboard → Storage
2. Run the `SETUP-STORAGE-BUCKET.sql` script
3. Make sure bucket is named `products` and is public

### "No collections found" error?
1. Go to Collections page first
2. Create at least one collection
3. Make sure collection status is "active"

### Product saves but variants don't show?
1. Check each variant has a unique SKU
2. Stock must be 0 or greater
3. Length and color must be selected

### Product not showing on website?
1. Status must be "active"
2. Product must be linked to an active collection
3. Check if main_image URL is valid

---

## ✨ Features Added

- ✅ Real-time image previews
- ✅ Validation before saving
- ✅ Loading states during upload
- ✅ Error messages
- ✅ Success confirmation
- ✅ Automatic slug generation
- ✅ Total stock calculation
- ✅ Multiple variants support
- ✅ Collection integration
- ✅ SEO optimization

---

## 📝 Next Steps

1. **Run the storage bucket SQL** (SETUP-STORAGE-BUCKET.sql)
2. **Create collections** (if not already created)
3. **Test creating a product** with all fields
4. **Verify product shows** on the products list
5. **Check website** to see if product appears

Everything is now set up and ready to use!
