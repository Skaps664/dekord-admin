"use client"

import { useState } from "react"
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
  Clock
} from "lucide-react"

const mockOrders = [
  {
    id: "ORD-001",
    customer: {
      name: "Ahmed Ali",
      email: "ahmed@example.com",
      phone: "+92 300 1234567"
    },
    items: [
      { name: "dekord W-60 USB-C Cable", quantity: 2, price: 2500 }
    ],
    total: 5200,
    status: "Pending",
    payment: "COD",
    date: "Nov 3, 2025 10:30 AM",
    shipping: {
      address: "House 123, Street 5, F-7, Islamabad",
      city: "Islamabad",
      province: "Islamabad Capital Territory"
    }
  },
  {
    id: "ORD-002",
    customer: {
      name: "Fatima Khan",
      email: "fatima@example.com",
      phone: "+92 321 9876543"
    },
    items: [
      { name: "dekord W-60 USB-C Cable", quantity: 1, price: 2500 }
    ],
    total: 2700,
    status: "Processing",
    payment: "COD",
    date: "Nov 3, 2025 09:15 AM",
    shipping: {
      address: "Flat 4B, Block A, DHA Phase 2, Karachi",
      city: "Karachi",
      province: "Sindh"
    }
  },
  {
    id: "ORD-003",
    customer: {
      name: "Hassan Malik",
      email: "hassan@example.com",
      phone: "+92 333 5555555"
    },
    items: [
      { name: "dekord W-60 USB-C Cable (2m)", quantity: 1, price: 3200 }
    ],
    total: 3400,
    status: "Shipped",
    payment: "COD",
    date: "Nov 2, 2025 02:45 PM",
    shipping: {
      address: "House 456, Model Town, Lahore",
      city: "Lahore",
      province: "Punjab"
    }
  },
  {
    id: "ORD-004",
    customer: {
      name: "Ayesha Tariq",
      email: "ayesha@example.com",
      phone: "+92 345 7777777"
    },
    items: [
      { name: "dekord W-60 USB-C Cable", quantity: 1, price: 2500 }
    ],
    total: 2700,
    status: "Delivered",
    payment: "COD",
    date: "Nov 2, 2025 11:20 AM",
    shipping: {
      address: "House 789, University Town, Peshawar",
      city: "Peshawar",
      province: "Khyber Pakhtunkhwa"
    }
  }
]

const statusConfig = {
  "Pending": { color: "bg-gray-100 text-gray-800", icon: Clock },
  "Processing": { color: "bg-yellow-100 text-yellow-800", icon: Package },
  "Shipped": { color: "bg-blue-100 text-blue-800", icon: Truck },
  "Delivered": { color: "bg-green-100 text-green-800", icon: CheckCircle }
}

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")

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
                placeholder="Search orders..."
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
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {mockOrders.map((order, index) => {
            const StatusIcon = statusConfig[order.status as keyof typeof statusConfig].icon
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{order.id}</h3>
                      <p className="text-sm text-muted-foreground">{order.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 inline-flex items-center gap-2 text-xs leading-5 font-semibold rounded-full ${statusConfig[order.status as keyof typeof statusConfig].color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {order.status}
                    </span>
                    <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Customer Info */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Customer</h4>
                    <p className="text-sm text-foreground">{order.customer.name}</p>
                    <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                    <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
                  </div>

                  {/* Shipping Info */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Shipping Address</h4>
                    <p className="text-xs text-muted-foreground">{order.shipping.address}</p>
                    <p className="text-xs text-muted-foreground">{order.shipping.city}, {order.shipping.province}</p>
                  </div>

                  {/* Order Summary */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Order Summary</h4>
                    {order.items.map((item, idx) => (
                      <p key={idx} className="text-xs text-muted-foreground">
                        {item.quantity}x {item.name}
                      </p>
                    ))}
                    <p className="text-sm font-bold text-foreground mt-2">
                      Total: Rs. {order.total.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Payment: {order.payment}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex gap-3">
                  <button className="px-4 py-2 text-sm font-medium text-foreground bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors">
                    Update Status
                  </button>
                  <Link 
                    href={`/orders/${order.id}`}
                    className="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
