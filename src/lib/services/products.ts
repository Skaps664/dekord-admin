import { supabase } from '../supabase/client'
import type { Product, ProductVariant, ProductWithVariants } from '../types/database'

/**
 * Get all products with optional filtering
 */
export async function getProducts(filters?: {
  search?: string
  category?: string
  status?: string
  featured?: boolean
}) {
  let query = supabase
    .from('products')
    .select(`
      *,
      variants:product_variants(*)
    `)
    .order('created_at', { ascending: false })

  // Apply filters
  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }
  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

/**
 * Get a single product by ID
 */
export async function getProduct(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return { data: null, error: error.message }
  }

  return { data: data as ProductWithVariants, error: null }
}

/**
 * Create a new product
 */
export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single()

  if (error) {
    console.error('Error creating product:', error)
    return { data: null, error: error.message }
  }

  return { data: data as Product, error: null }
}

/**
 * Update a product
 */
export async function updateProduct(id: string, updates: Partial<Product>) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating product:', error)
    return { data: null, error: error.message }
  }

  return { data: data as Product, error: null }
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting product:', error)
    return { error: error.message }
  }

  return { error: null }
}

/**
 * Create a product variant
 */
export async function createVariant(variant: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('product_variants')
    .insert(variant)
    .select()
    .single()

  if (error) {
    console.error('Error creating variant:', error)
    return { data: null, error: error.message }
  }

  return { data: data as ProductVariant, error: null }
}

/**
 * Update a variant
 */
export async function updateVariant(id: string, updates: Partial<ProductVariant>) {
  const { data, error } = await supabase
    .from('product_variants')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating variant:', error)
    return { data: null, error: error.message }
  }

  return { data: data as ProductVariant, error: null }
}

/**
 * Delete a variant
 */
export async function deleteVariant(id: string) {
  const { error } = await supabase
    .from('product_variants')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting variant:', error)
    return { error: error.message }
  }

  return { error: null }
}
