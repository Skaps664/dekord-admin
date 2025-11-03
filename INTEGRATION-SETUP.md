# Integration Setup Guide

Complete guide for setting up all integrations in the dekord Admin Panel.

---

## 🔷 Facebook & Instagram Integration

### 1. Facebook Pixel Setup

**Purpose**: Track conversions, retarget customers, and measure ad performance.

**Steps**:
1. Go to [Facebook Business Manager](https://business.facebook.com)
2. Navigate to **Events Manager** → **Connect Data Sources** → **Web** → **Facebook Pixel**
3. Copy your **Pixel ID** (e.g., `1234567890`)
4. In dekord admin:
   - Go to **Integrations** → **Facebook Pixel** → **Connect**
   - Paste your Pixel ID
   - Click **Save**
5. Add to website (in `/website/app/layout.tsx`):
```tsx
<Script id="facebook-pixel" strategy="afterInteractive">
  {`
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', 'YOUR_PIXEL_ID');
    fbq('track', 'PageView');
  `}
</Script>
```

### 2. Meta Business Suite Setup

**Purpose**: Manage Facebook & Instagram ads, posts, and insights.

**Steps**:
1. Go to [Meta Business Suite](https://business.facebook.com)
2. Create a Business Account if you don't have one
3. Connect your Facebook Page and Instagram Account
4. Go to **Business Settings** → **Data Sources** → **Pixels**
5. Link your Pixel to your ad account
6. In dekord admin:
   - Go to **Integrations** → **Meta Business Suite** → **Connect**
   - Click **Authorize with Facebook**
   - Grant required permissions

**Required Permissions**:
- `business_management`
- `ads_management`
- `pages_read_engagement`
- `instagram_basic`

---

## 🔴 Google Integrations

### 1. Google Account Connection

**Purpose**: Enable all Google services (Merchant Center, Search Console, Business Profile).

**Steps**:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project: **dekord-admin**
3. Enable APIs:
   - Google Content API for Shopping
   - Google My Business API
   - Search Console API
   - Google Analytics Data API
4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: `https://yourdomain.com/api/auth/google/callback`
5. Copy **Client ID** and **Client Secret**
6. In dekord admin:
   - Go to **Integrations** → **Google Account** → **Connect**
   - Enter credentials
   - Authorize access

### 2. Google Merchant Center

**Purpose**: Sync products to Google Shopping.

**Steps**:
1. Go to [Google Merchant Center](https://merchants.google.com)
2. Create an account and verify website ownership
3. Set up shipping and tax settings
4. Go to **Products** → **Feeds** → **Create Feed**
5. Choose **Content API** as feed method
6. In dekord admin:
   - Go to **Integrations** → **Google Merchant Center** → **Configure**
   - Enter your Merchant ID
   - Enable automatic product sync
7. Create product feed in Supabase:
```sql
-- Create function to generate product feed
CREATE OR REPLACE FUNCTION generate_google_product_feed()
RETURNS TABLE (
  id text,
  title text,
  description text,
  link text,
  image_link text,
  price text,
  availability text,
  brand text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.sku,
    p.name,
    p.description,
    'https://dekord.online/product/' || p.slug,
    p.images->>0,
    p.price::text || ' PKR',
    CASE WHEN p.stock > 0 THEN 'in stock' ELSE 'out of stock' END,
    'dekord'
  FROM products p
  WHERE p.status = 'active';
END;
$$ LANGUAGE plpgsql;
```

### 3. Google Search Console

**Purpose**: Monitor website performance in Google Search.

**Steps**:
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your website: `https://dekord.online`
3. Verify ownership (use DNS or HTML file method)
4. Submit sitemap: `https://dekord.online/sitemap.xml`
5. In dekord admin:
   - Go to **Integrations** → **Google Search Console** → **Connect**
   - Authorize with Google
   - Select your property

### 4. Google Business Profile

**Purpose**: Manage your business listing on Google Maps and Search.

**Steps**:
1. Go to [Google Business Profile](https://business.google.com)
2. Create or claim your business listing
3. Verify your business (postcard, phone, or email)
4. Complete your profile:
   - Add photos
   - Set business hours
   - Add product categories
5. In dekord admin:
   - Go to **Integrations** → **Google Business Profile** → **Connect**
   - Authorize access
   - Link your business profile

---

## 📧 Email Service Integration

### Option 1: SendGrid (Recommended)

**Purpose**: Send transactional and marketing emails.

**Steps**:
1. Sign up at [SendGrid](https://sendgrid.com)
2. Create an API Key:
   - Go to **Settings** → **API Keys** → **Create API Key**
   - Name: `dekord-admin`
   - Permissions: **Full Access**
3. Copy the API Key
4. In dekord admin:
   - Go to **Integrations** → **Email Service Provider** → **Connect**
   - Select **SendGrid**
   - Enter API Key
5. Add to `.env.local`:
```env
SENDGRID_API_KEY=your_api_key
SENDGRID_FROM_EMAIL=orders@dekord.online
SENDGRID_FROM_NAME=dekord
```
6. Create email templates in SendGrid:
   - Order Confirmation
   - Order Shipped
   - Order Cancelled
   - Abandoned Cart
   - Welcome Email

### Option 2: Mailgun

**Steps**:
1. Sign up at [Mailgun](https://mailgun.com)
2. Add your domain and verify DNS records
3. Get API Key from **Settings** → **API Keys**
4. Add to `.env.local`:
```env
MAILGUN_API_KEY=your_api_key
MAILGUN_DOMAIN=mg.dekord.online
```

---

## 💾 Supabase Setup

### 1. Create Supabase Project

**Steps**:
1. Go to [Supabase](https://supabase.com)
2. Create new project:
   - Name: `dekord-ecommerce`
   - Database Password: (save securely)
   - Region: Singapore (closest to Pakistan)
3. Copy project credentials:
   - Project URL
   - Anon (public) key
   - Service role key

### 2. Environment Variables

Add to `/admin/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Add to `/website/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Database Schema

Run in Supabase SQL Editor:

```sql
-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  compare_price DECIMAL(10, 2),
  sku TEXT UNIQUE NOT NULL,
  stock INTEGER DEFAULT 0,
  images JSONB DEFAULT '[]',
  features JSONB DEFAULT '[]',
  specifications JSONB DEFAULT '{}',
  category TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived', 'out_of_stock')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collections table
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collection products (many-to-many)
CREATE TABLE collection_products (
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  PRIMARY KEY (collection_id, product_id)
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  shipping_address JSONB NOT NULL,
  tracking_number TEXT,
  payment_method TEXT DEFAULT 'cod',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discounts table
CREATE TABLE discounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  type TEXT CHECK (type IN ('percentage', 'fixed')),
  value DECIMAL(10, 2) NOT NULL,
  description TEXT,
  min_order DECIMAL(10, 2),
  max_discount DECIMAL(10, 2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author TEXT,
  category TEXT,
  featured_image TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  meta_description TEXT,
  views INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users/Customers table (extends auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email automations table
CREATE TABLE email_automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  trigger TEXT NOT NULL,
  subject TEXT NOT NULL,
  template TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  sent_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email campaigns table
CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  recipients_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart abandonment tracking
CREATE TABLE abandoned_carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  email TEXT,
  items JSONB NOT NULL,
  total DECIMAL(10, 2),
  recovered BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public products access" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Public collections access" ON collections FOR SELECT USING (status = 'active');
CREATE POLICY "Public blog posts access" ON blog_posts FOR SELECT USING (status = 'published');

-- User can view their own orders
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);

-- Admin full access (you'll need to set up admin role)
CREATE POLICY "Admin full access products" ON products FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin full access orders" ON orders FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

### 4. Storage Buckets

Create storage buckets for images:

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('products', 'products', true),
  ('collections', 'collections', true),
  ('blog', 'blog', true);

-- Set up storage policies
CREATE POLICY "Public product images access" ON storage.objects 
  FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Admin can upload product images" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'products' AND auth.jwt() ->> 'role' = 'admin');
```

---

## 🎯 Next Steps

1. **Test all integrations** in development mode
2. **Set up webhooks** for real-time updates (Supabase, Stripe, etc.)
3. **Configure email templates** with your branding
4. **Test order flow** end-to-end
5. **Set up monitoring** (Sentry, LogRocket)
6. **Deploy to production**

---

## 📞 Support

Need help? Contact:
- Email: support@dekord.online
- WhatsApp: +92 339 0166442

---

**Last Updated**: November 4, 2025
