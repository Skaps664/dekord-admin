"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Save, Upload, X, Plus, Loader2 } from "lucide-react"
import Image from "next/image"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { getProduct, updateProduct, createVariant, updateVariant, deleteVariant } from "@/lib/services/products"

interface Collection {
  id: string
  name: string
  slug: string
}

interface Variant {
  id?: string
  length: string
  color: string
  sku: string
  stock: number
  price_override?: number | null
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params?.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [collections, setCollections] = useState<Collection[]>([])
  
  const [productData, setProductData] = useState({
    name: "",
    category: "cables",
    description: "",
    price: "",
    status: "active",
    collection_id: "",
    meta_title: "",
    meta_description: ""
  })

  const [existingImages, setExistingImages] = useState({
    main: "",
    additional: ["", "", "", ""]
  })

  const [newImages, setNewImages] = useState<{
    main: File | null
    additional: (File | null)[]
  }>({
    main: null,
    additional: [null, null, null, null]
  })

  const [imagePreviews, setImagePreviews] = useState<{
    main: string | null
    additional: (string | null)[]
  }>({
    main: null,
    additional: [null, null, null, null]
  })

  const [variants, setVariants] = useState<Variant[]>([])
  const [deletedVariantIds, setDeletedVariantIds] = useState<string[]>([])

  useEffect(() => {
    loadProduct()
    loadCollections()
  }, [productId])

  const loadProduct = async () => {
    if (!productId) return

    const { data, error } = await getProduct(productId)
    
    if (error || !data) {
      alert('Failed to load product')
      router.push('/products')
      return
    }

    // Set product data
    setProductData({
      name: data.name || "",
      category: data.category || "cables",
      description: data.description || "",
      price: data.price?.toString() || "",
      status: data.status || "active",
      collection_id: "", // Will load from collection_products
      meta_title: data.meta_title || "",
      meta_description: data.meta_description || ""
    })

    // Set existing images
    setExistingImages({
      main: data.main_image || "",
      additional: [
        data.image_2 || "",
        data.image_3 || "",
        data.image_4 || "",
        data.image_5 || ""
      ]
    })

    // Set variants
    if (data.variants && data.variants.length > 0) {
      setVariants(data.variants.map((v: any) => ({
        id: v.id,
        length: v.length || "1m",
        color: v.color || "Black",
        sku: v.sku || "",
        stock: v.stock || 0,
        price_override: v.price_override
      })))
    }

    // Load collection
    const { data: collectionData } = await supabase
      .from('collection_products')
      .select('collection_id')
      .eq('product_id', productId)
      .single()
    
    if (collectionData) {
      setProductData(prev => ({ ...prev, collection_id: collectionData.collection_id }))
    }

    setLoading(false)
  }

  const loadCollections = async () => {
    const { data, error } = await supabase
      .from('collections')
      .select('id, name, slug')
      .eq('status', 'active')
      .order('name')
    
    if (error) {
      console.error('Error loading collections:', error)
    } else if (data) {
      setCollections(data)
    }
  }

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewImages({ ...newImages, main: file })
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
      const newImgs = [...newImages.additional]
      newImgs[index] = file
      setNewImages({ ...newImages, additional: newImgs })
      
