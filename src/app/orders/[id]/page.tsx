"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Loader2,
  Save,
  Truck,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react"
import { getOrder, updateOrderStatus, updateOrderNotes } from "@/lib/services/orders"
import { OrderWithDetails } from "@/lib/types/database"

const statusConfig = {
  "pending": { color: "bg-gray-100 text-gray-800", icon: Clock, label: "Pending" },
  "processing": { color: "bg-yellow-100 text-yellow-800", icon: Package, label: "Processing" },
  "shipped": { color: "bg-blue-100 text-blue-800", icon: Truck, label: "Shipped" },
  "delivered": { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Delivered" },
  "cancelled": { color: "bg-red-100 text-red-800", icon: XCircle, label: "Cancelled" }
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [order, setOrder] = useState<OrderWithDetails | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [trackingUrl, setTrackingUrl] = useState("")

  useEffect(() => {
    loadOrder()
  }, [id])

  const loadOrder = async () => {
    setLoading(true)
    const { data, error } = await getOrder(id)

    if (error || !data) {
      alert('Order not found')
      router.push('/orders')
      return
    }

    console.log('🔍 Order data loaded:', data)
    console.log('📧 User email:', data.user_email)
    console.log('👤 User ID:', data.user_id)

    setOrder(data)
    setAdminNotes(data.admin_notes || "")
    setTrackingNumber(data.tracking_number || "")
    setTrackingUrl(data.tracking_url || "")
    setLoading(false)
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return
    
    setSaving(true)
    const { error } = await updateOrderStatus(
      order.id, 
      newStatus,
      { tracking_number: trackingNumber, tracking_url: trackingUrl }
    )

    if (error) {
      alert(`Failed to update status: ${error}`)
    } else {
      alert('Order status updated successfully!')
      loadOrder()
    }
    setSaving(false)
  }

  const handleNotesUpdate = async () => {
    if (!order) return

    setSaving(true)
    const { error } = await updateOrderNotes(order.id, adminNotes)

    if (error) {
      alert(`Failed to update notes: ${error}`)
    } else {
      alert('Admin notes updated successfully!')
      loadOrder()
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-900 mx-auto mb-4" />
          <p className="text-neutral-600">Loading order...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return null
  }

  const statusKey = order.status.toLowerCase() as keyof typeof statusConfig
  const config = statusConfig[statusKey] || statusConfig.pending
  const StatusIcon = config.icon

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/orders" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Order {order.order_number}</h1>
                <p className="text-sm text-neutral-600">
                  {new Date(order.created_at).toLocaleString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <span className={`px-4 py-2 inline-flex items-center gap-2 text-sm font-semibold rounded-full ${config.color}`}>
              <StatusIcon className="w-4 h-4" />
              {config.label}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Items
              </h2>
              <div className="space-y-3">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-start py-3 border-b border-neutral-100 last:border-0">
                    <div>
                      <p className="font-medium text-neutral-900">{item.product_name}</p>
                      {item.variant_details && (
                        <p className="text-sm text-neutral-600">{item.variant_details}</p>
                      )}
                      {item.sku && (
                        <p className="text-xs text-neutral-500">SKU: {item.sku}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-neutral-900">
                        Rs. {Number(item.unit_price).toLocaleString()} × {item.quantity}
                      </p>
                      <p className="text-sm text-neutral-600">
                        Rs. {Number(item.total_price).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="text-neutral-900">Rs. {Number(order.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Shipping Fee</span>
                  <span className="text-neutral-900">Rs. {Number(order.shipping_fee).toLocaleString()}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Discount</span>
                    <span className="text-green-600">- Rs. {Number(order.discount_amount).toLocaleString()}</span>
                  </div>
                )}
                {order.coupon_code && (
                  <div className="flex items-center justify-between text-sm bg-green-50 -mx-2 px-2 py-2 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-green-700 font-medium">Coupon Applied</span>
                      <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                        {order.coupon_code}
                      </span>
                    </div>
                    <span className="text-green-700 font-semibold">
                      - Rs. {Number(order.discount_amount).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-neutral-200">
                  <span>Total</span>
                  <span>Rs. {Number(order.total).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-neutral-600">Name</label>
                  <p className="text-base text-neutral-900">{order.shipping_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600">Phone</label>
                  <p className="text-base text-neutral-900">{order.shipping_phone}</p>
                </div>
                {order.user_email && (
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Email (Login Email)</label>
                    <p className="text-base text-neutral-900">{order.user_email}</p>
                    <span className="inline-block mt-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      Registered Account
                    </span>
                  </div>
                )}
                {order.customer_notes && (
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Customer Notes</label>
                    <p className="text-base text-neutral-900">{order.customer_notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Address
              </h2>
              <div className="space-y-2">
                <p className="text-base text-neutral-900">{order.shipping_address}</p>
                <p className="text-base text-neutral-900">{order.shipping_city}, {order.shipping_province}</p>
                {order.shipping_postal_code && (
                  <p className="text-base text-neutral-900">Postal Code: {order.shipping_postal_code}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Update Status</h2>
              <select
                value={order.status}
                onChange={(e) => handleStatusUpdate(e.target.value)}
                disabled={saving}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none disabled:opacity-50"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Tracking Information */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Tracking Info
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-1">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none"
                    placeholder="TCS123456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-1">
                    Tracking URL
                  </label>
                  <input
                    type="url"
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment
              </h2>
              <p className="text-base text-neutral-900">{order.payment_method.toUpperCase()}</p>
            </div>

            {/* Admin Notes */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Admin Notes</h2>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none resize-none"
                placeholder="Add internal notes..."
              />
              <button
                onClick={handleNotesUpdate}
                disabled={saving}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Notes
                  </>
                )}
              </button>
            </div>

            {/* Timestamps */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Timeline</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-neutral-600">Created:</span>
                  <p className="text-neutral-900">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                {order.shipped_at && (
                  <div>
                    <span className="text-neutral-600">Shipped:</span>
                    <p className="text-neutral-900">{new Date(order.shipped_at).toLocaleString()}</p>
                  </div>
                )}
                {order.delivered_at && (
                  <div>
                    <span className="text-neutral-600">Delivered:</span>
                    <p className="text-neutral-900">{new Date(order.delivered_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
