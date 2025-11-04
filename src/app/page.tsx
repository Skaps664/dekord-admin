"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { 
  Package, 
  ShoppingCart, 
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Clock,
  DollarSign,
  Activity,
  Loader2
} from "lucide-react"
import { getOrders } from "@/lib/services/orders"
import { getProducts } from "@/lib/services/products"
import { getUsers } from "@/lib/services/users"
import type { OrderWithDetails, ProductWithVariants, UserWithProfile } from "@/lib/types/database"

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalUsers: number
  totalProducts: number
}

interface RecentOrder {
  id: string
  order_number: string
  customer: string
  amount: number
  status: string
  date: string
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [topProducts, setTopProducts] = useState<ProductWithVariants[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    setLoading(true)
    try {
      // Fetch orders
      const { data: orders } = await getOrders()
      
      // Fetch products
      const { data: products } = await getProducts()
      
      // Fetch users
      const { data: users } = await getUsers()

      if (orders) {
        // Calculate total revenue
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
        
        // Get recent orders (last 5)
        const recent = orders.slice(0, 5).map(order => ({
          id: order.id,
          order_number: order.order_number,
          customer: order.shipping_name || 'Unknown',
          amount: order.total_amount || 0,
          status: order.status || 'pending',
          date: new Date(order.created_at).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })
        }))
        
        setRecentOrders(recent)
        setStats(prev => ({
          ...prev,
          totalRevenue,
          totalOrders: orders.length
        }))
      }

      if (products) {
        // Get top 3 products by stock or featured status
        const top = products
          .filter(p => p.status === 'active')
          .slice(0, 3)
        setTopProducts(top)
        setStats(prev => ({ ...prev, totalProducts: products.length }))
      }

      if (users) {
        setStats(prev => ({ ...prev, totalUsers: users.length }))
      }
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
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
              <p className="text-sm text-neutral-600">Welcome back to dekord admin</p>
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
                <h2 className="text-lg font-bold text-neutral-900">Overview</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-sm text-neutral-600 mb-1">Total Revenue</h3>
                  <p className="text-2xl font-bold text-neutral-900">{formatCurrency(stats.totalRevenue)}</p>
                  <p className="text-xs text-neutral-500 mt-1">All time</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-sm text-neutral-600 mb-1">Total Orders</h3>
                  <p className="text-2xl font-bold text-neutral-900">{stats.totalOrders}</p>
                  <p className="text-xs text-neutral-500 mt-1">All time</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-sm text-neutral-600 mb-1">Total Customers</h3>
                  <p className="text-2xl font-bold text-neutral-900">{stats.totalUsers}</p>
                  <p className="text-xs text-neutral-500 mt-1">Registered users</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                  <h3 className="text-sm text-neutral-600 mb-1">Total Products</h3>
                  <p className="text-2xl font-bold text-neutral-900">{stats.totalProducts}</p>
                  <p className="text-xs text-neutral-500 mt-1">In catalog</p>
                </motion.div>
              </div>
            </div>
          </>
        )}

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Products */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
                <h2 className="text-lg font-bold text-neutral-900">Recent Products</h2>
                <Link href="/products" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
                  View All →
                </Link>
              </div>
              <div className="p-6">
                {topProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-500">No products yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <Link 
                        key={product.id} 
                        href={`/products/${product.id}`}
                        className="flex items-center gap-4 p-4 rounded-lg hover:bg-neutral-50 transition-colors"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 text-sm font-bold text-neutral-600">
                          #{index + 1}
                        </div>
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                          {product.images && product.images.length > 0 ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-neutral-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-neutral-900 truncate">{product.name}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-neutral-600">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {product.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-neutral-900">
                            {formatCurrency(product.base_price || 0)}
                          </p>
                          {product.variants && product.variants.length > 0 && (
                            <p className="text-xs text-neutral-500">{product.variants.length} variants</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-lg font-bold text-neutral-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <Link 
                  href="/products/new"
                  className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">Add New Product</h3>
                      <p className="text-xs text-neutral-500">Create a new product listing</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600" />
                </Link>

                <Link 
                  href="/orders"
                  className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <ShoppingCart className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">Manage Orders</h3>
                      <p className="text-xs text-neutral-500">View and process orders</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600" />
                </Link>

                <Link 
                  href="/users"
                  className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">View Customers</h3>
                      <p className="text-xs text-neutral-500">Browse customer list</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}

        {/* Recent Orders */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">Recent Orders</h2>
              <Link href="/orders" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
                View All →
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="p-6 text-center py-8">
                <ShoppingCart className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500">No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                        Order Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                          <Link href={`/orders/${order.id}`} className="hover:text-blue-600">
                            {order.order_number}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                          {order.customer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-neutral-900">
                          {formatCurrency(order.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                          {order.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
