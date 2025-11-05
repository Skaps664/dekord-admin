export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  category: string
  price: number
  stock: number
  sku: string | null
  status: string
  main_image: string
  image_2: string | null
  image_3: string | null
  image_4: string | null
  image_5: string | null
  meta_title: string | null
  meta_description: string | null
  og_image: string | null
  created_at: string
  updated_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  length: string | null
  color: string | null
  sku: string
  price_override: number | null
  stock: number
  variant_image: string | null
  is_available: boolean
  is_default: boolean
  created_at: string
}

export interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  status: string
  sort_order: number
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string | null
  user_email: string | null  // ADD THIS LINE
  status: string
  payment_method: string
  subtotal: number
  shipping_fee: number
  discount_amount: number
  total: number
  shipping_name: string
  shipping_phone: string
  shipping_address: string
  shipping_city: string
  shipping_province: string
  shipping_postal_code: string | null
  tracking_number: string | null
  tracking_url: string | null
  customer_notes: string | null
  admin_notes: string | null
  coupon_code: string | null
  created_at: string
  updated_at: string
  shipped_at: string | null
  delivered_at: string | null
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  variant_id: string | null
  product_name: string
  variant_details: string | null
  sku: string | null
  unit_price: number
  quantity: number
  total_price: number
  created_at: string
}

export interface User {
  id: string
  email: string
  created_at: string
}

export interface UserProfile {
  id: string
  full_name: string | null
  phone: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  province: string | null
  postal_code: string | null
  marketing_emails: boolean
  created_at: string
  updated_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  featured_image: string | null
  featured_image_alt: string | null
  author_id: string | null
  author_name: string | null
  meta_title: string | null
  meta_description: string | null
  og_image: string | null
  category: string | null
  tags: string[] | null
  status: string
  published_at: string | null
  view_count: number
  like_count: number
  featured: boolean
  sort_order: number
  read_time_minutes: number | null
  created_at: string
  updated_at: string
}

// Extended types with relations
export interface ProductWithVariants extends Product {
  variants: ProductVariant[]
}

export interface OrderWithDetails extends Order {
  order_items: OrderItem[]
  user?: User | null
}

export interface UserWithProfile extends User {
  profile?: UserProfile | null
  order_count?: number
  total_spent?: number
}
