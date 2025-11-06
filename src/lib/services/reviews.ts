import { supabase } from '@/lib/supabase/client'
import type { Review, ReviewWithDetails } from '@/lib/types/database'

/**
 * Get all reviews with product and user details
 */
export async function getAllReviews() {
  try {
    // First, get all reviews with products
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        product:products(id, name, slug, main_image)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reviews:', error)
      return { data: null, error: error.message }
    }

    if (!reviews || reviews.length === 0) {
      return { data: [], error: null }
    }

    // Get unique user IDs
    const userIds = [...new Set(reviews.map(r => r.user_id))]

    // Fetch user profiles for all user IDs
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, full_name')
      .in('id', userIds)

    // Create a map of user profiles
    const profileMap = new Map(
      profiles?.map(p => [p.id, p]) || []
    )

    // Combine the data
    const reviewsWithDetails = reviews.map(review => ({
      ...review,
      user_profile: profileMap.get(review.user_id) || null
    }))

    return { data: reviewsWithDetails as ReviewWithDetails[], error: null }
  } catch (error: any) {
    console.error('Error in getAllReviews:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Get reviews for a specific product
 */
export async function getProductReviews(productId: string) {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching product reviews:', error)
      return { data: null, error: error.message }
    }

    if (!reviews || reviews.length === 0) {
      return { data: [], error: null }
    }

    // Get unique user IDs
    const userIds = [...new Set(reviews.map(r => r.user_id))]

    // Fetch user profiles
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, full_name')
      .in('id', userIds)

    // Create a map of user profiles
    const profileMap = new Map(
      profiles?.map(p => [p.id, p]) || []
    )

    // Combine the data
    const reviewsWithDetails = reviews.map(review => ({
      ...review,
      user_profile: profileMap.get(review.user_id) || null
    }))

    return { data: reviewsWithDetails as ReviewWithDetails[], error: null }
  } catch (error: any) {
    console.error('Error in getProductReviews:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Get reviews by a specific user
 */
export async function getUserReviews(userId: string) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        product:products(id, name, slug, main_image)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user reviews:', error)
      return { data: null, error: error.message }
    }

    return { data: data as ReviewWithDetails[], error: null }
  } catch (error: any) {
    console.error('Error in getUserReviews:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: string) {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)

    if (error) {
      console.error('Error deleting review:', error)
      return { error: error.message }
    }

    return { error: null }
  } catch (error: any) {
    console.error('Error in deleteReview:', error)
    return { error: error.message }
  }
}

/**
 * Get review statistics
 */
export async function getReviewStats() {
  try {
    // Get all reviews for calculations
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('rating')

    if (reviewsError) {
      console.error('Error getting reviews for stats:', reviewsError)
      return { data: null, error: reviewsError.message }
    }

    const totalReviews = reviews?.length || 0
    
    // Calculate average rating
    let averageRating = 0
    if (reviews && reviews.length > 0) {
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
      averageRating = Math.round((sum / reviews.length) * 10) / 10 // Round to 1 decimal
    }

    // Calculate rating distribution
    const ratingDistribution = [0, 0, 0, 0, 0] // Index 0 = 1 star, Index 4 = 5 stars
    reviews?.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingDistribution[review.rating - 1]++
      }
    })

    return {
      data: {
        totalReviews,
        averageRating,
        ratingDistribution
      },
      error: null
    }
  } catch (error: any) {
    console.error('Error in getReviewStats:', error)
    return { data: null, error: error.message }
  }
}
