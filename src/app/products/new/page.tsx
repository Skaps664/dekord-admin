"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Save, Upload, X, Plus, Loader2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { createProduct, createVariant } from "@/lib/services/products"
import { getProductTypes } from "@/lib/services/product-types"
import type { ProductType } from "@/lib/types/database"

interface Collection {
  id: string
  name: string
  slug: string
}

interface Variant {
  length: string
  color: string
  sku: string
  stock: number
  price_override?: number
}

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [collections, setCollections] = useState<Collection[]>([])
  const [productTypes, setProductTypes] = useState<ProductType[]>([])
  
  const [productData, setProductData] = useState({
    name: "",
    sku: "",
    category: "cables",
    description: "",
    price: "",
    status: "active",
    availability: "in_stock",
    collection_id: "",
    type_id: "",
    meta_title: "",
    meta_description: ""
  })

  const [images, setImages] = useState<{
    main: File | null
    hero: File | null
    additional: (File | null)[]
  }>({
    main: null,
    hero: null,
    additional: [null, null, null, null]
  })

  const [imagePreviews, setImagePreviews] = useState<{
    main: string | null
    hero: string | null
    additional: (string | null)[]
  }>({
    main: null,
    hero: null,
    additional: [null, null, null, null]
  })

  const [variants, setVariants] = useState<Variant[]>([
    { length: "1m", color: "Black", sku: "", stock: 0, price_override: undefined }
  ])

  // Load collections and types on mount
  useEffect(() => {
    loadCollections()
    loadProductTypes()
  }, [])

  const loadCollections = async () => {
    const { data, error } = await supabase
      .from('collections')
      .select('id, name, slug')
      .eq('status', 'active')
      .order('name')
    
    if (error) {
      console.error('Error loading collections:', error)
      alert('Failed to load collections')
    } else if (data) {
      setCollections(data)
    }
  }

  const loadProductTypes = async () => {
    const { data, error } = await getProductTypes()
    if (error) {
      console.error('Error loading product types:', error)
    } else if (data) {
      setProductTypes(data)
    }
  }

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImages({ ...images, main: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews({ ...imagePreviews, main: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAdditionalImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const newImages = [...images.additional]
      newImages[index] = file
      setImages({ ...images, additional: newImages })
      
      const reader = new FileReader()
      reader.onloadend = () => {
        const newPreviews = [...imagePreviews.additional]
        newPreviews[index] = reader.result as string
        setImagePreviews({ ...imagePreviews, additional: newPreviews })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImages({ ...images, hero: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews({ ...imagePreviews, hero: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeMainImage = () => {
    setImages({ ...images, main: null })
    setImagePreviews({ ...imagePreviews, main: null })
  }

  const removeHeroImage = () => {
    setImages({ ...images, hero: null })
    setImagePreviews({ ...imagePreviews, hero: null })
  }

  const removeAdditionalImage = (index: number) => {
    const newImages = [...images.additional]
    newImages[index] = null
    setImages({ ...images, additional: newImages })
    
    const newPreviews = [...imagePreviews.additional]
    newPreviews[index] = null
    setImagePreviews({ ...imagePreviews, additional: newPreviews })
  }

  const addVariant = () => {
    setVariants([...variants, { length: "1m", color: "Black", sku: "", stock: 0, price_override: undefined }])
  }

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index))
    }
  }

  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    const newVariants = [...variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setVariants(newVariants)
  }

  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${path}-${Date.now()}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return null
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!productData.collection_id) {
      alert('Please select a collection')
      return
    }
    
    if (!images.main) {
      alert('Please upload a main product image')
      return
    }

    if (variants.some(v => !v.sku || v.stock < 0)) {
      alert('Please fill in all variant details (SKU and stock)')
      return
    }

    setLoading(true)

    try {
      // Upload main image
      const mainImageUrl = await uploadImage(images.main, 'main')
      if (!mainImageUrl) {
        alert('Failed to upload main image')
        setLoading(false)
        return
      }

      // Upload hero image
      let heroImageUrl: string | null = null
      if (images.hero) {
        heroImageUrl = await uploadImage(images.hero, 'hero')
      }

      // Upload additional images
      const additionalImageUrls: (string | null)[] = []
      for (let i = 0; i < images.additional.length; i++) {
        const file = images.additional[i]
        if (file) {
          const url = await uploadImage(file, `additional-${i}`)
          additionalImageUrls.push(url)
        } else {
          additionalImageUrls.push(null)
        }
      }

      // Generate slug from name
      const slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      // Create product
      const { data: product, error: productError } = await createProduct({
        name: productData.name,
        slug: slug,
        sku: productData.sku,
        description: productData.description || null,
        category: productData.category,
        price: parseFloat(productData.price),
        stock: variants.reduce((sum, v) => sum + v.stock, 0),
        status: productData.status,
        availability: productData.availability as 'in_stock' | 'out_of_stock' | 'coming_soon',
        type_id: productData.type_id || null,
        main_image: mainImageUrl,
        hero_image: heroImageUrl,
        image_2: additionalImageUrls[0],
        image_3: additionalImageUrls[1],
        image_4: additionalImageUrls[2],
        image_5: additionalImageUrls[3],
        meta_title: productData.meta_title || null,
        meta_description: productData.meta_description || null,
        og_image: null,
      })

      if (productError || !product) {
        alert(`Failed to create product: ${productError}`)
        setLoading(false)
        return
      }

      // Create variants
      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i]
        const { error: variantError } = await createVariant({
          product_id: product.id,
          length: variant.length,
          color: variant.color,
          sku: variant.sku,
          stock: variant.stock,
          price_override: variant.price_override || null,
          variant_image: null,
          is_available: true,
          is_default: i === 0 // First variant is the base/default
        })

        if (variantError) {
          console.error('Error creating variant:', variantError)
        }
      }

      // Link product to collection
      const { error: linkError } = await supabase
        .from('collection_products')
        .insert({
          collection_id: productData.collection_id,
          product_id: product.id,
          sort_order: 0
        })

      if (linkError) {
        console.error('Error linking to collection:', linkError)
      }

      alert('Product created successfully!')
      router.push('/products')
    } catch (error) {
      console.error('Error creating product:', error)
      alert('An error occurred while creating the product')
    } finally {
      setLoading(false)
    }
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
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Product
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Collection Selection - FIRST & REQUIRED */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Collection *</h2>
              <select
                value={productData.collection_id}
                onChange={(e) => setProductData({ ...productData, collection_id: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                required
              >
                <option value="">Select a collection</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
              </select>
              {collections.length === 0 && (
                <p className="text-sm text-red-600 mt-2">
                  No collections found. Please create a collection first.
                </p>
              )}
            </div>

            {/* Product Type Selection */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Product Type</h2>
              <select
                value={productData.type_id}
                onChange={(e) => setProductData({ ...productData, type_id: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
              >
                <option value="">Select a product type (optional)</option>
                {productTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Product type determines specifications, features, and page sections displayed on the product page.
              </p>
              {productTypes.length === 0 && (
                <p className="text-sm text-amber-600 mt-2">
                  No types found. <Link href="/types/new" className="underline">Create a type</Link> to define product page sections.
                </p>
              )}
            </div>

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
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Product SKU *
                  </label>
                  <input
                    type="text"
                    value={productData.sku}
                    onChange={(e) => setProductData({ ...productData, sku: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                    placeholder="e.g. DKD-W60"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Unique identifier for this product
                  </p>
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
                    <option value="cables">Cables</option>
                    <option value="chargers">Chargers</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Base Price (Rs.) *
                  </label>
                  <input
                    type="number"
                    value={productData.price}
                    onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                    placeholder="2500"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This is the base price. Variants can have their own price overrides.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={productData.description}
                    onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none resize-none"
                    placeholder="Detailed product description with features, specifications, and benefits..."
                  />
                </div>
              </div>
            </div>

            {/* Variants */}
            <div className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Product Variants *</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    First variant is the base/default variant shown on catalog page
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-foreground text-background text-sm rounded-lg hover:opacity-90"
                >
                  <Plus className="w-4 h-4" />
                  Add Variant
                </button>
              </div>
              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg relative">
                    {index === 0 && (
                      <div className="absolute -top-2 left-4 px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded">
                        Base Variant
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Length *
                        </label>
                        <select
                          value={variant.length}
                          onChange={(e) => updateVariant(index, 'length', e.target.value)}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                        >
                          <option value="0.5m">0.5m</option>
                          <option value="1m">1m</option>
                          <option value="1.5m">1.5m</option>
                          <option value="2m">2m</option>
                          <option value="3m">3m</option>
                          <option value="5m">5m</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Color *
                        </label>
                        <select
                          value={variant.color}
                          onChange={(e) => updateVariant(index, 'color', e.target.value)}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                        >
                          <option value="Black">Black</option>
                          <option value="White">White</option>
                          <option value="Red">Red</option>
                          <option value="Blue">Blue</option>
                          <option value="Green">Green</option>
                          <option value="Army Green">Army Green</option>
                          <option value="Yellow">Yellow</option>
                          <option value="Purple">Purple</option>
                          <option value="Pink">Pink</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          SKU *
                        </label>
                        <input
                          type="text"
                          value={variant.sku}
                          onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                          placeholder="e.g. DKD-W60-BLK-1M"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Stock *
                        </label>
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                          placeholder="50"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Price Override (Optional)
                        </label>
                        <input
                          type="number"
                          value={variant.price_override || ''}
                          onChange={(e) => updateVariant(index, 'price_override', e.target.value ? parseFloat(e.target.value) : '')}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                          placeholder="Leave empty to use base price"
                        />
                      </div>
                      <div className="flex items-end">
                        {variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="w-full px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SEO */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">SEO & Meta</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={productData.meta_title}
                    onChange={(e) => setProductData({ ...productData, meta_title: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                    placeholder="Buy dekord W-60 USB-C Cable | Fast Charging Cable"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 50-60 characters. Leave empty to auto-generate.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={productData.meta_description}
                    onChange={(e) => setProductData({ ...productData, meta_description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none resize-none"
                    placeholder="Premium 60W USB-C cable with braided design. Fast charging and data transfer. Available in multiple colors and lengths."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 150-160 characters. Leave empty to auto-generate.
                  </p>
                </div>
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
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Availability */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Availability</h2>
              <div className="space-y-2">
                {[
                  { value: 'in_stock', label: 'In Stock', color: 'bg-green-500', desc: 'Available for purchase' },
                  { value: 'out_of_stock', label: 'Out of Stock', color: 'bg-red-500', desc: 'Not available for purchase' },
                  { value: 'coming_soon', label: 'Coming Soon', color: 'bg-purple-500', desc: 'Pre-launch / Pre-order mode' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      productData.availability === option.value
                        ? 'border-foreground bg-foreground/5'
                        : 'border-border hover:border-foreground/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="availability"
                      value={option.value}
                      checked={productData.availability === option.value}
                      onChange={(e) => setProductData({ ...productData, availability: e.target.value })}
                      className="sr-only"
                    />
                    <div className={`w-3 h-3 rounded-full ${option.color}`} />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Main Image * <span className="text-xs font-normal text-muted-foreground">(Product card thumbnail)</span></h2>
              {imagePreviews.main ? (
                <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100">
                  <Image src={imagePreviews.main} alt="Main product" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={removeMainImage}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="block border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-foreground transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Click to upload main image
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG up to 10MB
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Hero Banner Image */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Hero Banner Image <span className="text-xs font-normal text-muted-foreground">(Product page hero)</span></h2>
              {imagePreviews.hero ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-100">
                  <Image src={imagePreviews.hero} alt="Hero banner" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={removeHeroImage}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="block border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-foreground transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Click to upload hero banner
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Wide banner shown on product page hero section
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeroImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Additional Images */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Additional Images</h2>
              <p className="text-sm text-muted-foreground mb-4">Upload up to 4 additional images</p>
              <div className="grid grid-cols-2 gap-3">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index}>
                    {imagePreviews.additional[index] ? (
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100">
                        <Image src={imagePreviews.additional[index]!} alt={`Additional ${index + 1}`} fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => removeAdditionalImage(index)}
                          className="absolute top-1 right-1 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="block aspect-square border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-foreground transition-colors cursor-pointer flex flex-col items-center justify-center">
                        <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                        <p className="text-xs text-muted-foreground">
                          Image {index + 1}
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleAdditionalImageChange(index, e)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
