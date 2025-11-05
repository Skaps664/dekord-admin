"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Plus, Search, Ticket, Calendar, Percent, DollarSign, Users, Trash2, Edit, Loader2 } from "lucide-react"
import { getCoupons, deleteCoupon } from "@/lib/services/coupons"
import type { Coupon } from "@/lib/types/coupon"

export default function DiscountsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'expired'>('all')

  useEffect(() => {
    loadCoupons()
  }, [])

  async function loadCoupons() {
    setLoading(true)
    try {
      const { data, error } = await getCoupons()
      if (error) throw error
      setCoupons(data || [])
    } catch (error) {
      console.error('Error loading coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string, code: string) {
    if (!confirm(`Are you sure you want to delete coupon "${code}"?`)) return

    try {
      const { error } = await deleteCoupon(id)
      if (error) throw error
      setCoupons(coupons.filter(c => c.id !== id))
    } catch (error) {
      console.error('Error deleting coupon:', error)
      alert('Failed to delete coupon')
    }
  }

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         coupon.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const now = new Date()
    const startDate = new Date(coupon.start_date)
    const endDate = coupon.end_date ? new Date(coupon.end_date) : null
    
    let matchesFilter = true
    if (filterStatus === 'active') {
      matchesFilter = coupon.is_active && startDate <= now && (!endDate || endDate >= now)
    } else if (filterStatus === 'inactive') {
      matchesFilter = !coupon.is_active
    } else if (filterStatus === 'expired') {
      matchesFilter = endDate !== null && endDate < now
    }

    return matchesSearch && matchesFilter
  })

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString()}`
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const getCouponStatus = (coupon: Coupon) => {
    const now = new Date()
    const startDate = new Date(coupon.start_date)
    const endDate = coupon.end_date ? new Date(coupon.end_date) : null

    if (!coupon.is_active) return { label: 'Inactive', color: 'bg-gray-100 text-gray-700' }
    if (endDate && endDate < now) return { label: 'Expired', color: 'bg-red-100 text-red-700' }
    if (startDate > now) return { label: 'Scheduled', color: 'bg-blue-100 text-blue-700' }
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) return { label: 'Limit Reached', color: 'bg-orange-100 text-orange-700' }
    return { label: 'Active', color: 'bg-green-100 text-green-700' }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Discounts & Coupons</h1>
              <p className="text-sm text-neutral-600">Manage promotional codes and discounts</p>
            </div>
            <Link
              href="/discounts/new"
              className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Coupon
            </Link>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search coupons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {['all', 'active', 'inactive', 'expired'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as typeof filterStatus)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                    filterStatus === status
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <Ticket className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No coupons found</h3>
            <p className="text-neutral-600 mb-6">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Create your first coupon to start offering discounts'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Link
                href="/discounts/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Coupon
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCoupons.map((coupon, index) => {
              const status = getCouponStatus(coupon)
              return (
                <motion.div
                  key={coupon.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Ticket className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-neutral-900 font-mono">{coupon.code}</h3>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                        </div>
                        {coupon.description && (
                          <p className="text-sm text-neutral-600 mb-4">{coupon.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/discounts/${coupon.id}/edit`}
                          className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(coupon.id, coupon.code)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        {coupon.discount_type === 'percentage' ? (
                          <Percent className="w-4 h-4 text-neutral-500" />
                        ) : (
                          <DollarSign className="w-4 h-4 text-neutral-500" />
                        )}
                        <div>
                          <p className="text-xs text-neutral-500">Discount</p>
                          <p className="font-semibold text-neutral-900">
                            {coupon.discount_type === 'percentage'
                              ? `${coupon.discount_value}%`
                              : formatCurrency(coupon.discount_value)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-neutral-500" />
                        <div>
                          <p className="text-xs text-neutral-500">Usage</p>
                          <p className="font-semibold text-neutral-900">
                            {coupon.used_count} / {coupon.usage_limit || '∞'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(coupon.start_date)} - {coupon.end_date ? formatDate(coupon.end_date) : 'No expiry'}
                      </span>
                    </div>

                    {coupon.min_purchase_amount > 0 && (
                      <div className="mt-3 pt-3 border-t border-neutral-200 text-sm text-neutral-600">
                        Min. purchase: {formatCurrency(coupon.min_purchase_amount)}
                        {coupon.max_discount_amount && (
                          <span className="ml-3">Max. discount: {formatCurrency(coupon.max_discount_amount)}</span>
                        )}
                      </div>
                    )}
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
