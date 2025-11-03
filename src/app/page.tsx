"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
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
  Activity
} from "lucide-react"

// Last 24 Hours Stats
const last24HoursStats = [
  {
    title: "Revenue (24h)",
    value: "Rs. 18,450",
    change: "+8.2%",
    trend: "up",
    icon: DollarSign,
    subtitle: "vs previous 24h"
  },
  {
    title: "Orders (24h)",
    value: "23",
    change: "+12.5%",
    trend: "up",
    icon: ShoppingCart,
    subtitle: "vs previous 24h"
  },
  {
    title: "Visitors (24h)",
    value: "1,284",
    change: "+5.8%",
    trend: "up",
    icon: Eye,
    subtitle: "vs previous 24h"
  },
  {
    title: "Conversion Rate",
    value: "1.8%",
    change: "-0.3%",
    trend: "down",
    icon: Activity,
    subtitle: "vs previous 24h"
  }
]

// Top Performing Products
const topProducts = [
  {
    id: 1,
    name: "dekord W-60 USB-C Cable",
    image: "/braided-cable-coiled-aesthetic-still.jpg",
    sales: 45,
    revenue: "Rs. 112,500",
    views: 1250,
    conversionRate: "3.6%"
  },
  {
    id: 2,
    name: "dekord W-60 USB-C Cable (2m)",
    image: "/braided-cable-coiled-aesthetic-still.jpg",
    sales: 28,
    revenue: "Rs. 89,600",
    views: 890,
    conversionRate: "3.1%"
  },
  {
    id: 3,
    name: "dekord W-100 USB-C Cable",
    image: "/braided-cable-coiled-aesthetic-still.jpg",
    sales: 18,
    revenue: "Rs. 63,000",
    views: 720,
    conversionRate: "2.5%"
  }
]

// Traffic Sources (Last 24h)
const trafficSources = [
  { source: "Direct", visitors: 542, percentage: 42 },
  { source: "Social Media", visitors: 385, percentage: 30 },
  { source: "Google Search", visitors: 257, percentage: 20 },
  { source: "Referral", visitors: 100, percentage: 8 }
]

const recentOrders = [
  { id: "#ORD-001", customer: "Ahmed Ali", amount: "Rs. 2,500", status: "Pending", date: "Nov 3, 2025" },
  { id: "#ORD-002", customer: "Fatima Khan", amount: "Rs. 1,800", status: "Processing", date: "Nov 3, 2025" },
  { id: "#ORD-003", customer: "Hassan Malik", amount: "Rs. 3,200", status: "Shipped", date: "Nov 2, 2025" },
  { id: "#ORD-004", customer: "Ayesha Tariq", amount: "Rs. 1,500", status: "Delivered", date: "Nov 2, 2025" },
  { id: "#ORD-005", customer: "Bilal Ahmed", amount: "Rs. 2,100", status: "Pending", date: "Nov 1, 2025" }
]

export default function AdminDashboard() {
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
        {/* Last 24 Hours Stats */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-neutral-600" />
            <h2 className="text-lg font-bold text-neutral-900">Last 24 Hours</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {last24HoursStats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${stat.trend === 'up' ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                    stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.change}
                  </div>
                </div>
                <h3 className="text-sm text-neutral-600 mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-neutral-900 mb-1">{stat.value}</p>
                <p className="text-xs text-neutral-500">{stat.subtitle}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Top Performing Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">Top Performing Products</h2>
              <Link href="/products" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
                View All →
              </Link>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-4 p-4 rounded-lg hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 text-sm font-bold text-neutral-600">
                      #{index + 1}
                    </div>
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-900 truncate">{product.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-neutral-600">
                        <span>{product.sales} sales</span>
                        <span>•</span>
                        <span>{product.views} views</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-neutral-900">{product.revenue}</p>
                      <p className="text-sm text-green-600">{product.conversionRate} CR</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Traffic Sources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-lg font-bold text-neutral-900">Traffic Sources (24h)</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {trafficSources.map((source) => (
                  <div key={source.source}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-700">{source.source}</span>
                      <span className="text-sm font-bold text-neutral-900">{source.visitors}</span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2">
                      <div
                        className="bg-neutral-900 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">{source.percentage}% of traffic</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Orders */}
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                    Order ID
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
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-neutral-900">
                      {order.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
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
        </motion.div>
      </div>
    </div>
  )
}
