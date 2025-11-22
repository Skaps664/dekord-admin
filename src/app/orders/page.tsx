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
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageCircle
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
  const [lastDataLoad, setLastDataLoad] = useState<string | null>(null)

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
      setLastDataLoad(new Date().toISOString())
    }
    setLoading(false)
  }

  const checkForStockUpdates = () => {
    if (typeof window === 'undefined') return
    
    const stockLastUpdated = localStorage.getItem('stockLastUpdated')
    if (stockLastUpdated && (!lastDataLoad || new Date(stockLastUpdated) > new Date(lastDataLoad))) {
      console.log('Stock updated, refreshing orders data...')
      loadOrders()
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    // Validate shipping details for shipped status
    if (newStatus === 'shipped') {
      const order = orders.find(o => o.id === orderId)
      if (!order?.tracking_number || !order?.courier) {
        alert('Please add shipping tracking details before marking as shipped.')
        return
      }
    }

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

  const exportToCSV = (ordersToExport: OrderWithDetails[], status: string) => {
    const headers = [
      'Order Number',
      'Customer Name',
      'Phone',
      'Email',
      'Address',
      'City',
      'Province',
      'Postal Code',
      'Items',
      'Total',
      'Payment Method',
      'Status',
      'Created At',
      'Tracking Number',
      'Carrier',
      'Customer Confirmed',
      'Confirmation Query'
    ]

    const csvData = ordersToExport.map(order => {
      const items = order.order_items?.map(item => 
        `${item.quantity}x ${item.product_name}${item.variant_details ? ` (${item.variant_details})` : ''}`
      ).join('; ') || ''

      return [
        order.order_number,
        order.shipping_name,
        order.shipping_phone,
        order.user_email || '',
        order.shipping_address,
        order.shipping_city,
        order.shipping_province,
        order.shipping_postal_code || '',
        items,
        order.total,
        order.payment_method.toUpperCase(),
        order.status,
        new Date(order.created_at).toLocaleString(),
        order.tracking_number || '',
        order.courier || '',
        order.customer_confirmed ? 'Yes' : 'No',
        order.confirmation_query || ''
      ]
    })

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `orders_${status}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
            <button 
              onClick={() => exportToCSV(orders, 'all')}
              className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export All Orders
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <div className="flex flex-col gap-4">
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
            </div>

            {/* Status Filter Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedStatus('All')}
                className={`px-6 py-3 rounded-lg font-semibold text-lg transition-all ${
                  selectedStatus === 'All'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Orders ({orders.length})
              </button>
              <button
                onClick={() => setSelectedStatus('pending')}
                className={`px-6 py-3 rounded-lg font-semibold text-lg transition-all ${
                  selectedStatus === 'pending'
                    ? 'bg-yellow-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Pending ({orders.filter(o => o.status === 'pending').length})
              </button>
              <button
                onClick={() => setSelectedStatus('processing')}
                className={`px-6 py-3 rounded-lg font-semibold text-lg transition-all ${
                  selectedStatus === 'processing'
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Processing ({orders.filter(o => o.status === 'processing').length})
              </button>
              <button
                onClick={() => setSelectedStatus('shipped')}
                className={`px-6 py-3 rounded-lg font-semibold text-lg transition-all ${
                  selectedStatus === 'shipped'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Shipped ({orders.filter(o => o.status === 'shipped').length})
              </button>
              <button
                onClick={() => setSelectedStatus('delivered')}
                className={`px-6 py-3 rounded-lg font-semibold text-lg transition-all ${
                  selectedStatus === 'delivered'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Delivered ({orders.filter(o => o.status === 'delivered').length})
              </button>
              <button
                onClick={() => setSelectedStatus('cancelled')}
                className={`px-6 py-3 rounded-lg font-semibold text-lg transition-all ${
                  selectedStatus === 'cancelled'
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancelled ({orders.filter(o => o.status === 'cancelled').length})
              </button>
            </div>

            {/* Export Button */}
            {selectedStatus !== 'All' && (
              <button
                onClick={() => exportToCSV(orders, selectedStatus)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors flex items-center gap-2 w-fit"
              >
                <Download className="w-5 h-5" />
                Export {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Orders to CSV
              </button>
            )}
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
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-foreground">{order.order_number}</h3>
                          {order.customer_confirmed ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              Confirmed
                            </span>
                          ) : order.confirmation_query ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
                              <MessageCircle className="w-3 h-3" />
                              Query
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                              <AlertCircle className="w-3 h-3" />
                              Not Yet
                            </span>
                          )}
                        </div>
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
                      {order.confirmation_query && (
                        <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                          <p className="font-semibold text-orange-900 mb-1">Customer Query:</p>
                          <p className="text-orange-800 line-clamp-2">{order.confirmation_query}</p>
                        </div>
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

                    {/* Order Summary with Stock Info */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Order Summary</h4>
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="mb-2">
                          <p className="text-xs text-muted-foreground">
                            {item.quantity}x {item.product_name}
                            {item.variant_details && ` (${item.variant_details})`}
                          </p>
                          {item.current_stock !== undefined && (
                            <p className="text-xs text-blue-600 font-medium">
                              Stock: {item.current_stock > 0 ? item.current_stock : 'Out of stock'}
                            </p>
                          )}
                        </div>
                      ))}
                      <p className="text-sm font-bold text-foreground mt-2">
                        Total: Rs. {order.total}
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
