"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit2, Trash2, Package } from "lucide-react"
import { getCollection, deleteCollection } from "@/lib/services/collections"

export default function ViewCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [collection, setCollection] = useState<any>(null)

  useEffect(() => {
    loadCollection()
  }, [id])

  const loadCollection = async () => {
    try {
      const { data, error } = await getCollection(id)
      if (error || !data) {
        alert('Collection not found')
        router.push('/collections')
        return
      }

      setCollection(data)
    } catch (error) {
      console.error('Error loading collection:', error)
      alert('Failed to load collection')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${collection?.name}"? This will remove all product associations.`)) {
      return
    }

    const { error } = await deleteCollection(id)
    
    if (error) {
      alert(`Failed to delete collection: ${error}`)
    } else {
      alert('Collection deleted successfully!')
      router.push('/collections')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading collection...</p>
        </div>
      </div>
    )
  }

  if (!collection) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/collections" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">{collection.name}</h1>
                <p className="text-sm text-neutral-600">Collection Details</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/collections/${id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-1">
                    Collection Name
                  </label>
                  <p className="text-base text-neutral-900">{collection.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-1">
                    URL Slug
                  </label>
                  <p className="text-base text-neutral-900 font-mono">{collection.slug}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-1">
                    Description
                  </label>
                  <p className="text-base text-neutral-900">{collection.description || 'No description'}</p>
                </div>
              </div>
            </div>

            {/* SEO */}
            {(collection.meta_title || collection.meta_description) && (
              <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <h2 className="text-lg font-bold text-neutral-900 mb-4">SEO & Meta</h2>
                <div className="space-y-4">
                  {collection.meta_title && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-1">
                        Meta Title
                      </label>
                      <p className="text-base text-neutral-900">{collection.meta_title}</p>
                    </div>
                  )}
                  {collection.meta_description && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-1">
                        Meta Description
                      </label>
                      <p className="text-base text-neutral-900">{collection.meta_description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Products */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">
                Products ({collection.collection_products?.length || 0})
              </h2>
              {collection.collection_products && collection.collection_products.length > 0 ? (
                <div className="space-y-2">
                  {collection.collection_products.map((cp: any) => (
                    <div
                      key={cp.product_id}
                      className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg"
                    >
                      <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center overflow-hidden relative">
                        {cp.products?.images?.[0] ? (
                          <Image
                            src={cp.products.images[0]}
                            alt={cp.products.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-neutral-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-neutral-900">{cp.products?.name || 'Unknown Product'}</p>
                        <p className="text-sm text-neutral-600">
                          Rs. {cp.products?.base_price?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                      <Link
                        href={`/products/${cp.product_id}/edit`}
                        className="text-sm text-neutral-600 hover:text-neutral-900"
                      >
                        View →
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <Package className="w-12 h-12 text-neutral-400 mx-auto mb-2" />
                  <p>No products in this collection</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Status</h2>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  collection.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {collection.status}
              </span>
            </div>

            {/* Collection Image */}
            {collection.image && (
              <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <h2 className="text-lg font-bold text-neutral-900 mb-4">Collection Image</h2>
                <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-100">
                  <Image src={collection.image} alt={collection.name} fill className="object-cover" />
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Metadata</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-neutral-600">Created:</span>
                  <p className="text-neutral-900">
                    {collection.created_at ? new Date(collection.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-neutral-600">Last Updated:</span>
                  <p className="text-neutral-900">
                    {collection.updated_at ? new Date(collection.updated_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
