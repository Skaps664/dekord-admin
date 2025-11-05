"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { getCouponById, updateCoupon } from "@/lib/services/coupons"
import type { Coupon } from "@/lib/types/coupon"

export default function EditCouponPage() {
  const router = useRouter()
  const params = useParams()
  const couponId = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed_amount',
    discount_value: '',
    min_purchase_amount: '',
    max_discount_amount: '',
    usage_limit: '',
    usage_limit_per_user: '1',
    start_date: '',
    end_date: '',
    is_active: true
  })

  useEffect(() => {
    loadCoupon()
  }, [couponId])

  async function loadCoupon() {
    try {
      const { data, error } = await getCouponById(couponId)
      if (error) throw error
      if (data) {
        setFormData({
          code: data.code,
          description: data.description || '',
          discount_type: data.discount_type,
          discount_value: data.discount_value.toString(),
          min_purchase_amount: data.min_purchase_amount.toString(),
          max_discount_amount: data.max_discount_amount?.toString() || '',
          usage_limit: data.usage_limit?.toString() || '',
          usage_limit_per_user: data.usage_limit_per_user.toString(),
          start_date: new Date(data.start_date).toISOString().split('T')[0],
          end_date: data.end_date ? new Date(data.end_date).toISOString().split('T')[0] : '',
          is_active: data.is_active
        })
      }
    } catch (error) {
      console.error('Error loading coupon:', error)
      alert('Failed to load coupon')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const couponData = {
        code: formData.code.toUpperCase(),
        description: formData.description || null,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_purchase_amount: parseFloat(formData.min_purchase_amount) || 0,
        max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        usage_limit_per_user: parseInt(formData.usage_limit_per_user),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        is_active: formData.is_active
      }

      const { error } = await updateCoupon(couponId, couponData)
      if (error) throw error

      router.push('/discounts')
    } catch (error: any) {
      console.error('Error updating coupon:', error)
      alert(error.message || 'Failed to update coupon')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/discounts"
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Edit Coupon</h1>
              <p className="text-sm text-neutral-600">Update discount code details</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="p-6 space-y-6">
              {/* Coupon Code */}
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., WELCOME10"
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 font-mono"
                />
                <p className="text-xs text-neutral-500 mt-1">Use uppercase letters and numbers only</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this discount"
                  rows={3}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                />
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  Discount Type *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, discount_type: 'percentage' })}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      formData.discount_type === 'percentage'
                        ? 'border-neutral-900 bg-neutral-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <p className="font-semibold text-neutral-900">Percentage</p>
                    <p className="text-sm text-neutral-600">e.g., 10% off</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, discount_type: 'fixed_amount' })}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      formData.discount_type === 'fixed_amount'
                        ? 'border-neutral-900 bg-neutral-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <p className="font-semibold text-neutral-900">Fixed Amount</p>
                    <p className="text-sm text-neutral-600">e.g., Rs. 500 off</p>
                  </button>
                </div>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  Discount Value *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  placeholder={formData.discount_type === 'percentage' ? 'e.g., 10' : 'e.g., 500'}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  {formData.discount_type === 'percentage' ? 'Percentage value (0-100)' : 'Amount in Rs.'}
                </p>
              </div>

              {/* Min Purchase & Max Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Min. Purchase Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.min_purchase_amount}
                    onChange={(e) => setFormData({ ...formData, min_purchase_amount: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                {formData.discount_type === 'percentage' && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-2">
                      Max. Discount Amount
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.max_discount_amount}
                      onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                      placeholder="No limit"
                      className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                )}
              </div>

              {/* Usage Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                    placeholder="Unlimited"
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                  <p className="text-xs text-neutral-500 mt-1">Leave empty for unlimited</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Usage Per User *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.usage_limit_per_user}
                    onChange={(e) => setFormData({ ...formData, usage_limit_per_user: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    min={formData.start_date}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                  <p className="text-xs text-neutral-500 mt-1">Leave empty for no expiry</p>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-neutral-900 border-neutral-300 rounded focus:ring-2 focus:ring-neutral-900"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-neutral-900">
                  Active (Users can use this coupon immediately)
                </label>
              </div>
            </div>

            <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex justify-end gap-3">
              <Link
                href="/discounts"
                className="px-4 py-2 text-neutral-700 hover:text-neutral-900 font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
