import { supabase } from '../supabase/client'
import type { Merch, MerchFeature, MerchWithFeatures } from '../types/database'

/**
 * Get all merch items with optional filtering
 */
export async function getMerch(filters?: {
  search?: string
  status?: string
}) {
  let query = supabase
    .from('merch')
    .select(`
      *,
      features:merch_features(*)
    `)
    .order('created_at', { ascending: false })

  // Apply filters
  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching merch:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

/**
 * Get a single merch item by ID
 */
export async function getMerchItem(id: string) {
  const { data, error } = await supabase
    .from('merch')
    .select('*, features:merch_features(*)')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching merch item:', error)
    return { data: null, error: error.message }
  }

  return { data: data as MerchWithFeatures, error: null }
}

/**
 * Get a single merch item by slug
 */
export async function getMerchBySlug(slug: string) {
  const { data, error } = await supabase
    .from('merch')
    .select('*, features:merch_features(*)')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching merch by slug:', error)
    return { data: null, error: error.message }
  }

  return { data: data as MerchWithFeatures, error: null }
}

/**
 * Create a new merch item
 */
export async function createMerch(merch: Omit<Merch, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('merch')
    .insert(merch)
    .select()
    .single()

  if (error) {
    console.error('Error creating merch:', error)
    return { data: null, error: error.message }
  }

  return { data: data as Merch, error: null }
}

/**
 * Update a merch item
 */
export async function updateMerch(id: string, updates: Partial<Merch>) {
  const { data, error } = await supabase
    .from('merch')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating merch:', error)
    return { data: null, error: error.message }
  }

  return { data: data as Merch, error: null }
}

/**
 * Delete a merch item
 */
export async function deleteMerch(id: string) {
  const { error } = await supabase
    .from('merch')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting merch:', error)
    return { error: error.message }
  }

  return { error: null }
}

/**
 * Create a merch feature
 */
export async function createMerchFeature(feature: Omit<MerchFeature, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('merch_features')
    .insert(feature)
    .select()
    .single()

  if (error) {
    console.error('Error creating merch feature:', error)
    return { data: null, error: error.message }
  }

  return { data: data as MerchFeature, error: null }
}

/**
 * Update a merch feature
 */
export async function updateMerchFeature(id: string, updates: Partial<MerchFeature>) {
  const { data, error } = await supabase
    .from('merch_features')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating merch feature:', error)
    return { data: null, error: error.message }
  }

  return { data: data as MerchFeature, error: null }
}

/**
 * Delete a merch feature
 */
export async function deleteMerchFeature(id: string) {
  const { error } = await supabase
    .from('merch_features')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting merch feature:', error)
    return { error: error.message }
  }

  return { error: null }
}

/**
 * Create a merch item with features
 */
export async function createMerchWithFeatures(
  merch: Omit<Merch, 'id' | 'created_at' | 'updated_at'>,
  features: string[]
) {
  // Start a transaction
  const { data: merchData, error: merchError } = await createMerch(merch)

  if (merchError || !merchData) {
    return { data: null, error: merchError }
  }

  // Create features
  const featurePromises = features.map((feature, index) =>
    createMerchFeature({
      merch_id: merchData.id,
      feature,
      sort_order: index + 1
    })
  )

  const featureResults = await Promise.all(featurePromises)

  // Check if any feature creation failed
  const failedFeature = featureResults.find(result => result.error)
  if (failedFeature) {
    // If features failed, we should ideally rollback the merch creation
    // For now, we'll return the error
    return { data: null, error: failedFeature.error }
  }

  // Return the merch with features
  return getMerchItem(merchData.id)
}

/**
 * Update a merch item with features
 */
export async function updateMerchWithFeatures(
  id: string,
  merch: Partial<Merch>,
  features: string[]
) {
  // Update merch
  const { data: merchData, error: merchError } = await updateMerch(id, merch)

  if (merchError || !merchData) {
    return { data: null, error: merchError }
  }

  // Delete existing features
  const { error: deleteError } = await supabase
    .from('merch_features')
    .delete()
    .eq('merch_id', id)

  if (deleteError) {
    return { data: null, error: deleteError.message }
  }

  // Create new features
  const featurePromises = features.map((feature, index) =>
    createMerchFeature({
      merch_id: id,
      feature,
      sort_order: index + 1
    })
  )

  const featureResults = await Promise.all(featurePromises)

  // Check if any feature creation failed
  const failedFeature = featureResults.find(result => result.error)
  if (failedFeature) {
    return { data: null, error: failedFeature.error }
  }

  // Return the updated merch with features
  return getMerchItem(id)
}