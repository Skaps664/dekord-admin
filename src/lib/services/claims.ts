import { supabase } from '@/lib/supabase/client'

export interface Claim {
  id: string
  claim_number: string
  name: string
  email: string
  whatsapp_number: string
  city: string
  order_number: string
  claim_type: string
  message: string
  images: string[] | null
  status: string
  priority: string
  admin_notes: string | null
  resolution_notes: string | null
  assigned_to: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
  user_agent: string | null
  ip_address: string | null
}

interface GetClaimsFilters {
  status?: string
  claimType?: string
  search?: string
  priority?: string
}

export async function getClaims(filters?: GetClaimsFilters) {
  try {
    let query = supabase
      .from('claims')
      .select('*')
      .order('created_at', { ascending: false })

    // Filter by status
    if (filters?.status && filters.status !== 'All') {
      query = query.eq('status', filters.status)
    }

    // Filter by claim type
    if (filters?.claimType && filters.claimType !== 'All') {
      query = query.eq('claim_type', filters.claimType)
    }

    // Filter by priority
    if (filters?.priority && filters.priority !== 'All') {
      query = query.eq('priority', filters.priority)
    }

    // Search by claim number, customer name, email, or order number
    if (filters?.search) {
      query = query.or(`claim_number.ilike.%${filters.search}%,name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,order_number.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching claims:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error fetching claims:', error)
    return { data: null, error: 'Failed to fetch claims' }
  }
}

export async function getClaim(id: string) {
  try {
    const { data, error } = await supabase
      .from('claims')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching claim:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error fetching claim:', error)
    return { data: null, error: 'Failed to fetch claim' }
  }
}

export async function updateClaimStatus(
  claimId: string,
  status: string,
  updates?: {
    admin_notes?: string
    resolution_notes?: string
    assigned_to?: string
    priority?: string
  }
) {
  try {
    const updateData: any = {
      status,
      ...updates
    }

    // Set resolved_at when status changes to resolved
    if (status === 'resolved' && !updates?.resolution_notes) {
      updateData.resolved_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('claims')
      .update(updateData)
      .eq('id', claimId)
      .select()

    if (error) {
      console.error('Error updating claim status:', error)
      return { error: error.message }
    }

    // Check if any rows were actually updated
    if (!data || data.length === 0) {
      console.error('No rows updated - likely RLS policy blocking UPDATE')
      return { error: 'Update blocked by database policy. Did you run fix-all-claims-policies.sql?' }
    }

    return { error: null }
  } catch (error) {
    console.error('Unexpected error updating claim:', error)
    return { error: 'Failed to update claim' }
  }
}

export async function updateClaimNotes(
  claimId: string,
  adminNotes: string,
  resolutionNotes?: string
) {
  try {
    const updateData: any = {
      admin_notes: adminNotes
    }

    if (resolutionNotes !== undefined) {
      updateData.resolution_notes = resolutionNotes
    }

    const { error } = await supabase
      .from('claims')
      .update(updateData)
      .eq('id', claimId)

    if (error) {
      console.error('Error updating claim notes:', error)
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    console.error('Unexpected error updating claim notes:', error)
    return { error: 'Failed to update claim notes' }
  }
}

export async function updateClaimPriority(claimId: string, priority: string) {
  try {
    const { error } = await supabase
      .from('claims')
      .update({ priority })
      .eq('id', claimId)

    if (error) {
      console.error('Error updating claim priority:', error)
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    console.error('Unexpected error updating claim priority:', error)
    return { error: 'Failed to update claim priority' }
  }
}

export async function assignClaim(claimId: string, assignedTo: string) {
  try {
    const { error } = await supabase
      .from('claims')
      .update({ assigned_to: assignedTo })
      .eq('id', claimId)

    if (error) {
      console.error('Error assigning claim:', error)
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    console.error('Unexpected error assigning claim:', error)
    return { error: 'Failed to assign claim' }
  }
}

export async function deleteClaim(claimId: string) {
  try {
    const { error } = await supabase
      .from('claims')
      .delete()
      .eq('id', claimId)

    if (error) {
      console.error('Error deleting claim:', error)
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    console.error('Unexpected error deleting claim:', error)
    return { error: 'Failed to delete claim' }
  }
}

// Get claim statistics
export async function getClaimStats() {
  try {
    const { data, error } = await supabase
      .from('claims')
      .select('status, claim_type, priority')

    if (error) {
      console.error('Error fetching claim stats:', error)
      return { data: null, error: error.message }
    }

    const stats = {
      total: data.length,
      byStatus: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>
    }

    data.forEach(claim => {
      // Count by status
      stats.byStatus[claim.status] = (stats.byStatus[claim.status] || 0) + 1
      
      // Count by type
      stats.byType[claim.claim_type] = (stats.byType[claim.claim_type] || 0) + 1
      
      // Count by priority
      stats.byPriority[claim.priority] = (stats.byPriority[claim.priority] || 0) + 1
    })

    return { data: stats, error: null }
  } catch (error) {
    console.error('Unexpected error fetching claim stats:', error)
    return { data: null, error: 'Failed to fetch claim statistics' }
  }
}
