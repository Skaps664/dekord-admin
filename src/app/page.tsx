"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useEffect, useState } from "react"
import { 
  Package, 
  ShoppingCart, 
  Users,
  DollarSign,
  Activity,
  Loader2,
  AlertCircle,
  Star,
  TrendingUp,
  UserPlus,
  CheckCircle2,
  Truck,
  Clock,
  XCircle,
  BarChart3
} from "lucide-react"
import { getOrders } from "@/lib/services/orders"
import { getProducts } from "@/lib/services/products"
import { getUsers } from "@/lib/services/users"
import { getClaimStats } from "@/lib/services/claims"
import { getAllReviews } from "@/lib/services/reviews"

interface DashboardStats {
  orders: {
    total: number
    processing: number
    shipped: number
    delivered: number
    cancelled: number
  }
  users: {
    total: number
    newThisMonth: number
  }
  revenue: {
    total: number
    fromDelivered: number
  }
  products: {
    total: number
    topProducts: Array<{
      id: string
      name: string
      totalStock: number
      unitsSold: number
      remainingStock: number
    }>
  }
  claims: {
    total: number
    byType: Record<string, number>
    pending: number
    inProgress: number
    resolved: number
  }
  reviews: {
    total: number
    deliveredOrders: number
    percentage: number
  }
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    orders: { total: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 },
    users: { total: 0, newThisMonth: 0 },
    revenue: { total: 0, fromDelivered: 0 },
    products: { total: 0, topProducts: [] },
    claims: { total: 0, byType: {}, pending: 0, inProgress: 0, resolved: 0 },
    reviews: { total: 0, deliveredOrders: 0, percentage: 0 }
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    setLoading(true)
    try {
      // Fetch all data in parallel
      const [ordersRes, productsRes, usersRes, claimsRes, reviewsRes] = await Promise.all([
        getOrders(),
        getProducts(),
        getUsers(),
        getClaimStats(),
        getAllReviews()
      ])

      const newStats: DashboardStats = {
        orders: { total: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 },
        users: { total: 0, newThisMonth: 0 },
        revenue: { total: 0, fromDelivered: 0 },
        products: { total: 0, topProducts: [] },
        claims: { total: 0, byType: {}, pending: 0, inProgress: 0, resolved: 0 },
        reviews: { total: 0, deliveredOrders: 0, percentage: 0 }
      }

      // Process Orders
      if (ordersRes.data) {
        const orders = ordersRes.data
        newStats.orders.total = orders.length
        
        orders.forEach(order => {
          const status = order.status?.toLowerCase() || 'pending'
          
          if (status === 'processing') newStats.orders.processing++
          else if (status === 'shipped') newStats.orders.shipped++
          else if (status === 'delivered') {
            newStats.orders.delivered++
            newStats.revenue.fromDelivered += order.total || 0
          }
          else if (status === 'cancelled') newStats.orders.cancelled++
          
          // Total revenue from all orders (excluding cancelled)
          if (status !== 'cancelled') {
            newStats.revenue.total += order.total || 0
          }
        })

        newStats.reviews.deliveredOrders = newStats.orders.delivered
      }

      // Process Users
      if (usersRes.data) {
        newStats.users.total = usersRes.data.length
        
        // Count new users this month
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        
        newStats.users.newThisMonth = usersRes.data.filter(user => {
          const createdAt = new Date(user.created_at)
          return createdAt >= startOfMonth
        }).length
      }

      // Process Products with stock info
      if (productsRes.data) {
        const products = productsRes.data
        newStats.products.total = products.length

        // Calculate top products by units sold (from order items)
        if (ordersRes.data) {
          const productSales = new Map<string, { name: string; sold: number; totalStock: number }>()

          // Aggregate sales from all delivered orders
          ordersRes.data
            .filter(order => order.status === 'delivered')
            .forEach(order => {
              order.items?.forEach(item => {
                if (item.product_id) {
                  const current = productSales.get(item.product_id) || { 
                    name: item.product_name, 
                    sold: 0, 
                    totalStock: 0 
                  }
                  current.sold += item.quantity
                  productSales.set(item.product_id, current)
                }
              })
            })

          // Match with products to get stock info
          products.forEach(product => {
            const sales = productSales.get(product.id)
            if (sales) {
              // Calculate total stock from variants
              let totalStock = 0
              product.variants?.forEach(variant => {
                totalStock += variant.stock || 0
              })
              
              sales.totalStock = totalStock + sales.sold // Total stock = current + sold
              productSales.set(product.id, sales)
            }
          })

          // Get top 5 products by units sold
          newStats.products.topProducts = Array.from(productSales.entries())
            .map(([id, data]) => ({
              id,
              name: data.name,
              totalStock: data.totalStock,
              unitsSold: data.sold,
              remainingStock: data.totalStock - data.sold
            }))
            .sort((a, b) => b.unitsSold - a.unitsSold)
            .slice(0, 5)
        }
      }

      // Process Claims
      if (claimsRes.data) {
        newStats.claims.total = claimsRes.data.total
        newStats.claims.byType = claimsRes.data.byType
        newStats.claims.pending = claimsRes.data.byStatus['pending'] || 0
        newStats.claims.inProgress = claimsRes.data.byStatus['in_progress'] || 0
        newStats.claims.resolved = claimsRes.data.byStatus['resolved'] || 0
      }

      // Process Reviews
      if (reviewsRes.data) {
        newStats.reviews.total = reviewsRes.data.length
        
        // Calculate percentage of delivered orders that have reviews
        if (newStats.orders.delivered > 0) {
          newStats.reviews.percentage = Math.round(
            (newStats.reviews.total / newStats.orders.delivered) * 100
          )
        }
      }

      setStats(newStats)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString()}`
  }
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
                <p className="text-sm text-neutral-600">Welcome back to dekord admin</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
          </div>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-neutral-600" />
                <h2 className="text-lg font-bold text-neutral-900">Analytics Overview</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Orders Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-sm text-neutral-600">Total Orders</h3>
                        <p className="text-3xl font-bold text-neutral-900">{stats.orders.total}</p>
                      </div>
                    </div>
                    <Link href="/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View All →
                    </Link>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Processing */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="flex items-center gap-2 text-neutral-600">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          Processing
                        </span>
                        <span className="font-semibold text-neutral-900">{stats.orders.processing}</span>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${stats.orders.total > 0 ? (stats.orders.processing / stats.orders.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Shipped */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="flex items-center gap-2 text-neutral-600">
                          <Truck className="w-4 h-4 text-blue-600" />
                          Shipped
                        </span>
                        <span className="font-semibold text-neutral-900">{stats.orders.shipped}</span>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${stats.orders.total > 0 ? (stats.orders.shipped / stats.orders.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Delivered */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="flex items-center gap-2 text-neutral-600">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          Delivered
                        </span>
                        <span className="font-semibold text-neutral-900">{stats.orders.delivered}</span>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${stats.orders.total > 0 ? (stats.orders.delivered / stats.orders.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Cancelled */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="flex items-center gap-2 text-neutral-600">
                          <XCircle className="w-4 h-4 text-red-600" />
                          Cancelled
                        </span>
                        <span className="font-semibold text-neutral-900">{stats.orders.cancelled}</span>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${stats.orders.total > 0 ? (stats.orders.cancelled / stats.orders.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Users Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-sm text-neutral-600">Total Users</h3>
                        <p className="text-3xl font-bold text-neutral-900">{stats.users.total}</p>
                      </div>
                    </div>
                    <Link href="/users" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                      View All →
                    </Link>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserPlus className="w-5 h-5 text-purple-600" />
                          <span className="text-sm font-medium text-neutral-700">New This Month</span>
                        </div>
                        <span className="text-2xl font-bold text-purple-600">{stats.users.newThisMonth}</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-neutral-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Registered Users</span>
                        <span className="font-semibold text-neutral-900">{stats.users.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Growth Rate</span>
                        <span className="font-semibold text-green-600">
                          {stats.users.total > 0 ? Math.round((stats.users.newThisMonth / stats.users.total) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Revenue Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-sm text-neutral-600">Total Revenue</h3>
                        <p className="text-3xl font-bold text-neutral-900">{formatCurrency(stats.revenue.total)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-neutral-700">Revenue from Delivered Orders</span>
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.revenue.fromDelivered)}</p>
                    </div>
                    
                    <div className="text-sm text-neutral-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Delivered Orders</span>
                        <span className="font-semibold text-neutral-900">{stats.orders.delivered}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Order Value</span>
                        <span className="font-semibold text-neutral-900">
                          {formatCurrency(stats.orders.delivered > 0 ? stats.revenue.fromDelivered / stats.orders.delivered : 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Products Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Package className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-sm text-neutral-600">Total Products</h3>
                        <p className="text-3xl font-bold text-neutral-900">{stats.products.total}</p>
                      </div>
                    </div>
                    <Link href="/products" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                      View All →
                    </Link>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Top Products</h4>
                    {stats.products.topProducts.length > 0 ? (
                      stats.products.topProducts.map((product, index) => (
                        <div key={product.id} className="flex items-center justify-between text-sm py-2 border-b border-neutral-100 last:border-0">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                              {index + 1}
                            </span>
                            <span className="text-neutral-900 font-medium truncate">{product.name}</span>
                          </div>
                          <div className="text-right ml-2">
                            <p className="text-xs text-neutral-500">
                              Stock: <span className="font-semibold text-neutral-900">{product.remainingStock}</span>
                            </p>
                            <p className="text-xs text-green-600">
                              Sold: {product.unitsSold}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-neutral-500 py-4 text-center">No sales data yet</p>
                    )}
                  </div>
                </motion.div>

                {/* Claims Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-sm text-neutral-600">Total Claims</h3>
                        <p className="text-3xl font-bold text-neutral-900">{stats.claims.total}</p>
                      </div>
                    </div>
                    <Link href="/claims" className="text-sm text-red-600 hover:text-red-700 font-medium">
                      View All →
                    </Link>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100 text-center">
                        <p className="text-xs text-neutral-600 mb-1">Pending</p>
                        <p className="text-lg font-bold text-yellow-600">{stats.claims.pending}</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 text-center">
                        <p className="text-xs text-neutral-600 mb-1">In Progress</p>
                        <p className="text-lg font-bold text-blue-600">{stats.claims.inProgress}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 border border-green-100 text-center">
                        <p className="text-xs text-neutral-600 mb-1">Resolved</p>
                        <p className="text-lg font-bold text-green-600">{stats.claims.resolved}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">By Type</h4>
                      {Object.entries(stats.claims.byType).map(([type, count]) => (
                        <div key={type} className="flex justify-between text-sm">
                          <span className="text-neutral-600 capitalize">{type.replace('_', ' ')}</span>
                          <span className="font-semibold text-neutral-900">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Reviews Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                        <Star className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="text-sm text-neutral-600">Total Reviews</h3>
                        <p className="text-3xl font-bold text-neutral-900">{stats.reviews.total}</p>
                      </div>
                    </div>
                    <Link href="/reviews" className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">
                      View All →
                    </Link>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-neutral-700">Review Rate</span>
                        <BarChart3 className="w-4 h-4 text-yellow-600" />
                      </div>
                      <p className="text-3xl font-bold text-yellow-600">{stats.reviews.percentage}%</p>
                      <p className="text-xs text-neutral-600 mt-1">
                        of delivered orders
                      </p>
                    </div>
                    
                    <div className="text-sm text-neutral-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Total Reviews</span>
                        <span className="font-semibold text-neutral-900">{stats.reviews.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivered Orders</span>
                        <span className="font-semibold text-neutral-900">{stats.reviews.deliveredOrders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending Reviews</span>
                        <span className="font-semibold text-orange-600">
                          {stats.reviews.deliveredOrders - stats.reviews.total}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
