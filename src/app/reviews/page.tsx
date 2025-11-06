"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { 
  Star,
  Search, 
  Filter,
  Trash2,
  Eye,
  ExternalLink,
  Loader2,
  StarHalf,
  TrendingUp,
  MessageSquare,
  CheckCircle,
  User
} from "lucide-react"
import { getAllReviews, deleteReview, getReviewStats } from "@/lib/services/reviews"
import type { ReviewWithDetails } from "@/lib/types/database"

export default function ReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [stats, setStats] = useState<{
    totalReviews: number
    averageRating: number
    ratingDistribution: number[]
  } | null>(null)

  useEffect(() => {
    loadReviews()
    loadStats()
  }, [])

  async function loadReviews() {
    setLoading(true)
    const { data, error } = await getAllReviews()
    
    if (error) {
      console.error('Failed to load reviews:', error)
      alert('Failed to load reviews')
    } else if (data) {
      setReviews(data)
    }
    
    setLoading(false)
  }

  async function loadStats() {
    const { data, error } = await getReviewStats()
    
    if (error) {
      console.error('Failed to load stats:', error)
    } else if (data) {
      setStats(data)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this review?')) {
      return
    }

    const { error } = await deleteReview(id)
    
    if (error) {
      alert('Failed to delete review: ' + error)
    } else {
      alert('Review deleted successfully')
      loadReviews()
      loadStats()
    }
  }

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = searchQuery === "" || 
      review.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (review.product as any)?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (review.user_profile as any)?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRating = filterRating === null || review.rating === filterRating

    return matchesSearch && matchesRating
  })

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-neutral-300"
            }`}
          />
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Reviews & Ratings</h1>
              <p className="text-sm text-neutral-600">Manage customer feedback and ratings</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-border p-6"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Total Reviews</p>
                  <p className="text-2xl font-bold text-neutral-900">{stats.totalReviews}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-border p-6"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-600 fill-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Average Rating</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-border p-6"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600">5 Star Reviews</p>
                  <p className="text-2xl font-bold text-neutral-900">{stats.ratingDistribution[4]}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search reviews by product, user, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterRating(null)}
                className={`px-4 py-2 border rounded-lg transition-colors ${
                  filterRating === null
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "border-border hover:bg-neutral-50"
                }`}
              >
                All
              </button>
              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setFilterRating(rating)}
                  className={`px-4 py-2 border rounded-lg transition-colors flex items-center gap-1 ${
                    filterRating === rating
                      ? "bg-neutral-900 text-white border-neutral-900"
                      : "border-border hover:bg-neutral-50"
                  }`}
                >
                  {rating}
                  <Star className={`w-4 h-4 ${filterRating === rating ? 'fill-white' : 'fill-yellow-400 text-yellow-400'}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <MessageSquare className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No reviews found</h3>
            <p className="text-neutral-600">
              {searchQuery || filterRating ? "Try adjusting your filters" : "Reviews will appear here once customers submit them"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review, index) => {
              const product = review.product as any
              const userProfile = review.user_profile as any

              return (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    {product?.main_image && (
                      <div className="flex-shrink-0">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                          <Image
                            src={product.main_image}
                            alt={product.name || "Product"}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}

                    {/* Review Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {renderStars(review.rating)}
                            {review.verified_purchase && (
                              <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                <CheckCircle className="w-3 h-3" />
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          
                          {review.title && (
                            <h3 className="font-semibold text-neutral-900 mb-1">{review.title}</h3>
                          )}
                          
                          <p className="text-neutral-700 mb-3">{review.comment}</p>

                          {/* Review Images */}
                          {review.images && review.images.length > 0 && (
                            <div className="flex gap-2 mb-3">
                              {review.images.map((image, idx) => (
                                <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                                  <Image
                                    src={image}
                                    alt={`Review image ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-sm text-neutral-600">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>{userProfile?.full_name || 'Anonymous User'}</span>
                            </div>
                            <div>•</div>
                            <div>{formatDate(review.created_at)}</div>
                            {product && (
                              <>
                                <div>•</div>
                                <Link 
                                  href={`/products/${product.id}/edit`}
                                  className="flex items-center gap-1 text-blue-600 hover:underline"
                                >
                                  {product.name}
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleDelete(review.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
