"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Upload, X, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { getBlogPost, updateBlogPost } from "@/lib/services/blog"
import { BlogPost } from "@/lib/types/database"
import RichTextEditor from "@/components/rich-text-editor"

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  
  const [postData, setPostData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author_name: "dekord Team",
    category: "",
    status: "draft",
    meta_title: "",
    meta_description: "",
    featured: false
  })

  const [currentFeaturedImage, setCurrentFeaturedImage] = useState<string | null>(null)
  const [featuredImage, setFeaturedImage] = useState<File | null>(null)
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null)
  
  const [currentOgImage, setCurrentOgImage] = useState<string | null>(null)
  const [ogImage, setOgImage] = useState<File | null>(null)
  const [ogImagePreview, setOgImagePreview] = useState<string | null>(null)

  useEffect(() => {
    loadBlogPost()
  }, [])

  const loadBlogPost = async () => {
    try {
      const { data, error } = await getBlogPost(resolvedParams.id)
      
      if (error || !data) {
        alert('Failed to load blog post')
        router.push('/blog')
        return
      }

      setPostData({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || "",
        content: data.content,
        author_name: data.author_name || "dekord Team",
        category: data.category || "",
        status: data.status,
        meta_title: data.meta_title || "",
        meta_description: data.meta_description || "",
        featured: data.featured || false
      })

      setCurrentFeaturedImage(data.featured_image)
      setCurrentOgImage(data.og_image)
    } catch (error) {
      console.error('Error loading blog post:', error)
      alert('An error occurred while loading the blog post')
      router.push('/blog')
    } finally {
      setFetching(false)
    }
  }

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFeaturedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFeaturedImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleOgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setOgImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setOgImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeFeaturedImage = () => {
    setFeaturedImage(null)
    setFeaturedImagePreview(null)
    setCurrentFeaturedImage(null)
  }

  const removeOgImage = () => {
    setOgImage(null)
    setOgImagePreview(null)
    setCurrentOgImage(null)
  }

  const uploadImage = async (file: File, folder: string = 'blog'): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${folder}-${Date.now()}.${fileExt}`
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

  const handleTitleChange = (title: string) => {
    setPostData({
      ...postData,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!postData.title || !postData.content) {
      alert('Please enter title and content')
      return
    }

    setLoading(true)

    try {
      // Upload new featured image if changed
      let featuredImageUrl = currentFeaturedImage
      if (featuredImage) {
        const uploadedUrl = await uploadImage(featuredImage, 'blog-featured')
        if (!uploadedUrl) {
          alert('Failed to upload featured image')
          setLoading(false)
          return
        }
        featuredImageUrl = uploadedUrl
      }

      // Upload new OG image if changed
      let ogImageUrl = currentOgImage
      if (ogImage) {
        const uploadedUrl = await uploadImage(ogImage, 'blog-og')
        if (!uploadedUrl) {
          alert('Failed to upload OG image')
          setLoading(false)
          return
        }
        ogImageUrl = uploadedUrl
      }

      // Update blog post
      const { error } = await updateBlogPost(resolvedParams.id, {
        title: postData.title,
        slug: postData.slug,
        excerpt: postData.excerpt || null,
        content: postData.content,
        featured_image: featuredImageUrl,
        featured_image_alt: postData.title,
        author_name: postData.author_name,
        category: postData.category || null,
        status: postData.status,
        meta_title: postData.meta_title || null,
        meta_description: postData.meta_description || null,
        og_image: ogImageUrl,
        featured: postData.featured,
        published_at: postData.status === 'published' ? new Date().toISOString() : null
      })

      if (error) {
        alert(`Failed to update blog post: ${error}`)
        setLoading(false)
        return
      }

      alert('Blog post updated successfully!')
      router.push('/blog')
    } catch (error) {
      console.error('Error updating blog post:', error)
      alert('An error occurred while updating the blog post')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
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
              <Link href="/blog" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold text-neutral-900">Edit Blog Post</h1>
            </div>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Post
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
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Content</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={postData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none"
                    placeholder="Enter blog post title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={postData.slug}
                    onChange={(e) => setPostData({ ...postData, slug: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none"
                    placeholder="url-slug"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    URL: /blog/{postData.slug || 'your-post'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Excerpt
                  </label>
                  <textarea
                    value={postData.excerpt}
                    onChange={(e) => setPostData({ ...postData, excerpt: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none resize-none"
                    placeholder="Short summary (150-200 characters)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Content *
                  </label>
                  <RichTextEditor
                    content={postData.content}
                    onChange={(html) => setPostData({ ...postData, content: html })}
                    placeholder="Write your blog post content here..."
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
                    value={postData.meta_title}
                    onChange={(e) => setPostData({ ...postData, meta_title: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none"
                    placeholder="SEO title (defaults to post title)"
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
                    value={postData.meta_description}
                    onChange={(e) => setPostData({ ...postData, meta_description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none resize-none"
                    placeholder="SEO description (defaults to excerpt)"
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
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Publish</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Status
                  </label>
                  <select
                    value={postData.status}
                    onChange={(e) => setPostData({ ...postData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={postData.featured}
                    onChange={(e) => setPostData({ ...postData, featured: e.target.checked })}
                    className="w-4 h-4 rounded border-neutral-300"
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-neutral-900">
                    Featured Post
                  </label>
                </div>
              </div>
            </div>

            {/* Author & Category */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Author
                  </label>
                  <input
                    type="text"
                    value={postData.author_name}
                    onChange={(e) => setPostData({ ...postData, author_name: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={postData.category}
                    onChange={(e) => setPostData({ ...postData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none"
                    placeholder="e.g. Tech, Lifestyle"
                  />
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Featured Image</h2>
              {featuredImagePreview || currentFeaturedImage ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-100">
                  <Image 
                    src={featuredImagePreview || currentFeaturedImage || ''} 
                    alt="Featured" 
                    fill 
                    className="object-cover" 
                  />
                  <button
                    type="button"
                    onClick={removeFeaturedImage}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="block border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-neutral-900 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-sm text-neutral-600 mb-1">
                    Click to upload cover image
                  </p>
                  <p className="text-xs text-neutral-500">
                    PNG, JPG up to 10MB
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFeaturedImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* OG Image */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Social Share Image</h2>
              <p className="text-xs text-neutral-500 mb-3">Optional: Custom image for social media shares</p>
              {ogImagePreview || currentOgImage ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-100">
                  <Image 
                    src={ogImagePreview || currentOgImage || ''} 
                    alt="OG Image" 
                    fill 
                    className="object-cover" 
                  />
                  <button
                    type="button"
                    onClick={removeOgImage}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="block border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-neutral-900 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-sm text-neutral-600 mb-1">
                    Upload OG image
                  </p>
                  <p className="text-xs text-neutral-500">
                    1200x630px recommended
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleOgImageChange}
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
