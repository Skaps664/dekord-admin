"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  ArrowLeft, 
  Plus, 
  Search,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  User
} from "lucide-react"
import Image from "next/image"

const mockBlogPosts = [
  {
    id: 1,
    title: "dekord: Where Love Meets Hard Work",
    slug: "dekord-where-love-meets-hard-work",
    excerpt: "Every product we create is a promise. A promise that you won't have to deal with frayed cables...",
    author: "dekord Team",
    date: "Nov 3, 2025",
    status: "Published",
    image: "/premium-braided-cable-lifestyle.jpg",
    views: 1240
  },
  {
    id: 2,
    title: "Dekord is Launching Soon",
    slug: "dekord-launching-soon",
    excerpt: "At Dekord, we believe Pakistan deserves world-class technology made right here at home...",
    author: "dekord Team",
    date: "Oct 1, 2025",
    status: "Published",
    image: "/braided-cable-coiled-aesthetic-still.jpg",
    views: 2156
  },
  {
    id: 3,
    title: "dekord – Defy Ordinary: Premium Charging Cables in Pakistan",
    slug: "dekord-defy-ordinary",
    excerpt: "Why should Pakistan always settle for ordinary? We're building the country's first premium...",
    author: "dekord Team",
    date: "Sep 15, 2025",
    status: "Published",
    image: "/premium-braided-cable-lifestyle.jpg",
    views: 987
  }
]

export default function AdminBlogPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Blog Posts</h1>
            </div>
            <Link 
              href="/blog/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              New Post
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="bg-white rounded-xl border border-border p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search blog posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
            />
          </div>
        </div>

        {/* Blog Posts List */}
        <div className="space-y-4">
          {mockBlogPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Image */}
                <div className="relative w-full sm:w-48 h-48 sm:h-auto bg-neutral-100 flex-shrink-0">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          post.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {post.status}
                        </span>
                        <span className="text-xs text-muted-foreground">{post.views} views</span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-1">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{post.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-border">
                    <Link 
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                    <Link 
                      href={`/blog/${post.id}/edit`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-foreground bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Link>
                    <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
