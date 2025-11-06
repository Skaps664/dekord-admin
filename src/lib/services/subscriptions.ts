import { supabase } from '@/lib/supabase/client'
import type { EmailSubscription } from '@/lib/types/database'

/**
 * Get all email subscriptions
 */
export async function getAllSubscriptions() {
  try {
    const { data, error } = await supabase
      .from('email_subscriptions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching subscriptions:', error)
      return { data: null, error: error.message }
    }

    return { data: data as EmailSubscription[], error: null }
  } catch (error: any) {
    console.error('Error in getAllSubscriptions:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Get active subscriptions only
 */
export async function getActiveSubscriptions() {
  try {
    const { data, error } = await supabase
      .from('email_subscriptions')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching active subscriptions:', error)
      return { data: null, error: error.message }
    }

    return { data: data as EmailSubscription[], error: null }
  } catch (error: any) {
    console.error('Error in getActiveSubscriptions:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Delete a subscription
 */
export async function deleteSubscription(id: string) {
  try {
    const { error } = await supabase
      .from('email_subscriptions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting subscription:', error)
      return { error: error.message }
    }

    return { error: null }
  } catch (error: any) {
    console.error('Error in deleteSubscription:', error)
    return { error: error.message }
  }
}

/**
 * Toggle subscription active status
 */
export async function toggleSubscriptionStatus(id: string, isActive: boolean) {
  try {
    const { error } = await supabase
      .from('email_subscriptions')
      .update({
        is_active: isActive,
        unsubscribed_at: isActive ? null : new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Error toggling subscription status:', error)
      return { error: error.message }
    }

    return { error: null }
  } catch (error: any) {
    console.error('Error in toggleSubscriptionStatus:', error)
    return { error: error.message }
  }
}

/**
 * Get subscription statistics
 */
export async function getSubscriptionStats() {
  try {
    // Get all subscriptions
    const { data: all, error: allError } = await supabase
      .from('email_subscriptions')
      .select('id, is_active, created_at, source')

    if (allError) {
      console.error('Error getting subscription stats:', allError)
      return { data: null, error: allError.message }
    }

    const totalSubscriptions = all?.length || 0
    const activeSubscriptions = all?.filter(s => s.is_active).length || 0
    const inactiveSubscriptions = totalSubscriptions - activeSubscriptions

    // Get subscriptions by source
    const sourceCount: Record<string, number> = {}
    all?.forEach(sub => {
      sourceCount[sub.source] = (sourceCount[sub.source] || 0) + 1
    })

    // Get recent subscriptions (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentSubscriptions = all?.filter(
      s => new Date(s.created_at) >= sevenDaysAgo
    ).length || 0

    return {
      data: {
        totalSubscriptions,
        activeSubscriptions,
        inactiveSubscriptions,
        recentSubscriptions,
        sourceCount
      },
      error: null
    }
  } catch (error: any) {
    console.error('Error in getSubscriptionStats:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Export subscriptions as CSV data
 */
export async function exportSubscriptions(activeOnly: boolean = false) {
  try {
    let query = supabase
      .from('email_subscriptions')
      .select('*')
      .order('created_at', { ascending: false })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error exporting subscriptions:', error)
      return { data: null, error: error.message }
    }

    return { data: data as EmailSubscription[], error: null }
  } catch (error: any) {
    console.error('Error in exportSubscriptions:', error)
    return { data: null, error: error.message }
  }
}
