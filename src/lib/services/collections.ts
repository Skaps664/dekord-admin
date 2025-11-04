import { supabase } from '@/lib/supabase/client'
import { Collection } from '@/lib/types/database'

/**
 * Get all collections with product count
 */
export async function getCollections(filters?: {
  search?: string
  status?: string
}) {
  let query = supabase
    .from('collections')
    .select(`
      *,
      collection_products(count)
    `)
    .order('created_at', { ascending: false })

  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching collections:', error)
    return { data: null, error: error.message }
  }

  // Transform data to include product count
  const collectionsWithCount = data?.map((col: any) => ({
    ...col,
    product_count: col.collection_products?.[0]?.count || 0
  }))

  return { data: collectionsWithCount, error: null }
}

/**
 * Get a single collection by ID
 */
export async function getCollection(id: string) {
  const { data, error } = await supabase
    .from('collections')
    .select(`
      *,
      collection_products(
        product_id,
        products(*)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching collection:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

/**
 * Create a new collection
 */
export async function createCollection(collection: Omit<Collection, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('collections')
    .insert(collection)
    .select()
    .single()

  if (error) {
    console.error('Error creating collection:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

/**
 * Update a collection
 */
export async function updateCollection(id: string, updates: Partial<Omit<Collection, 'id' | 'created_at' | 'updated_at'>>) {
  const { data, error } = await supabase
    .from('collections')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating collection:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

/**
 * Delete a collection
 */
export async function deleteCollection(id: string) {
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting collection:', error)
    return { error: error.message }
  }

  return { error: null }
}
