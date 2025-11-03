"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  ArrowLeft, 
  Search,
  Filter,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag
} from "lucide-react"

const mockUsers = [
  {
    id: 1,
    name: "Ahmed Ali",
    email: "ahmed@example.com",
    phone: "+92 300 1234567",
    city: "Islamabad",
    joinDate: "Oct 15, 2025",
    orders: 3,
    totalSpent: 7500,
    status: "Active"
  },
  {
    id: 2,
    name: "Fatima Khan",
    email: "fatima@example.com",
    phone: "+92 321 9876543",
    city: "Karachi",
    joinDate: "Oct 20, 2025",
    orders: 1,
    totalSpent: 2700,
    status: "Active"
  },
  {
    id: 3,
    name: "Hassan Malik",
    email: "hassan@example.com",
    phone: "+92 333 5555555",
    city: "Lahore",
    joinDate: "Oct 8, 2025",
    orders: 5,
    totalSpent: 14200,
    status: "Active"
  },
  {
    id: 4,
    name: "Ayesha Tariq",
    email: "ayesha@example.com",
    phone: "+92 345 7777777",
    city: "Peshawar",
    joinDate: "Sep 25, 2025",
    orders: 2,
    totalSpent: 5400,
    status: "Active"
  },
  {
    id: 5,
    name: "Bilal Ahmed",
    email: "bilal@example.com",
    phone: "+92 310 4444444",
    city: "Multan",
    joinDate: "Nov 1, 2025",
    orders: 0,
    totalSpent: 0,
    status: "Inactive"
  }
]

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")

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
              <h1 className="text-2xl font-bold text-foreground">Users</h1>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg font-semibold hover:opacity-90 transition-opacity">
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
              />
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-neutral-50 transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {mockUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center font-bold flex-shrink-0">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-foreground">{user.name}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{user.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{user.city}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{user.joinDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 lg:border-l lg:pl-6 border-border">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <ShoppingBag className="w-4 h-4" />
                      <span className="text-xs">Orders</span>
                    </div>
                    <p className="text-xl font-bold text-foreground">{user.orders}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Total Spent</p>
                    <p className="text-xl font-bold text-foreground">
                      Rs. {user.totalSpent.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border flex gap-2">
                <Link
                  href={`/users/${user.id}`}
                  className="px-4 py-2 text-sm font-medium text-foreground bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  View Profile
                </Link>
                <Link
                  href={`/orders?user=${user.id}`}
                  className="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  View Orders
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
