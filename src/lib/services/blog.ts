import { supabase } from '@/lib/supabase/client'
import { BlogPost } from '@/lib/types/database'

interface GetBlogPostsFilters {
  status?: string
  search?: string
}

export async function getBlogPosts(filters?: GetBlogPostsFilters) {
  try {
    let query = supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })

    // Filter by status
    if (filters?.status && filters.status !== 'All') {
      query = query.eq('status', filters.status.toLowerCase())
    }

    // Search by title, excerpt, or content
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%,content.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching blog posts:', error)
      return { data: null, error: error.message }
    }

    return { data: data as BlogPost[], error: null }
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return { data: null, error: 'Failed to fetch blog posts' }
  }
}

export async function getBlogPost(id: string) {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching blog post:', error)
      return { data: null, error: error.message }
    }

    return { data: data as BlogPost, error: null }
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return { data: null, error: 'Failed to fetch blog post' }
  }
}

export async function createBlogPost(postData: Partial<BlogPost>) {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        ...postData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating blog post:', error)
      return { data: null, error: error.message }
    }

    return { data: data as BlogPost, error: null }
  } catch (error) {
    console.error('Error creating blog post:', error)
    return { data: null, error: 'Failed to create blog post' }
  }
}

export async function updateBlogPost(id: string, postData: Partial<BlogPost>) {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .update({
        ...postData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating blog post:', error)
      return { data: null, error: error.message }
    }

    return { data: data as BlogPost, error: null }
  } catch (error) {
    console.error('Error updating blog post:', error)
    return { data: null, error: 'Failed to update blog post' }
  }
}

export async function deleteBlogPost(id: string) {
  try {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting blog post:', error)
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return { error: 'Failed to delete blog post' }
  }
}

export async function incrementViewCount(id: string) {
  try {
    const { error } = await supabase.rpc('increment_blog_views', { post_id: id })

    if (error) {
      console.error('Error incrementing view count:', error)
    }
  } catch (error) {
    console.error('Error incrementing view count:', error)
  }
}
