# dekord Admin Panel

Internal admin dashboard for managing the dekord e-commerce store.

## Features

### 📊 Dashboard
- Overview statistics (revenue, orders, products, users)
- Recent orders table
- Quick action cards to all sections

### 📦 Products
- Product listing with search and filters
- Add/edit products with:
  - Basic info (name, SKU, category, description)
  - Pricing and inventory
  - Features and specifications
  - Image upload
  - Status management

### 🛍️ Orders
- Order list with customer details
- Shipping information
- Order status tracking (Pending → Processing → Shipped → Delivered)
- Filter by status
- View and update orders

### ✍️ Blog
- Blog post management
- Create/edit posts with:
  - Markdown support
  - Featured images
  - Categories and tags
  - SEO settings
  - Publish/draft status

### 📈 Analytics
- Page views and unique visitors
- Conversion rates
- Traffic sources
- Top pages and products
- Time period filters

### 👥 Users
- User list with contact information
- Order history per user
- Total spent tracking
- User status management

### ⚙️ Settings
- General site settings (name, tagline, description)
- Logo and favicon upload
- Contact information (email, phone, WhatsApp, address)
- Social media links (Facebook, Instagram, LinkedIn)
- Shipping settings (fee, free threshold, delivery time)
- Business information (company name, CEO, GST, NTN)

## Tech Stack

- **Framework:** Next.js 16.0.1 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Package Manager:** pnpm

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Run the development server:
```bash
pnpm dev
```

3. Open [http://localhost:3001](http://localhost:3001)

## Port Configuration

The admin panel runs on port 3001 by default. This is configured in package.json.
