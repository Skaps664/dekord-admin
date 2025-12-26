"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  Search, 
  Filter,
  Eye,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  FileWarning,
  Shield,
  MessageSquare,
  Loader2,
  TrendingUp,
  AlertTriangle
} from "lucide-react"
import { getClaims, getClaimStats, type Claim } from "@/lib/services/claims"

const statusConfig = {
  "pending": { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "Pending" },
  "under_review": { color: "bg-blue-100 text-blue-800", icon: AlertCircle, label: "Under Review" },
  "approved": { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Approved" },
  "rejected": { color: "bg-red-100 text-red-800", icon: XCircle, label: "Rejected" },
  "resolved": { color: "bg-purple-100 text-purple-800", icon: CheckCircle, label: "Resolved" },
  "cancelled": { color: "bg-gray-100 text-gray-800", icon: XCircle, label: "Cancelled" }
}

const claimTypeConfig = {
  "return": { color: "bg-blue-50 text-blue-700", icon: Package, label: "Return" },
  "refund": { color: "bg-amber-50 text-amber-700", icon: FileWarning, label: "Refund" },
  "warranty": { color: "bg-green-50 text-green-700", icon: Shield, label: "Warranty" },
  "complaint": { color: "bg-red-50 text-red-700", icon: MessageSquare, label: "Complaint" }
}

export default function ClaimsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [selectedType, setSelectedType] = useState("All")
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    loadClaims()
    loadStats()
  }, [selectedStatus, selectedType, searchQuery])

  const loadClaims = async () => {
    setLoading(true)
    const { data, error } = await getClaims({
      status: selectedStatus,
      claimType: selectedType,
      search: searchQuery
    })
    
    if (error) {
      console.error('Failed to load claims:', error)
      alert('Failed to load claims')
    } else if (data) {
      setClaims(data)
    }
    setLoading(false)
  }

  const loadStats = async () => {
    const { data } = await getClaimStats()
    if (data) {
      setStats(data)
    }
  }

  const exportToCSV = (claimsToExport: Claim[]) => {
    const headers = [
      'Claim Number',
      'Customer Name',
      'Email',
      'WhatsApp',
      'City',
      'Order Number',
      'Claim Type',
      'Status',
      'Message',
      'Images Count',
      'Created At',
      'Updated At'
    ]

    const csvData = claimsToExport.map(claim => {
      return [
        claim.claim_number,
        claim.name,
        claim.email,
        claim.whatsapp_number,
        claim.city,
        claim.order_number,
        claim.claim_type,
        claim.status,
        `"${claim.message.replace(/"/g, '""')}"`,
        claim.images?.length || 0,
        new Date(claim.created_at).toLocaleString(),
        new Date(claim.updated_at).toLocaleString()
      ]
    })

    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `claims_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Claims</h1>
              <p className="text-sm text-neutral-600">Manage customer claims and requests</p>
            </div>
            <button 
              onClick={() => exportToCSV(claims)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Claims
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-xl border border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Total Claims</p>
                  <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileWarning className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.byStatus.pending || 0}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Under Review</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.byStatus.under_review || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.byStatus.resolved || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by claim number, customer name, email, or order number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <p className="text-sm font-semibold text-neutral-700 mb-2">Filter by Status</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedStatus('All')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    selectedStatus === 'All'
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  All
                </button>
                {Object.entries(statusConfig).map(([key, config]) => {
                  const Icon = config.icon
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedStatus(key)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                        selectedStatus === key
                          ? config.color.replace('100', '600').replace('800', 'white') + ' shadow-md'
                          : config.color + ' hover:shadow-sm'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {config.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <p className="text-sm font-semibold text-neutral-700 mb-2">Filter by Type</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedType('All')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    selectedType === 'All'
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  All Types
                </button>
                {Object.entries(claimTypeConfig).map(([key, config]) => {
                  const Icon = config.icon
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedType(key)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                        selectedType === key
                          ? config.color.replace('50', '600').replace('700', 'white') + ' shadow-md'
                          : config.color + ' hover:shadow-sm'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {config.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Claims Table */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Claim #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-neutral-400 mx-auto mb-2" />
                      <p className="text-neutral-500">Loading claims...</p>
                    </td>
                  </tr>
                ) : claims.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-neutral-500">
                      No claims found
                    </td>
                  </tr>
                ) : (
                  claims.map((claim) => {
                    const statusKey = claim.status as keyof typeof statusConfig
                    const typeKey = claim.claim_type as keyof typeof claimTypeConfig
                    const statusConf = statusConfig[statusKey]
                    const typeConf = claimTypeConfig[typeKey]
                    const StatusIcon = statusConf?.icon || Clock
                    const TypeIcon = typeConf?.icon || FileWarning

                    return (
                      <tr key={claim.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-neutral-900">{claim.claim_number}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-neutral-900">{claim.name}</div>
                          <div className="text-xs text-neutral-500">{claim.email}</div>
                          <div className="text-xs text-neutral-500">{claim.whatsapp_number}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-900">{claim.order_number}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${typeConf?.color || 'bg-gray-100 text-gray-800'}`}>
                            <TypeIcon className="w-3.5 h-3.5" />
                            {typeConf?.label || claim.claim_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConf?.color || 'bg-gray-100 text-gray-800'}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConf?.label || claim.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                          {new Date(claim.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/claims/${claim.id}`}
                            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
