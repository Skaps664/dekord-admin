export interface ProductType {
  id: string
  name: string
  slug: string
  specifications: SpecificationCategory[]
  quick_specs: QuickSpec[]
  showcase_heading: string
  showcase_subheading: string
  showcase_items: ShowcaseItem[]
  comparison_heading: string
  comparison_subheading: string
  comparison_features: string[]
  features_heading: string
  feature_cards: FeatureCard[]
  lookbook_images: LookbookImage[]
  purchase_points: PurchasePoint[]
  created_at: string
  updated_at: string
}

export interface SpecificationCategory {
  category: string
  icon: string
  specs: { label: string; value: string }[]
}

export interface QuickSpec {
  icon: string
  label: string
  value: string
}

export interface ShowcaseItem {
  heading: string
  text: string
  image: string
}

export interface FeatureCard {
  title: string
  body: string
}

export interface LookbookImage {
  src: string
  alt: string
}

export interface PurchasePoint {
  icon: string
  heading: string
  text: string
}

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
  availability: 'in_stock' | 'out_of_stock' | 'coming_soon'
  type_id: string | null
  main_image: string
  hero_image: string | null
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
  banner_image: string | null
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
  courier: string | null
  tracking_number: string | null
  tracking_url: string | null
  customer_notes: string | null
  admin_notes: string | null
  coupon_code: string | null
  customer_confirmed: boolean
  confirmation_query: string | null
  created_at: string
  updated_at: string
  shipped_at: string | null
  delivered_at: string | null
  // --- PostEx integration ---
  /** PostEx's own status wording for this shipment. */
  postex_status?: string | null
  postex_booked_at?: string | null
  postex_last_event_at?: string | null
  /** Why the last booking or sync failed, in plain language. */
  postex_last_error?: string | null
  /** Drives the "Needs attention" tab in the orders list. */
  postex_needs_attention?: boolean | null
  postex_attention_reason?: string | null
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
  current_stock?: number // Current available stock for this item
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

export interface Review {
  id: string
  product_id: string
  order_id: string
  user_id: string
  rating: number
  title: string | null
  comment: string
  images: string[] | null
  verified_purchase: boolean
  helpful_count: number
  created_at: string
  updated_at: string
}

export interface ReviewWithDetails extends Review {
  product?: Product | null
  user?: User | null
  user_profile?: UserProfile | null
}

export interface EmailSubscription {
  id: string
  email: string
  subscribed_at: string
  is_active: boolean
  source: string
  user_id: string | null
  unsubscribed_at: string | null
  created_at: string
  updated_at: string
}

export interface UserWithProfile extends User {
  profile?: UserProfile | null
  order_count?: number
  total_spent?: number
}

export interface Merch {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  sku: string | null
  status: string
  quantity_available: number
  meta_title: string | null
  meta_description: string | null
  image_1: string | null
  image_2: string | null
  image_3: string | null
  image_4: string | null
  image_5: string | null
  created_at: string
  updated_at: string
}

export interface MerchFeature {
  id: string
  merch_id: string
  feature: string
  sort_order: number
  created_at: string
}

export interface MerchWithFeatures extends Merch {
  features: MerchFeature[]
}

export interface JobOpening {
  id: string
  title: string
  department: string
  location: string
  type: 'full-time' | 'part-time' | 'contract' | 'internship'
  description: string
  requirements: string[]
  responsibilities: string[]
  salary_range: string | null
  benefits: string[]
  status: 'active' | 'inactive' | 'closed'
  application_deadline: string | null
  created_at: string
  updated_at: string
}

export interface JobApplication {
  id: string
  job_id: string
  full_name: string
  email: string
  phone: string
  city: string
  qualifications: string
  short_about: string
  resume_url: string | null
  portfolio_url: string | null
  website_url: string | null
  why_consider: string
  most_interesting_thing: string
  fun_moment_story: string
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected'
  applied_at: string
  reviewed_at: string | null
}
