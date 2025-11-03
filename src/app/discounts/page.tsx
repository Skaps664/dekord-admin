"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Tag,
  Percent,
  Calendar,
  Copy,
  Check
} from "lucide-react"

type Discount = {
  id: string
  code: string
  type: "percentage" | "fixed"
  value: number
  description: string
  minOrder?: number
  maxDiscount?: number
  usageLimit?: number
  usedCount: number
  startDate: string
  endDate: string
  status: "active" | "expired" | "scheduled"
}

export default function DiscountsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [discounts, setDiscounts] = useState<Discount[]>([
    {
      id: "1",
      code: "WELCOME10",
      type: "percentage",
      value: 10,
      description: "10% off for new customers",
      minOrder: 1000,
      usageLimit: 100,
      usedCount: 23,
      startDate: "2025-11-01",
      endDate: "2025-12-31",
      status: "active",
    },
    {
      id: "2",
      code: "FLAT500",
      type: "fixed",
      value: 500,
      description: "Rs. 500 off on orders above Rs. 3000",
      minOrder: 3000,
      usageLimit: 50,
      usedCount: 12,
      startDate: "2025-11-01",
      endDate: "2025-11-30",
      status: "active",
    },
    {
      id: "3",
      code: "BLACKFRIDAY",
      type: "percentage",
      value: 25,
      description: "25% off Black Friday sale",
      maxDiscount: 2000,
      usageLimit: 200,
      usedCount: 0,
      startDate: "2025-11-29",
      endDate: "2025-11-30",
      status: "scheduled",
    },
  ])

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this discount?")) {
      setDiscounts(discounts.filter((d) => d.id !== id))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "expired":
        return "bg-red-100 text-red-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredDiscounts = discounts.filter((discount) =>
    discount.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    discount.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Discounts & Deals</h1>
              <p className="text-sm text-neutral-600">{discounts.length} total discount codes</p>
            </div>
            <Link
              href="/discounts/new"
              className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Create Discount
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
              placeholder="Search discount codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all outline-none"
            />
          </div>
        </div>

        {/* Discounts List */}
        <div className="space-y-4">
          {filteredDiscounts.map((discount, index) => (
            <motion.div
              key={discount.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {discount.type === "percentage" ? (
                      <Percent className="w-6 h-6 text-neutral-700" />
                    ) : (
                      <Tag className="w-6 h-6 text-neutral-700" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        onClick={() => handleCopyCode(discount.code)}
                        className="flex items-center gap-2 px-3 py-1 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors font-mono text-sm"
                      >
                        {discount.code}
                        {copiedCode === discount.code ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(discount.status)}`}>
                        {discount.status}
                      </span>
                    </div>
                    <p className="text-neutral-900 font-medium mb-1">{discount.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
                      <span>
                        {discount.type === "percentage"
                          ? `${discount.value}% off`
                          : `Rs. ${discount.value.toLocaleString()} off`}
                      </span>
                      {discount.minOrder && <span>• Min. order: Rs. {discount.minOrder.toLocaleString()}</span>}
                      {discount.maxDiscount && <span>• Max discount: Rs. {discount.maxDiscount.toLocaleString()}</span>}
                      {discount.usageLimit && (
                        <span>
                          • Used: {discount.usedCount}/{discount.usageLimit}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-sm text-neutral-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(discount.startDate).toLocaleDateString()} -{" "}
                        {new Date(discount.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/discounts/${discount.id}/edit`}
                    className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(discount.id)}
                    className="p-2 text-neutral-600 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Usage Progress */}
              {discount.usageLimit && (
                <div className="mt-4">
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className="bg-neutral-900 h-2 rounded-full transition-all"
                      style={{ width: `${(discount.usedCount / discount.usageLimit) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDiscounts.length === 0 && (
          <div className="text-center py-16">
            <Tag className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No discounts found</h3>
            <p className="text-neutral-600 mb-6">
              {searchQuery ? "Try adjusting your search" : "Create your first discount code to get started"}
            </p>
            {!searchQuery && (
              <Link
                href="/discounts/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Create Discount
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
