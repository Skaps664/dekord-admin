import { supabase } from '../supabase/client'
import { User, UserProfile, UserWithProfile } from '../types/database'

interface GetUsersFilters {
  search?: string
}

/**
 * Get all users with their profiles and order statistics
 */
export async function getUsers(filters: GetUsersFilters = {}) {
  try {
    // Use RPC function to get users with profiles
    const { data: users, error: usersError } = await supabase
      .rpc('get_users_with_profiles')

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return { data: null, error: usersError.message }
    }

    if (!users || users.length === 0) {
      return { data: [], error: null }
    }

    // Apply search filter if provided
    let filteredUsers = users
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filteredUsers = users.filter((user: any) => 
        user.email?.toLowerCase().includes(searchLower) ||
        user.full_name?.toLowerCase().includes(searchLower)
      )
    }

    // Transform data to match UserWithProfile interface
    const usersWithProfiles: UserWithProfile[] = filteredUsers.map((user: any) => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      profile: user.full_name || user.phone || user.city ? {
        id: user.id,
        full_name: user.full_name,
        phone: user.phone,
        address_line1: null,
        address_line2: null,
        city: user.city,
        province: user.province,
        postal_code: null,
        marketing_emails: true,
        created_at: user.created_at,
        updated_at: user.created_at
      } : null,
      order_count: Number(user.order_count) || 0,
      total_spent: Number(user.total_spent) || 0
    }))

    return { data: usersWithProfiles, error: null }
  } catch (error) {
    console.error('Error in getUsers:', error)
    return { data: null, error: String(error) }
  }
}

/**
 * Get a single user by ID with profile and order statistics
 */
export async function getUser(userId: string) {
  try {
    // Use RPC function to get user with profile
    const { data: users, error: userError } = await supabase
      .rpc('get_user_with_profile', { user_id: userId })

    if (userError) {
      console.error('Error fetching user:', userError)
      return { data: null, error: userError.message }
    }

    if (!users || users.length === 0) {
      return { data: null, error: 'User not found' }
    }

    const userData = users[0]

    // Transform data to match UserWithProfile interface
    const userWithProfile: UserWithProfile = {
      id: userData.id,
      email: userData.email,
      created_at: userData.created_at,
      profile: userData.full_name || userData.phone ? {
        id: userData.id,
        full_name: userData.full_name,
        phone: userData.phone,
        address_line1: userData.address_line1,
        address_line2: userData.address_line2,
        city: userData.city,
        province: userData.province,
        postal_code: userData.postal_code,
        marketing_emails: userData.marketing_emails || true,
        created_at: userData.created_at,
        updated_at: userData.created_at
      } : null,
      order_count: Number(userData.order_count) || 0,
      total_spent: Number(userData.total_spent) || 0
    }

    return { data: userWithProfile, error: null }
  } catch (error) {
    console.error('Error in getUser:', error)
    return { data: null, error: String(error) }
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, profileData: Partial<UserProfile>) {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating profile:', error)
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    console.error('Error in updateUserProfile:', error)
    return { error: String(error) }
  }
}

/**
 * Delete a user (admin only)
 */
export async function deleteUser(userId: string) {
  try {
    // Note: This requires service role key to delete auth users
    // For now, we'll just delete the profile
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId)

    if (error) {
      console.error('Error deleting user:', error)
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    console.error('Error in deleteUser:', error)
    return { error: String(error) }
  }
}
