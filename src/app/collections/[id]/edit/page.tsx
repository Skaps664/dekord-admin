"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Upload, X, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { getCollection, updateCollection } from "@/lib/services/collections"

export default function EditCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [collectionData, setCollectionData] = useState({
    name: "",
    description: "",
    status: "active",
    meta_title: "",
    meta_description: ""
  })

  const [existingImage, setExistingImage] = useState<string | null>(null)
  const [newImage, setNewImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

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

      setCollectionData({
        name: data.name || "",
        description: data.description || "",
        status: data.status || "active",
        meta_title: data.meta_title || "",
        meta_description: data.meta_description || ""
      })

      if (data.image) {
        setExistingImage(data.image)
      }
    } catch (error) {
      console.error('Error loading collection:', error)
      alert('Failed to load collection')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeNewImage = () => {
    setNewImage(null)
    setImagePreview(null)
  }

  const removeExistingImage = () => {
    setExistingImage(null)
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `collection-${Date.now()}.${fileExt}`
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
    
    if (!collectionData.name) {
      alert('Please enter a collection name')
      return
    }

    setSaving(true)

    try {
      // Determine final image URL
      let finalImageUrl: string | null = existingImage

      // Upload new image if provided
      if (newImage) {
        const uploadedUrl = await uploadImage(newImage)
        if (!uploadedUrl) {
          alert('Failed to upload new image')
          setSaving(false)
          return
        }
        finalImageUrl = uploadedUrl
      }

      // Generate slug from name
      const slug = collectionData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      // Update collection
      const { error } = await updateCollection(id, {
        name: collectionData.name,
        slug: slug,
        description: collectionData.description || null,
        image: finalImageUrl,
        status: collectionData.status,
        meta_title: collectionData.meta_title || null,
        meta_description: collectionData.meta_description || null
      })

      if (error) {
        alert(`Failed to update collection: ${error}`)
        setSaving(false)
        return
      }

      alert('Collection updated successfully!')
      router.push('/collections')
    } catch (error) {
      console.error('Error updating collection:', error)
      alert('An error occurred while updating the collection')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-900 mx-auto mb-4" />
          <p className="text-neutral-600">Loading collection...</p>
        </div>
      </div>
    )
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
              <h1 className="text-2xl font-bold text-neutral-900">Edit Collection</h1>
            </div>
            <button 
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Collection
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Collection Name *
                  </label>
                  <input
                    type="text"
                    value={collectionData.name}
                    onChange={(e) => setCollectionData({ ...collectionData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none"
                    placeholder="e.g. Premium Cables"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Description
                  </label>
                  <textarea
                    value={collectionData.description}
                    onChange={(e) => setCollectionData({ ...collectionData, description: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none resize-none"
                    placeholder="Describe this collection..."
                  />
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">SEO & Meta</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={collectionData.meta_title}
                    onChange={(e) => setCollectionData({ ...collectionData, meta_title: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none"
                    placeholder="Premium USB-C Cables | dekord"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Recommended: 50-60 characters
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={collectionData.meta_description}
                    onChange={(e) => setCollectionData({ ...collectionData, meta_description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none resize-none"
                    placeholder="Shop our premium collection of USB-C cables..."
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Recommended: 150-160 characters
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Status</h2>
              <select
                value={collectionData.status}
                onChange={(e) => setCollectionData({ ...collectionData, status: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Collection Image */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Collection Image</h2>
              
              {/* Existing Image */}
              {existingImage && !imagePreview && (
                <div className="mb-4">
                  <p className="text-xs text-neutral-500 mb-2">Current Image</p>
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-100">
                    <Image src={existingImage} alt="Current collection" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={removeExistingImage}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* New Image Preview */}
              {imagePreview ? (
                <div>
                  <p className="text-xs text-neutral-500 mb-2">New Image</p>
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-100">
                    <Image src={imagePreview} alt="New collection" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={removeNewImage}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="block border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-neutral-900 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-sm text-neutral-600 mb-1">
                    {existingImage ? 'Replace image' : 'Click to upload image'}
                  </p>
                  <p className="text-xs text-neutral-500">
                    PNG, JPG up to 10MB
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
