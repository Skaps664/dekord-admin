"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Save, Upload, X, Plus } from "lucide-react"
import Image from "next/image"

export default function NewProductPage() {
  const [productData, setProductData] = useState({
    name: "",
    sku: "",
    price: "",
    comparePrice: "",
    stock: "",
    category: "Cables",
    description: "",
    features: [""],
    specifications: [{ label: "", value: "" }],
    status: "Active"
  })

  const [images, setImages] = useState<string[]>([])

  const addFeature = () => {
    setProductData({ ...productData, features: [...productData.features, ""] })
  }

  const addSpecification = () => {
    setProductData({ ...productData, specifications: [...productData.specifications, { label: "", value: "" }] })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Product data:", productData)
    // Handle product creation
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Add New Product</h1>
            </div>
            <button 
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              <Save className="w-4 h-4" />
              Save Product
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={productData.name}
                    onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                    placeholder="e.g. dekord W-60 USB-C Cable"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      SKU *
                    </label>
                    <input
                      type="text"
                      value={productData.sku}
                      onChange={(e) => setProductData({ ...productData, sku: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                      placeholder="e.g. DKD-W60-BLK-1M"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Category *
                    </label>
                    <select
                      value={productData.category}
                      onChange={(e) => setProductData({ ...productData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                    >
                      <option value="Cables">Cables</option>
                      <option value="Chargers">Chargers</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={productData.description}
                    onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none resize-none"
                    placeholder="Detailed product description..."
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Pricing</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Price (Rs.) *
                  </label>
                  <input
                    type="number"
                    value={productData.price}
                    onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                    placeholder="2500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Compare at Price (Rs.)
                  </label>
                  <input
                    type="number"
                    value={productData.comparePrice}
                    onChange={(e) => setProductData({ ...productData, comparePrice: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                    placeholder="3500"
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">Features</h2>
                <button
                  type="button"
                  onClick={addFeature}
                  className="text-sm font-medium text-foreground hover:underline"
                >
                  + Add Feature
                </button>
              </div>
              <div className="space-y-3">
                {productData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => {
                        const newFeatures = [...productData.features]
                        newFeatures[index] = e.target.value
                        setProductData({ ...productData, features: newFeatures })
                      }}
                      className="flex-1 px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                      placeholder="e.g. 60W Power Delivery"
                    />
                    {productData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newFeatures = productData.features.filter((_, i) => i !== index)
                          setProductData({ ...productData, features: newFeatures })
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">Specifications</h2>
                <button
                  type="button"
                  onClick={addSpecification}
                  className="text-sm font-medium text-foreground hover:underline"
                >
                  + Add Specification
                </button>
              </div>
              <div className="space-y-3">
                {productData.specifications.map((spec, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={spec.label}
                      onChange={(e) => {
                        const newSpecs = [...productData.specifications]
                        newSpecs[index].label = e.target.value
                        setProductData({ ...productData, specifications: newSpecs })
                      }}
                      className="flex-1 px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                      placeholder="Label (e.g. Power)"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => {
                        const newSpecs = [...productData.specifications]
                        newSpecs[index].value = e.target.value
                        setProductData({ ...productData, specifications: newSpecs })
                      }}
                      className="flex-1 px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                      placeholder="Value (e.g. 60W)"
                    />
                    {productData.specifications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newSpecs = productData.specifications.filter((_, i) => i !== index)
                          setProductData({ ...productData, specifications: newSpecs })
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Status</h2>
              <select
                value={productData.status}
                onChange={(e) => setProductData({ ...productData, status: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            {/* Inventory */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Inventory</h2>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  value={productData.stock}
                  onChange={(e) => setProductData({ ...productData, stock: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                  placeholder="150"
                  required
                />
              </div>
            </div>

            {/* Product Images */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Product Images</h2>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-foreground transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG up to 10MB
                </p>
              </div>
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100">
                      <Image src={img} alt={`Product ${index + 1}`} fill className="object-cover" />
                      <button
                        type="button"
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
