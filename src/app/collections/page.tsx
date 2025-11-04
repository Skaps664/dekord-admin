"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Grid3x3,
  Package,
  Loader2
} from "lucide-react"
import { getCollections, deleteCollection } from "@/lib/services/collections"
import { Collection } from "@/lib/types/database"

interface CollectionWithCount extends Collection {
  product_count: number
}

export default function CollectionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [collections, setCollections] = useState<CollectionWithCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCollections()
  }, [])

  const loadCollections = async () => {
    setLoading(true)
    const { data, error } = await getCollections()
    
    if (error) {
      console.error('Failed to load collections:', error)
      alert('Failed to load collections')
    } else if (data) {
      setCollections(data)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will remove all product associations.`)) {
      return
    }

    const { error } = await deleteCollection(id)
    
    if (error) {
      alert(`Failed to delete collection: ${error}`)
    } else {
      alert('Collection deleted successfully!')
      loadCollections()
    }
  }

  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Collections</h1>
              <p className="text-sm text-neutral-600">{collections.length} total collections</p>
            </div>
            <Link
              href="/collections/new"
              className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Collection
            </Link>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all outline-none"
            />
          </div>
        </div>

        {/* Collections Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-neutral-600" />
              <p className="text-sm text-neutral-600">Loading collections...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Collection Image */}
                <div className="bg-neutral-100 h-48 flex items-center justify-center relative">
                  {collection.image ? (
                    <Image src={collection.image} alt={collection.name} fill className="object-cover" />
                  ) : (
                    <div className="text-center">
                      <Grid3x3 className="w-16 h-16 text-neutral-400 mx-auto mb-2" />
                      <p className="text-sm text-neutral-500">No image</p>
                    </div>
                  )}
                </div>

                {/* Collection Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-1">{collection.name}</h3>
                      <p className="text-sm text-neutral-600 line-clamp-2">{collection.description || 'No description'}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        collection.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {collection.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-neutral-600 mb-4">
                    <Package className="w-4 h-4" />
                    <span>{collection.product_count} products</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/collections/${collection.id}`}
                      className="flex-1 px-3 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors text-center text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                    <Link
                      href={`/collections/${collection.id}/edit`}
                      className="flex-1 px-3 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors text-center text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(collection.id, collection.name)}
                      className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCollections.length === 0 && (
          <div className="text-center py-16">
            <Grid3x3 className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No collections found</h3>
            <p className="text-neutral-600 mb-6">
              {searchQuery ? "Try adjusting your search" : "Create your first collection to get started"}
            </p>
            {!searchQuery && (
              <Link
                href="/collections/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Collection
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}