"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  ArrowLeft, 
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  Loader2,
  User as UserIcon
} from "lucide-react"
import { getUsers } from "@/lib/services/users"
import { UserWithProfile } from "@/lib/types/database"

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadUsers()
  }, [searchQuery])

  const loadUsers = async () => {
    setLoading(true)
    const { data, error } = await getUsers({ search: searchQuery })
    
    if (error) {
      console.error('Error loading users:', error)
      alert('Failed to load users')
    } else {
      setUsers(data || [])
    }
    
    setLoading(false)
  }

  const getAuthMethod = (user: UserWithProfile) => {
    // Check if user has OAuth provider metadata
    // This would be in raw_user_meta_data if we had access to it
    return user.email?.includes('google') || user.email?.includes('facebook') ? 'OAuth' : 'Email'
  }

  const getInitials = (user: UserWithProfile) => {
    if (user.profile?.full_name) {
      return user.profile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user.email.slice(0, 2).toUpperCase()
  }

  const getDisplayName = (user: UserWithProfile) => {
    return user.profile?.full_name || user.email
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold text-neutral-900">Users</h1>
              <span className="px-2 py-1 text-sm font-medium bg-neutral-100 text-neutral-700 rounded-full">
                {users.length} {users.length === 1 ? 'user' : 'users'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
          </div>
        )}

        {/* Empty State */}
        {!loading && users.length === 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <UserIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No users found</h3>
            <p className="text-neutral-600">
              {searchQuery ? 'Try adjusting your search query' : 'Users will appear here when they sign up'}
            </p>
          </div>
        )}

        {/* Users List */}
        {!loading && users.length > 0 && (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold flex-shrink-0">
                      {getInitials(user)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-neutral-900">{getDisplayName(user)}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.order_count && user.order_count > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.order_count && user.order_count > 0 ? 'Customer' : 'New User'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-neutral-600">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        {user.profile?.phone && (
                          <div className="flex items-center gap-2 text-neutral-600">
                            <Phone className="w-4 h-4" />
                            <span>{user.profile.phone}</span>
                          </div>
                        )}
                        {user.profile?.city && (
                          <div className="flex items-center gap-2 text-neutral-600">
                            <MapPin className="w-4 h-4" />
                            <span>{user.profile.city}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-neutral-600">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 lg:border-l lg:pl-6 border-neutral-200">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-neutral-600 mb-1">
                        <ShoppingBag className="w-4 h-4" />
                        <span className="text-xs">Orders</span>
                      </div>
                      <p className="text-xl font-bold text-neutral-900">{user.order_count || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-neutral-600 mb-1">Total Spent</p>
                      <p className="text-xl font-bold text-neutral-900">
                        Rs. {(user.total_spent || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-200 flex gap-2">
                  <Link
                    href={`/users/${user.id}`}
                    className="px-4 py-2 text-sm font-medium text-neutral-900 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                  >
                    View Profile
                  </Link>
                  {user.order_count && user.order_count > 0 && (
                    <Link
                      href={`/orders?user=${user.id}`}
                      className="px-4 py-2 text-sm font-medium text-neutral-900 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      View Orders ({user.order_count})
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
