"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  Eye,
  DollarSign,
  ArrowUp,
  ArrowDown
} from "lucide-react"

const stats = [
  {
    title: "Total Page Views",
    value: "24,567",
    change: "+12.5%",
    trend: "up",
    icon: Eye
  },
  {
    title: "Unique Visitors",
    value: "8,234",
    change: "+8.2%",
    trend: "up",
    icon: Users
  },
  {
    title: "Conversion Rate",
    value: "3.24%",
    change: "-0.5%",
    trend: "down",
    icon: TrendingUp
  },
  {
    title: "Average Order Value",
    value: "Rs. 2,850",
    change: "+5.8%",
    trend: "up",
    icon: DollarSign
  }
]

const topPages = [
  { page: "/", views: 5420, bounce: "42%", avgTime: "2:45" },
  { page: "/product", views: 3210, bounce: "35%", avgTime: "3:12" },
  { page: "/catalog", views: 2890, bounce: "48%", avgTime: "1:58" },
  { page: "/blog", views: 1654, bounce: "52%", avgTime: "1:22" },
  { page: "/checkout", views: 890, bounce: "15%", avgTime: "4:30" }
]

const trafficSources = [
  { source: "Direct", visits: 8500, percentage: 45 },
  { source: "Organic Search", visits: 5200, percentage: 28 },
  { source: "Social Media", visits: 3100, percentage: 16 },
  { source: "Referral", visits: 1800, percentage: 9 },
  { source: "Email", visits: 400, percentage: 2 }
]

const topProducts = [
  { name: "dekord W-60 USB-C Cable (1m)", views: 4200, orders: 145, conversion: "3.45%" },
  { name: "dekord W-60 USB-C Cable (2m)", views: 2100, orders: 68, conversion: "3.24%" },
  { name: "dekord W-100 USB-C Cable", views: 1800, orders: 12, conversion: "0.67%" }
]

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            </div>
            <select className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>This Year</option>
            </select>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white rounded-xl border border-border p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="w-8 h-8 text-muted-foreground" />
                <div className={`flex items-center gap-1 text-sm font-semibold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-sm text-muted-foreground mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Traffic Sources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="bg-white rounded-xl border border-border p-6 shadow-sm"
          >
            <h2 className="text-lg font-bold text-foreground mb-6">Traffic Sources</h2>
            <div className="space-y-4">
              {trafficSources.map((source, index) => (
                <div key={source.source}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground">{source.source}</span>
                    <span className="text-sm font-semibold text-foreground">
                      {source.visits.toLocaleString()} ({source.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${source.percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                      className="bg-foreground h-2 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Pages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="bg-white rounded-xl border border-border p-6 shadow-sm"
          >
            <h2 className="text-lg font-bold text-foreground mb-6">Top Pages</h2>
            <div className="space-y-4">
              {topPages.map((page) => (
                <div key={page.page} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{page.page}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-muted-foreground">Bounce: {page.bounce}</span>
                      <span className="text-xs text-muted-foreground">Avg: {page.avgTime}</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{page.views.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="bg-white rounded-xl border border-border shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">Top Products</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Conversion Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topProducts.map((product) => (
                  <tr key={product.name} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-foreground">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {product.views.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {product.orders}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {product.conversion}
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
