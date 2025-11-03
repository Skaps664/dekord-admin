"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FileText, 
  Settings, 
  BarChart3, 
  Users,
  TrendingUp,
  TrendingDown,
  ArrowRight
} from "lucide-react"

const stats = [
  {
    title: "Total Revenue",
    value: "Rs. 248,500",
    change: "+12.5%",
    trend: "up",
    icon: TrendingUp
  },
  {
    title: "Total Orders",
    value: "156",
    change: "+8.2%",
    trend: "up",
    icon: ShoppingCart
  },
  {
    title: "Products",
    value: "12",
    change: "+2",
    trend: "up",
    icon: Package
  },
  {
    title: "Total Users",
    value: "1,234",
    change: "+15.3%",
    trend: "up",
    icon: Users
  }
]

const quickLinks = [
  {
    title: "Products",
    description: "Manage your product catalog",
    href: "/products",
    icon: Package,
    color: "bg-blue-500"
  },
  {
    title: "Orders",
    description: "View and manage orders",
    href: "/orders",
    icon: ShoppingCart,
    color: "bg-green-500"
  },
  {
    title: "Blog Posts",
    description: "Create and edit blog content",
    href: "/blog",
    icon: FileText,
    color: "bg-purple-500"
  },
  {
    title: "Analytics",
    description: "Track website performance",
    href: "/analytics",
    icon: BarChart3,
    color: "bg-orange-500"
  },
  {
    title: "Users",
    description: "Manage customer accounts",
    href: "/users",
    icon: Users,
    color: "bg-pink-500"
  },
  {
    title: "Settings",
    description: "Configure website settings",
    href: "/settings",
    icon: Settings,
    color: "bg-gray-500"
  }
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
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-foreground" />
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            </div>
            <Link 
              href="/" 
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              View Website →
            </Link>
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
                <span className={`text-sm font-semibold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-sm text-muted-foreground mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickLinks.map((link, index) => (
              <motion.div
                key={link.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              >
                <Link href={link.href} className="group block">
                  <div className="bg-white rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg ${link.color} flex items-center justify-center`}>
                        <link.icon className="w-6 h-6 text-white" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1">{link.title}</h3>
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1 }}
          className="bg-white rounded-xl border border-border shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Recent Orders</h2>
            <Link href="/orders" className="text-sm font-medium text-foreground hover:underline">
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
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
