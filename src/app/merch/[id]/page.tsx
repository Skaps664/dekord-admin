"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Eye,
  Package,
  DollarSign,
  Hash,
  Calendar,
  ImageIcon,
  Star
} from "lucide-react"
import { getMerchItem, deleteMerch } from "@/lib/services/merch"
import type { MerchWithFeatures } from "@/lib/types/database"

export default function MerchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [merch, setMerch] = useState<MerchWithFeatures | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMerch()
  }, [params.id])

  async function loadMerch() {
    if (!params.id) return

    setLoading(true)
    const { data, error } = await getMerchItem(params.id as string)

    if (error) {
      console.error('Failed to load merch:', error)
      alert('Failed to load merch item')
    } else if (data) {
      setMerch(data)
    }

    setLoading(false)
  }

  async function handleDelete() {
    if (!merch) return

    if (!confirm(`Are you sure you want to delete "${merch.name}"?`)) {
      return
    }

    const { error } = await deleteMerch(merch.id)

    if (error) {
      alert('Failed to delete merch: ' + error)
    } else {
      alert('Merch deleted successfully')
      router.push('/merch')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto mb-4"></div>
          <p className="text-sm text-neutral-600">Loading merch item...</p>
        </div>
      </div>
    )
  }

  if (!merch) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-600">Merch item not found</p>
          <Link
            href="/merch"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Merch
          </Link>
        </div>
      </div>
    )
  }

  const images = [merch.image_1, merch.image_2, merch.image_3, merch.image_4, merch.image_5].filter(Boolean) as string[]

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/merch"
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-neutral-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">{merch.name}</h1>
                <p className="text-sm text-neutral-600">Merch Item Details</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/merch/${merch.id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Merch
              </Link>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg font-semibold hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Images
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100">
                    <Image
                      src={image}
                      alt={`${merch.name} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
                {images.length === 0 && (
                  <div className="col-span-full flex items-center justify-center py-12 text-neutral-400">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Basic Information
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-sm text-foreground">{merch.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Slug</label>
                  <p className="text-sm text-foreground font-mono">{merch.slug}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">SKU</label>
                  <p className="text-sm text-foreground font-mono">{merch.sku || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    merch.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : merch.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {merch.status.charAt(0).toUpperCase() + merch.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing & Inventory
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Price</label>
                  <p className="text-lg font-semibold text-foreground">Rs. {merch.price.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Quantity Available</label>
                  <p className="text-sm text-foreground">{merch.quantity_available}</p>
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Star className="w-5 h-5" />
                SEO Information
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Meta Title</label>
                  <p className="text-sm text-foreground">{merch.meta_title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Meta Description</label>
                  <p className="text-sm text-foreground">{merch.meta_description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-8 bg-white rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Description</h2>
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground whitespace-pre-wrap">{merch.description || 'No description provided.'}</p>
          </div>
        </div>

        {/* Features */}
        {merch.features && merch.features.length > 0 && (
          <div className="mt-8 bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {merch.features.map((feature, index) => (
                <div key={feature.id} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
                  <div className="w-6 h-6 bg-neutral-900 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-sm text-foreground">{feature.feature}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="mt-8 bg-white rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Timestamps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <p className="text-sm text-foreground">{new Date(merch.created_at).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
              <p className="text-sm text-foreground">{new Date(merch.updated_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}