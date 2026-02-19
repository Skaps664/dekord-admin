import { supabase } from '../supabase/client'
import type { ProductType } from '../types/database'

/**
 * Get all product types
 */
export async function getProductTypes() {
  const { data, error } = await supabase
    .from('product_types')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching product types:', error)
    return { data: null, error: error.message }
  }

  return { data: data as ProductType[], error: null }
}

/**
 * Get a single product type by ID
 */
export async function getProductType(id: string) {
  const { data, error } = await supabase
    .from('product_types')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching product type:', error)
    return { data: null, error: error.message }
  }

  return { data: data as ProductType, error: null }
}

/**
 * Create a new product type
 */
export async function createProductType(productType: Omit<ProductType, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('product_types')
    .insert(productType)
    .select()
    .single()

  if (error) {
    console.error('Error creating product type:', error)
    return { data: null, error: error.message }
  }

  return { data: data as ProductType, error: null }
}

/**
 * Update a product type
 */
export async function updateProductType(id: string, updates: Partial<ProductType>) {
  const { data, error } = await supabase
    .from('product_types')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating product type:', error)
    return { data: null, error: error.message }
  }

  return { data: data as ProductType, error: null }
}

/**
 * Delete a product type
 */
export async function deleteProductType(id: string) {
  const { error } = await supabase
    .from('product_types')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting product type:', error)
    return { error: error.message }
  }

  return { error: null }
}
