"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { 
  ArrowLeft, 
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  Edit,
  Loader2,
  User as UserIcon,
  Package
} from "lucide-react"
import { getUser } from "@/lib/services/users"
import { UserWithProfile } from "@/lib/types/database"

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [user, setUser] = useState<UserWithProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    setLoading(true)
    const { data, error } = await getUser(resolvedParams.id)
    
    if (error) {
      console.error('Error loading user:', error)
      alert('Failed to load user')
    } else {
      setUser(data)
    }
    
    setLoading(false)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Link href="/users" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold text-neutral-900">User Not Found</h1>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <UserIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-600">The user you're looking for doesn't exist.</p>
          <Link 
            href="/users"
            className="inline-block mt-4 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Back to Users
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/users" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold text-neutral-900">User Details</h1>
            </div>
            <Link
              href={`/users/${user.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-2xl flex-shrink-0">
                  {getInitials(user)}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">{getDisplayName(user)}</h2>
                  <div className="flex items-center gap-2 text-neutral-600 mb-2">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(user.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-neutral-200">
                {user.profile?.phone && (
                  <div>
                    <div className="flex items-center gap-2 text-neutral-600 mb-1">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm font-medium">Phone</span>
                    </div>
                    <p className="text-neutral-900 font-medium">{user.profile.phone}</p>
                  </div>
                )}
                {user.profile?.city && (
                  <div>
                    <div className="flex items-center gap-2 text-neutral-600 mb-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">Location</span>
                    </div>
                    <p className="text-neutral-900 font-medium">
                      {user.profile.city}{user.profile.province && `, ${user.profile.province}`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            {(user.profile?.address_line1 || user.profile?.address_line2) && (
              <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">Shipping Address</h3>
                <div className="space-y-1 text-neutral-900">
                  {user.profile.address_line1 && <p>{user.profile.address_line1}</p>}
                  {user.profile.address_line2 && <p>{user.profile.address_line2}</p>}
                  <p>
                    {user.profile.city}
                    {user.profile.province && `, ${user.profile.province}`}
                    {user.profile.postal_code && ` ${user.profile.postal_code}`}
                  </p>
                </div>
              </div>
            )}

            {/* Marketing Preferences */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Preferences</h3>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-sm flex items-center justify-center ${
                  user.profile?.marketing_emails 
                    ? 'bg-green-600 text-white' 
                    : 'bg-neutral-200'
                }`}>
                  {user.profile?.marketing_emails && '✓'}
                </div>
                <span className="text-neutral-900">Subscribed to marketing emails</span>
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Order Statistics */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Order Statistics</h3>
              <div className="space-y-4">
                <div className="bg-neutral-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-neutral-600 mb-2">
                    <ShoppingBag className="w-5 h-5" />
                    <span className="text-sm font-medium">Total Orders</span>
                  </div>
                  <p className="text-3xl font-bold text-neutral-900">{user.order_count || 0}</p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-neutral-600 mb-2">
                    <Package className="w-5 h-5" />
                    <span className="text-sm font-medium">Total Spent</span>
                  </div>
                  <p className="text-3xl font-bold text-neutral-900">
                    Rs. {(user.total_spent || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {user.order_count && user.order_count > 0 && (
                  <Link
                    href={`/orders?user=${user.id}`}
                    className="block w-full px-4 py-2 text-center text-sm font-medium text-neutral-900 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                  >
                    View All Orders ({user.order_count})
                  </Link>
                )}
                <Link
                  href={`/users/${user.id}/edit`}
                  className="block w-full px-4 py-2 text-center text-sm font-medium text-neutral-900 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* User Status */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Status</h3>
              <div className="flex items-center justify-center">
                <span className={`px-4 py-2 text-sm font-semibold rounded-full ${
                  user.order_count && user.order_count > 0
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.order_count && user.order_count > 0 ? 'Active Customer' : 'New User'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