      const reader = new FileReader()
      reader.onloadend = () => {
        const newPreviews = [...imagePreviews.additional]
        newPreviews[index] = reader.result as string
        setImagePreviews({ ...imagePreviews, additional: newPreviews })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeMainImage = () => {
    setNewImages({ ...newImages, main: null })
    setImagePreviews({ ...imagePreviews, main: null })
    setExistingImages({ ...existingImages, main: "" })
  }

  const removeAdditionalImage = (index: number) => {
    const newImgs = [...newImages.additional]
    newImgs[index] = null
    setNewImages({ ...newImages, additional: newImgs })
    
    const newPreviews = [...imagePreviews.additional]
    newPreviews[index] = null
    setImagePreviews({ ...imagePreviews, additional: newPreviews })

    const newExisting = [...existingImages.additional]
    newExisting[index] = ""
    setExistingImages({ ...existingImages, additional: newExisting })
  }

  const addVariant = () => {
    setVariants([...variants, { length: "1m", color: "Black", sku: "", stock: 0, price_override: null }])
  }

  const removeVariant = (index: number) => {
    const variant = variants[index]
    if (variant.id) {
      setDeletedVariantIds([...deletedVariantIds, variant.id])
    }
    setVariants(variants.filter((_, i) => i !== index))
  }

  const updateVariantField = (index: number, field: keyof Variant, value: string | number) => {
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
    
    if (!productData.collection_id) {
      alert('Please select a collection')
      return
    }

    if (variants.some(v => !v.sku || v.stock < 0)) {
      alert('Please fill in all variant details')
      return
    }

    setSaving(true)

    try {
      // Upload new main image if provided
      let mainImageUrl = existingImages.main
      if (newImages.main) {
        const url = await uploadImage(newImages.main, 'main')
        if (url) mainImageUrl = url
      }

      // Upload new additional images
      const additionalImageUrls = [...existingImages.additional]
      for (let i = 0; i < newImages.additional.length; i++) {
        const file = newImages.additional[i]
        if (file) {
          const url = await uploadImage(file, `additional-${i}`)
          if (url) additionalImageUrls[i] = url
        }
      }

      // Update product
      const { error: productError } = await updateProduct(productId, {
        name: productData.name,
        description: productData.description || null,
        category: productData.category,
        price: parseFloat(productData.price),
        stock: variants.reduce((sum, v) => sum + v.stock, 0),
        status: productData.status,
        main_image: mainImageUrl,
        image_2: additionalImageUrls[0] || null,
        image_3: additionalImageUrls[1] || null,
        image_4: additionalImageUrls[2] || null,
        image_5: additionalImageUrls[3] || null,
        meta_title: productData.meta_title || null,
        meta_description: productData.meta_description || null,
      })

      if (productError) {
        alert(`Failed to update product: ${productError}`)
        setSaving(false)
        return
      }

      // Delete removed variants
      for (const variantId of deletedVariantIds) {
        await deleteVariant(variantId)
      }

      // Update or create variants
      for (const variant of variants) {
        if (variant.id) {
          // Update existing variant
          await updateVariant(variant.id, {
            length: variant.length,
            color: variant.color,
            sku: variant.sku,
            stock: variant.stock,
            price_override: variant.price_override || null,
          })
        } else {
          // Create new variant
          await createVariant({
            product_id: productId,
            length: variant.length,
            color: variant.color,
            sku: variant.sku,
            stock: variant.stock,
            price_override: variant.price_override || null,
            variant_image: null,
            is_available: true
          })
        }
      }

      // Update collection link
      await supabase
        .from('collection_products')
        .delete()
        .eq('product_id', productId)
      
      await supabase
        .from('collection_products')
        .insert({
          collection_id: productData.collection_id,
          product_id: productId,
          sort_order: 0
        })

      alert('Product updated successfully!')
      router.push('/products')
    } catch (error) {
      console.error('Error updating product:', error)
      alert('An error occurred while updating the product')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    )
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
              <h1 className="text-2xl font-bold text-foreground">Edit Product</h1>
            </div>
            <button 
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
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
            {/* Collection Selection */}
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
                    required
                  />
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
                  />
                </div>
              </div>
            </div>

            {/* Variants */}
            <div className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">Product Variants *</h2>
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
                  <div key={index} className="p-4 border border-border rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Length *</label>
                        <select
                          value={variant.length}
                          onChange={(e) => updateVariantField(index, 'length', e.target.value)}
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
                        <label className="block text-sm font-medium text-foreground mb-2">Color *</label>
                        <select
                          value={variant.color}
                          onChange={(e) => updateVariantField(index, 'color', e.target.value)}
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
                        <label className="block text-sm font-medium text-foreground mb-2">SKU *</label>
                        <input
                          type="text"
                          value={variant.sku}
                          onChange={(e) => updateVariantField(index, 'sku', e.target.value)}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Stock *</label>
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariantField(index, 'stock', parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Price Override</label>
                        <input
                          type="number"
                          value={variant.price_override || ''}
                          onChange={(e) => updateVariantField(index, 'price_override', e.target.value ? parseFloat(e.target.value) : '')}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
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
                  <label className="block text-sm font-medium text-foreground mb-2">Meta Title</label>
                  <input
                    type="text"
                    value={productData.meta_title}
                    onChange={(e) => setProductData({ ...productData, meta_title: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Meta Description</label>
                  <textarea
                    value={productData.meta_description}
                    onChange={(e) => setProductData({ ...productData, meta_description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none resize-none"
                  />
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

            {/* Main Image */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Main Image</h2>
              {(imagePreviews.main || existingImages.main) ? (
                <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100">
                  <Image 
                    src={imagePreviews.main || existingImages.main} 
                    alt="Main product" 
                    fill 
                    className="object-cover" 
                  />
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
                  <p className="text-sm text-muted-foreground">Click to upload</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Additional Images */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Additional Images</h2>
              <div className="grid grid-cols-2 gap-3">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index}>
                    {(imagePreviews.additional[index] || existingImages.additional[index]) ? (
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100">
                        <Image 
                          src={imagePreviews.additional[index] || existingImages.additional[index] || ''} 
                          alt={`Additional ${index + 1}`} 
                          fill 
                          className="object-cover" 
                        />
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
                        <p className="text-xs text-muted-foreground">Image {index + 1}</p>
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
