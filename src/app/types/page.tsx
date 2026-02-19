"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Pencil, Trash2, Loader2, Layers } from "lucide-react"
import { getProductTypes, deleteProductType } from "@/lib/services/product-types"
import type { ProductType } from "@/lib/types/database"

export default function TypesPage() {
  const [types, setTypes] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTypes()
  }, [])

  const loadTypes = async () => {
    setLoading(true)
    const { data, error } = await getProductTypes()
    if (error) {
      console.error('Error loading types:', error)
    } else if (data) {
      setTypes(data)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the type "${name}"? Products using this type will have their type unset.`)) return

    const { error } = await deleteProductType(id)
    if (error) {
      alert(`Failed to delete type: ${error}`)
    } else {
      setTypes(types.filter(t => t.id !== id))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Product Types</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Define product types with specifications, features, and page sections
              </p>
            </div>
            <Link
              href="/types/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              New Type
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {types.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No product types yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Create product types to define specifications, features, and page layouts for different products.
            </p>
            <Link
              href="/types/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg font-semibold hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              Create First Type
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-neutral-50">
                  <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Name</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Slug</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Specs</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Features</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Showcase</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {types.map((type) => (
                  <tr key={type.id} className="border-b border-border last:border-b-0 hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-foreground">{type.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">{type.slug}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
                        {type.specifications?.length || 0} categories
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
                        {type.feature_cards?.length || 0} cards
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
                        {type.showcase_items?.length || 0} items
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/types/${type.id}/edit`}
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(type.id, type.name)}
                          className="p-2 text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
