"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Search, 
  Download,
  Trash2,
  Loader2,
  Mail,
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  CheckCircle,
  XCircle,
  Filter
} from "lucide-react"
import { 
  getAllSubscriptions, 
  deleteSubscription, 
  toggleSubscriptionStatus,
  getSubscriptionStats,
  exportSubscriptions
} from "@/lib/services/subscriptions"
import type { EmailSubscription } from "@/lib/types/database"

export default function SubscriptionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [subscriptions, setSubscriptions] = useState<EmailSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [stats, setStats] = useState<{
    totalSubscriptions: number
    activeSubscriptions: number
    inactiveSubscriptions: number
    recentSubscriptions: number
    sourceCount: Record<string, number>
  } | null>(null)

  useEffect(() => {
    loadSubscriptions()
    loadStats()
  }, [])

  async function loadSubscriptions() {
    setLoading(true)
    const { data, error } = await getAllSubscriptions()
    
    if (error) {
      console.error('Failed to load subscriptions:', error)
      alert('Failed to load subscriptions')
    } else if (data) {
      setSubscriptions(data)
    }
    
    setLoading(false)
  }

  async function loadStats() {
    const { data, error } = await getSubscriptionStats()
    
    if (error) {
      console.error('Failed to load stats:', error)
    } else if (data) {
      setStats(data)
    }
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Are you sure you want to delete subscription for "${email}"?`)) {
      return
    }

    const { error } = await deleteSubscription(id)
    
    if (error) {
      alert('Failed to delete subscription: ' + error)
    } else {
      alert('Subscription deleted successfully')
      loadSubscriptions()
      loadStats()
    }
  }

  async function handleToggleStatus(id: string, currentStatus: boolean) {
    const { error } = await toggleSubscriptionStatus(id, !currentStatus)
    
    if (error) {
      alert('Failed to update subscription: ' + error)
    } else {
      loadSubscriptions()
      loadStats()
    }
  }

  async function handleExport(activeOnly: boolean = false) {
    const { data, error } = await exportSubscriptions(activeOnly)
    
    if (error || !data) {
      alert('Failed to export subscriptions')
      return
    }

    // Create CSV
    const headers = ['Email', 'Status', 'Source', 'Subscribed At', 'Unsubscribed At']
    const rows = data.map(sub => [
      sub.email,
      sub.is_active ? 'Active' : 'Inactive',
      sub.source,
      new Date(sub.subscribed_at).toLocaleString(),
      sub.unsubscribed_at ? new Date(sub.unsubscribed_at).toLocaleString() : 'N/A'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscriptions-${activeOnly ? 'active-' : ''}${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = searchQuery === "" || 
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.source.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && sub.is_active) ||
      (filterStatus === 'inactive' && !sub.is_active)

    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Email Subscriptions</h1>
              <p className="text-sm text-neutral-600">Manage your newsletter subscribers</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleExport(true)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg font-semibold hover:bg-neutral-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Active
              </button>
              <button
                onClick={() => handleExport(false)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export All
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-border p-6"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Total Subscribers</p>
                  <p className="text-2xl font-bold text-neutral-900">{stats.totalSubscriptions}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-border p-6"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Active</p>
                  <p className="text-2xl font-bold text-neutral-900">{stats.activeSubscriptions}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-border p-6"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-lg">
                  <UserX className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Unsubscribed</p>
                  <p className="text-2xl font-bold text-neutral-900">{stats.inactiveSubscriptions}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl border border-border p-6"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Last 7 Days</p>
                  <p className="text-2xl font-bold text-neutral-900">{stats.recentSubscriptions}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by email or source..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 border rounded-lg transition-colors ${
                  filterStatus === 'all'
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "border-border hover:bg-neutral-50"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-2 border rounded-lg transition-colors flex items-center gap-2 ${
                  filterStatus === 'active'
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "border-border hover:bg-neutral-50"
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                Active
              </button>
              <button
                onClick={() => setFilterStatus('inactive')}
                className={`px-4 py-2 border rounded-lg transition-colors flex items-center gap-2 ${
                  filterStatus === 'inactive'
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "border-border hover:bg-neutral-50"
                }`}
              >
                <XCircle className="w-4 h-4" />
                Inactive
              </button>
            </div>
          </div>
        </div>

        {/* Subscriptions List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <Mail className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No subscriptions found</h3>
            <p className="text-neutral-600">
              {searchQuery || filterStatus !== 'all' ? "Try adjusting your filters" : "Subscriptions will appear here once users sign up"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-border">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Subscribed At
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSubscriptions.map((subscription, index) => (
                    <motion.tr
                      key={subscription.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-neutral-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-neutral-400" />
                          <span className="text-sm font-medium text-neutral-900">
                            {subscription.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(subscription.id, subscription.is_active)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            subscription.is_active
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          } transition-colors`}
                        >
                          {subscription.is_active ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-neutral-600 capitalize">
                          {subscription.source.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-neutral-600">
                          {formatDate(subscription.subscribed_at)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDelete(subscription.id, subscription.email)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete subscription"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
