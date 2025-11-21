"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Save, Upload, X, Plus, Loader2, Trash2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { createMerchWithFeatures } from "@/lib/services/merch"

export default function NewMerchPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [merchData, setMerchData] = useState({
    name: "",
    sku: "",
    description: "",
    price: "",
    status: "active",
    quantity_available: "",
    meta_title: "",
    meta_description: ""
  })

  const [images, setImages] = useState<(File | null)[]>([null, null, null, null, null])
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null, null, null, null])
  const [features, setFeatures] = useState<string[]>(["", "", "", ""])

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const newImages = [...images]
      newImages[index] = file
      setImages(newImages)

      const reader = new FileReader()
      reader.onloadend = () => {
        const newPreviews = [...imagePreviews]
        newPreviews[index] = reader.result as string
        setImagePreviews(newPreviews)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages[index] = null
    setImages(newImages)

    const newPreviews = [...imagePreviews]
    newPreviews[index] = null
    setImagePreviews(newPreviews)
  }

  const addFeature = () => {
    setFeatures([...features, ""])
  }

  const removeFeature = (index: number) => {
    if (features.length > 4) {
      setFeatures(features.filter((_, i) => i !== index))
    }
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features]
    newFeatures[index] = value
    setFeatures(newFeatures)
  }

  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${path}-${Date.now()}.${fileExt}`
      const filePath = `merch/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('merch')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return null
      }

      const { data: { publicUrl } } = supabase.storage
        .from('merch')
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
    if (!merchData.name.trim()) {
      alert('Please enter a merch name')
      return
    }

    if (!merchData.price || parseFloat(merchData.price) <= 0) {
      alert('Please enter a valid price')
      return
    }

    if (!merchData.quantity_available || parseInt(merchData.quantity_available) < 0) {
      alert('Please enter a valid quantity')
      return
    }

    if (!images[0]) {
      alert('Please upload at least one image')
      return
    }

    const validFeatures = features.filter(f => f.trim().length > 0)
    if (validFeatures.length < 4) {
      alert('Please enter at least 4 features')
      return
    }

    setLoading(true)

    try {
      // Upload images
      const imageUrls: (string | null)[] = []
      for (let i = 0; i < images.length; i++) {
        const file = images[i]
        if (file) {
          const url = await uploadImage(file, `image-${i}`)
          imageUrls.push(url)
        } else {
          imageUrls.push(null)
        }
      }

      // Generate slug from name
      const slug = merchData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      // Create merch with features
      const { data, error } = await createMerchWithFeatures({
        name: merchData.name,
        slug: slug,
        sku: merchData.sku || null,
        description: merchData.description || null,
        price: parseFloat(merchData.price),
        status: merchData.status,
        quantity_available: parseInt(merchData.quantity_available),
        meta_title: merchData.meta_title || null,
        meta_description: merchData.meta_description || null,
        image_1: imageUrls[0],
        image_2: imageUrls[1],
        image_3: imageUrls[2],
        image_4: imageUrls[3],
        image_5: imageUrls[4],
      }, validFeatures)

      if (error || !data) {
        alert(`Failed to create merch: ${error}`)
        setLoading(false)
        return
      }

      alert('Merch created successfully!')
      router.push('/merch')
    } catch (error) {
      console.error('Error creating merch:', error)
      alert('An error occurred while creating the merch')
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
              <Link href="/merch" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Add New Merch</h1>
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
                  Save Merch
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
            {/* Basic Information */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Merch Name *
                  </label>
                  <input
                    type="text"
                    value={merchData.name}
                    onChange={(e) => setMerchData({ ...merchData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                    placeholder="e.g. Dekord Canvas Tote"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={merchData.sku}
                    onChange={(e) => setMerchData({ ...merchData, sku: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                    placeholder="e.g. DKD-TOTE-001"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Price (Rs.) *
                    </label>
                    <input
                      type="number"
                      value={merchData.price}
                      onChange={(e) => setMerchData({ ...merchData, price: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                      placeholder="1200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Quantity Available *
                    </label>
                    <input
                      type="number"
                      value={merchData.quantity_available}
                      onChange={(e) => setMerchData({ ...merchData, quantity_available: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                      placeholder="50"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={merchData.description}
                    onChange={(e) => setMerchData({ ...merchData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none resize-none"
                    placeholder="Detailed merch description..."
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Features *</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Minimum 4 features required
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addFeature}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-foreground text-background text-sm rounded-lg hover:opacity-90"
                >
                  <Plus className="w-4 h-4" />
                  Add Feature
                </button>
              </div>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                      placeholder={`Feature ${index + 1}`}
                      required
                    />
                    {features.length > 4 && (
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="p-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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
                    Meta Title *
                  </label>
                  <input
                    type="text"
                    value={merchData.meta_title}
                    onChange={(e) => setMerchData({ ...merchData, meta_title: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                    placeholder="Dekord Canvas Tote - Premium Quality Merchandise"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Meta Description *
                  </label>
                  <textarea
                    value={merchData.meta_description}
                    onChange={(e) => setMerchData({ ...merchData, meta_description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none resize-none"
                    placeholder="Shop the official Dekord Canvas Tote. Premium canvas with logo embroidery..."
                    required
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
                value={merchData.status}
                onChange={(e) => setMerchData({ ...merchData, status: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Images */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Images *</h2>
              <p className="text-sm text-muted-foreground mb-4">Upload at least 3 images (up to 5)</p>
              <div className="grid grid-cols-2 gap-3">
                {[0, 1, 2, 3, 4].map((index) => (
                  <div key={index}>
                    {imagePreviews[index] ? (
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100">
                        <Image src={imagePreviews[index]!} alt={`Image ${index + 1}`} fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className={`block aspect-square border-2 border-dashed rounded-lg p-4 text-center hover:border-foreground transition-colors cursor-pointer flex flex-col items-center justify-center ${
                        index < 3 ? 'border-red-300' : 'border-border'
                      }`}>
                        <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                        <p className="text-xs text-muted-foreground">
                          Image {index + 1} {index < 3 ? '*' : ''}
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(index, e)}
                          className="hidden"
                          required={index < 3}
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