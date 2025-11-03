"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Save, Upload, X, Eye } from "lucide-react"

export default function NewBlogPostPage() {
  const [postData, setPostData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author: "dekord Team",
    category: "Brand Story",
    status: "Draft",
    publishDate: ""
  })

  const [featuredImage, setFeaturedImage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Blog post data:", postData)
    // Handle blog post creation
  }

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    setPostData({ ...postData, title, slug })
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold text-foreground">New Blog Post</h1>
            </div>
            <div className="flex gap-2">
              <button className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg font-medium hover:bg-neutral-50 transition-colors">
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button 
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                <Save className="w-4 h-4" />
                Save Post
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Post Content</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={postData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                    placeholder="e.g. dekord: Where Love Meets Hard Work"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Slug *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">/blog/</span>
                    <input
                      type="text"
                      value={postData.slug}
                      onChange={(e) => setPostData({ ...postData, slug: e.target.value })}
                      className="flex-1 px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                      placeholder="dekord-where-love-meets-hard-work"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Excerpt
                  </label>
                  <textarea
                    value={postData.excerpt}
                    onChange={(e) => setPostData({ ...postData, excerpt: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none resize-none"
                    placeholder="Brief description of the blog post..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Content *
                  </label>
                  <textarea
                    value={postData.content}
                    onChange={(e) => setPostData({ ...postData, content: e.target.value })}
                    rows={20}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none resize-none font-mono text-sm"
                    placeholder="Write your blog post content here... (Supports Markdown)"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Tip: You can use Markdown formatting for headers, lists, bold, italic, etc.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Publish Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Status
                  </label>
                  <select
                    value={postData.status}
                    onChange={(e) => setPostData({ ...postData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Publish Date
                  </label>
                  <input
                    type="date"
                    value={postData.publishDate}
                    onChange={(e) => setPostData({ ...postData, publishDate: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Post Details */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Post Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Author
                  </label>
                  <input
                    type="text"
                    value={postData.author}
                    onChange={(e) => setPostData({ ...postData, author: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category
                  </label>
                  <select
                    value={postData.category}
                    onChange={(e) => setPostData({ ...postData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                  >
                    <option value="Brand Story">Brand Story</option>
                    <option value="Product Launch">Product Launch</option>
                    <option value="Tech Tips">Tech Tips</option>
                    <option value="News">News</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Featured Image</h2>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-foreground transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-1">
                  Click to upload
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG (recommended: 1200x630)
                </p>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">SEO</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Meta Description
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none resize-none text-sm"
                    placeholder="Brief description for search engines..."
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
