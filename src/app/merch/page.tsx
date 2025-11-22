"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { 
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  MoreVertical,
  Loader2
} from "lucide-react"
import { getMerch, deleteMerch } from "@/lib/services/merch"
import type { MerchWithFeatures } from "@/lib/types/database"

export default function MerchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [merch, setMerch] = useState<MerchWithFeatures[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMerch, setSelectedMerch] = useState<string[]>([])

  useEffect(() => {
    loadMerch()
  }, [])

  async function loadMerch() {
    setLoading(true)
    console.log('Loading merch...')
    const { data, error } = await getMerch()
    console.log('Merch data:', data)
    console.log('Merch error:', error)
    
    if (error) {
      console.error('Failed to load merch:', error)
      alert('Failed to load merch: ' + error)
    } else if (data) {
      console.log('Setting merch data:', data.length, 'items')
      setMerch(data)
    }
    
    setLoading(false)
  }  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return
    }

    const { error } = await deleteMerch(id)

    if (error) {
      alert('Failed to delete merch: ' + error)
    } else {
      alert('Merch deleted successfully')
      loadMerch() // Reload the list
    }
  }

  const filteredMerch = merch.filter(item =>
    searchQuery === "" ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Merch</h1>
              <p className="text-sm text-neutral-600">Manage your merchandise catalog</p>
            </div>
            <Link
              href="/merch/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Merch
            </Link>
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
                placeholder="Search merch..."
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

        {/* Merch Grid */}
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Merch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">Loading merch...</p>
                    </td>
                  </tr>
                ) : filteredMerch.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <p className="text-sm text-muted-foreground">
                        {searchQuery ? 'No merch found matching your search' : 'No merch yet. Click "Add Merch" to create one.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredMerch.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-neutral-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedMerch.includes(item.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMerch([...selectedMerch, item.id])
                            } else {
                              setSelectedMerch(selectedMerch.filter(id => id !== item.id))
                            }
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                            {item.image_1 ? (
                              <Image
                                src={item.image_1}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                <Eye className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.features?.length || 0} features</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {item.sku || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        Rs. {item.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {item.quantity_available > 0 ? (
                          <span>{item.quantity_available}</span>
                        ) : (
                          <span className="text-red-600">Out of Stock</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/merch/${item.id}`}
                            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </Link>
                          <Link
                            href={`/merch/${item.id}/edit`}
                            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-muted-foreground" />
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}