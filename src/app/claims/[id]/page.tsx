"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Loader2,
  Save,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileWarning,
  Shield,
  MessageSquare,
  Image as ImageIcon,
  AlertTriangle,
  Trash2,
  Eye
} from "lucide-react"
import { getClaim, updateClaimStatus, updateClaimNotes, type Claim } from "@/lib/services/claims"

const statusConfig = {
  "pending": { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "Pending" },
  "under_review": { color: "bg-blue-100 text-blue-800", icon: AlertCircle, label: "Under Review" },
  "approved": { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Approved" },
  "rejected": { color: "bg-red-100 text-red-800", icon: XCircle, label: "Rejected" },
  "resolved": { color: "bg-purple-100 text-purple-800", icon: CheckCircle, label: "Resolved" },
  "cancelled": { color: "bg-gray-100 text-gray-800", icon: XCircle, label: "Cancelled" }
}

const claimTypeConfig = {
  "return": { color: "bg-blue-50 text-blue-700", icon: Package, label: "Return Request" },
  "refund": { color: "bg-amber-50 text-amber-700", icon: FileWarning, label: "Refund Claim" },
  "warranty": { color: "bg-green-50 text-green-700", icon: Shield, label: "Warranty Claim" },
  "complaint": { color: "bg-red-50 text-red-700", icon: MessageSquare, label: "Complaint" }
}

export default function ClaimDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [claim, setClaim] = useState<Claim | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [resolutionNotes, setResolutionNotes] = useState("")
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [selectedStatus, setSelectedStatus] = useState("")

  useEffect(() => {
    loadClaim()
  }, [id])

  const loadClaim = async () => {
    setLoading(true)
    const { data, error } = await getClaim(id)

    if (error || !data) {
      alert('Claim not found')
      router.push('/claims')
      return
    }

    setClaim(data)
    setAdminNotes(data.admin_notes || "")
    setResolutionNotes(data.resolution_notes || "")
    setSelectedStatus(data.status)
    setLoading(false)
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!claim) return
    
    setSelectedStatus(newStatus)
    setSaving(true)
    const { error } = await updateClaimStatus(
      claim.id, 
      newStatus,
      { admin_notes: adminNotes, resolution_notes: resolutionNotes }
    )

    if (error) {
      alert(`Failed to update status: ${error}`)
      setSelectedStatus(claim.status) // Revert on error
    } else {
      alert('Claim status updated successfully!')
      loadClaim()
    }
    setSaving(false)
  }

  const handleNotesUpdate = async () => {
    if (!claim) return

    setSaving(true)
    const { error } = await updateClaimNotes(claim.id, adminNotes, resolutionNotes)

    if (error) {
      alert(`Failed to update notes: ${error}`)
    } else {
      alert('Notes updated successfully!')
      loadClaim()
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-900 mx-auto mb-4" />
          <p className="text-neutral-600">Loading claim...</p>
        </div>
      </div>
    )
  }

  if (!claim) {
    return null
  }

  const statusKey = claim.status as keyof typeof statusConfig
  const typeKey = claim.claim_type as keyof typeof claimTypeConfig
  const config = statusConfig[statusKey] || statusConfig.pending
  const typeConfig = claimTypeConfig[typeKey]
  const StatusIcon = config.icon
  const TypeIcon = typeConfig?.icon || FileWarning

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/claims" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Claim {claim.claim_number}</h1>
                <p className="text-sm text-neutral-600">
                  {new Date(claim.created_at).toLocaleString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 inline-flex items-center gap-2 text-sm font-semibold rounded-full ${config.color}`}>
                <StatusIcon className="w-4 h-4" />
                {config.label}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Claim Details */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-xl ${typeConfig?.color || 'bg-gray-100 text-gray-700'} flex items-center justify-center`}>
                  <TypeIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">{typeConfig?.label || claim.claim_type}</h2>
                  <p className="text-sm text-neutral-600">Order #{claim.order_number}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-700 mb-2">Customer Message</h3>
                  <p className="text-neutral-900 whitespace-pre-wrap bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                    {claim.message}
                  </p>
                </div>

                {/* Images */}
                {claim.images && claim.images.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Attached Images ({claim.images.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {claim.images.map((imageUrl, index) => (
                        <div 
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden border-2 border-neutral-200 hover:border-blue-500 transition-all cursor-pointer group"
                          onClick={() => setSelectedImageIndex(index)}
                        >
                          <img
                            src={imageUrl}
                            alt={`Claim image ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 text-center text-neutral-500">
                    No images uploaded
                  </div>
                )}
              </div>
            </div>

            {/* Admin Notes */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Admin Notes</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Internal Notes
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    placeholder="Add internal notes about this claim..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Resolution Notes
                  </label>
                  <textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    placeholder="Add resolution details and actions taken..."
                  />
                </div>

                <button
                  onClick={handleNotesUpdate}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Notes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Name</p>
                  <p className="text-sm font-medium text-neutral-900">{claim.name}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Email</p>
                  <a href={`mailto:${claim.email}`} className="text-sm text-blue-600 hover:underline">
                    {claim.email}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">WhatsApp</p>
                  <a href={`https://wa.me/${claim.whatsapp_number.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:underline">
                    {claim.whatsapp_number}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">City</p>
                  <p className="text-sm font-medium text-neutral-900">{claim.city}</p>
                </div>
              </div>
            </div>

            {/* Status Management */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Update Status</h2>
              <div className="space-y-3">
                <select
                  value={selectedStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={saving}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {Object.entries(statusConfig).map(([key, conf]) => (
                    <option key={key} value={key}>
                      {conf.label}
                    </option>
                  ))}
                </select>
                <div className={`px-4 py-3 rounded-lg text-sm font-medium text-center ${statusConfig[selectedStatus as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800'}`}>
                  Current: {statusConfig[selectedStatus as keyof typeof statusConfig]?.label || selectedStatus}
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Claim Metadata</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Created</p>
                  <p className="text-neutral-900">{new Date(claim.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Last Updated</p>
                  <p className="text-neutral-900">{new Date(claim.updated_at).toLocaleString()}</p>
                </div>
                {claim.resolved_at && (
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Resolved</p>
                    <p className="text-neutral-900">{new Date(claim.resolved_at).toLocaleString()}</p>
                  </div>
                )}
                {claim.ip_address && (
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">IP Address</p>
                    <p className="text-neutral-900 font-mono text-xs">{claim.ip_address}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImageIndex !== null && claim.images && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImageIndex(null)}
        >
          <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
            <button
              onClick={() => setSelectedImageIndex(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-neutral-200 transition-colors z-10"
            >
              <XCircle className="w-6 h-6 text-neutral-900" />
            </button>
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={claim.images[selectedImageIndex]}
                alt={`Claim image ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
              {selectedImageIndex + 1} / {claim.images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
