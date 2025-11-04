"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  Search, 
  Filter,
  Eye,
  Download,
  MoreVertical,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Loader2
} from "lucide-react"
import { getOrders, updateOrderStatus } from "@/lib/services/orders"
import { OrderWithDetails } from "@/lib/types/database"

const statusConfig = {
  "pending": { color: "bg-gray-100 text-gray-800", icon: Clock, label: "Pending" },
  "processing": { color: "bg-yellow-100 text-yellow-800", icon: Package, label: "Processing" },
  "shipped": { color: "bg-blue-100 text-blue-800", icon: Truck, label: "Shipped" },
  "delivered": { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Delivered" },
  "cancelled": { color: "bg-red-100 text-red-800", icon: XCircle, label: "Cancelled" }
}

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  useEffect(() => {
    loadOrders()
  }, [selectedStatus, searchQuery])

  const loadOrders = async () => {
    setLoading(true)
    const { data, error } = await getOrders({
      status: selectedStatus,
      search: searchQuery
    })
    
    if (error) {
      console.error('Failed to load orders:', error)
      alert('Failed to load orders')
    } else if (data) {
      setOrders(data)
    }
    setLoading(false)
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId)
    const { error } = await updateOrderStatus(orderId, newStatus)
    
    if (error) {
      alert(`Failed to update order status: ${error}`)
    } else {
      alert('Order status updated successfully!')
      loadOrders()
    }
    setUpdatingOrderId(null)
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Orders</h1>
              <p className="text-sm text-neutral-600">Manage customer orders and fulfillment</p>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by order number, customer name, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
            >
              <option value="All">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-neutral-600" />
              <p className="text-sm text-neutral-600">Loading orders...</p>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <Package className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No orders found</h3>
            <p className="text-neutral-600">
              {searchQuery ? "Try adjusting your search" : "No orders have been placed yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const statusKey = order.status.toLowerCase() as keyof typeof statusConfig
              const config = statusConfig[statusKey] || statusConfig.pending
              const StatusIcon = config.icon
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{order.order_number}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 inline-flex items-center gap-2 text-xs leading-5 font-semibold rounded-full ${config.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                      {updatingOrderId === order.id && (
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Customer Info */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Customer</h4>
                      <p className="text-sm text-foreground">{order.shipping_name}</p>
                      <p className="text-xs text-muted-foreground">{order.shipping_phone}</p>
                      {order.user_email && (
                        <p className="text-xs text-muted-foreground mt-1">{order.user_email}</p>
                      )}
                      {order.user_id && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">Registered User</span>
                        </p>
                      )}
                    </div>

                    {/* Shipping Info */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Shipping Address</h4>
                      <p className="text-xs text-muted-foreground">{order.shipping_address}</p>
                      <p className="text-xs text-muted-foreground">{order.shipping_city}, {order.shipping_province}</p>
                      {order.shipping_postal_code && (
                        <p className="text-xs text-muted-foreground">{order.shipping_postal_code}</p>
                      )}
                    </div>

                    {/* Order Summary */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Order Summary</h4>
                      {order.order_items?.map((item) => (
                        <p key={item.id} className="text-xs text-muted-foreground">
                          {item.quantity}x {item.product_name}
                          {item.variant_details && ` (${item.variant_details})`}
                        </p>
                      ))}
                      <p className="text-sm font-bold text-foreground mt-2">
                        Total: Rs. {Number(order.total).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Payment: {order.payment_method.toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      disabled={updatingOrderId === order.id}
                      className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <Link 
                      href={`/orders/${order.id}`}
                      className="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-neutral-50 transition-colors inline-flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Link>
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
