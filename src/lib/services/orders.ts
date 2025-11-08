import { supabase } from '@/lib/supabase/client'
import { Order, OrderWithDetails } from '@/lib/types/database'

interface GetOrdersFilters {
  status?: string
  search?: string
}

export async function getOrders(filters?: GetOrdersFilters) {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *
        )
      `)
      .order('created_at', { ascending: false })

    // Filter by status
    if (filters?.status && filters.status !== 'All') {
      query = query.eq('status', filters.status.toLowerCase())
    }

    // Search by order number, customer name, phone
    if (filters?.search) {
      query = query.or(`order_number.ilike.%${filters.search}%,shipping_name.ilike.%${filters.search}%,shipping_phone.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching orders:', error)
      return { data: null, error: error.message }
    }

    return { data: data as OrderWithDetails[], error: null }
  } catch (error) {
    console.error('Error fetching orders:', error)
    return { data: null, error: 'Failed to fetch orders' }
  }
}

export async function getOrder(id: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching order:', error)
      return { data: null, error: error.message }
    }

    // Note: Cannot fetch user email with anon key
    // User info would need service role key or join with profiles table
    return { data: data as OrderWithDetails, error: null }
  } catch (error) {
    console.error('Error fetching order:', error)
    return { data: null, error: 'Failed to fetch order' }
  }
}

export async function updateOrderStatus(
  orderId: string, 
  status: string,
  trackingInfo?: { courier?: string; tracking_number?: string; tracking_url?: string }
) {
  try {
    const updateData: any = {
      status: status.toLowerCase(),
      updated_at: new Date().toISOString()
    }

    // Set timestamp based on status
    if (status.toLowerCase() === 'shipped') {
      updateData.shipped_at = new Date().toISOString()
    } else if (status.toLowerCase() === 'delivered') {
      updateData.delivered_at = new Date().toISOString()
    }

    // Add tracking info if provided
    if (trackingInfo?.courier) {
      updateData.courier = trackingInfo.courier
    }
    if (trackingInfo?.tracking_number) {
      updateData.tracking_number = trackingInfo.tracking_number
    }
    if (trackingInfo?.tracking_url) {
      updateData.tracking_url = trackingInfo.tracking_url
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)

    if (error) {
      console.error('Error updating order status:', error)
      return { error: error.message }
    }

    // Send notifications
    const notificationType = status.toLowerCase()
    if (['processing', 'shipped', 'delivered'].includes(notificationType)) {
      // Call notification APIs
      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://dekord.online'
        
        await fetch(`${siteUrl}/api/send-order-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: notificationType, orderId })
        })
        
        await fetch(`${siteUrl}/api/send-whatsapp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: notificationType, orderId })
        })
      } catch (notifError) {
        console.error('Notification error:', notifError)
        // Don't fail the update if notifications fail
      }
    }

    return { error: null }
  } catch (error) {
    console.error('Error updating order status:', error)
    return { error: 'Failed to update order status' }
  }
}

export async function updateOrderNotes(orderId: string, adminNotes: string) {
  try {
    const { error } = await supabase
      .from('orders')
      .update({
        admin_notes: adminNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (error) {
      console.error('Error updating order notes:', error)
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    console.error('Error updating order notes:', error)
    return { error: 'Failed to update order notes' }
  }
}

export async function deleteOrder(orderId: string) {
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)

    if (error) {
      console.error('Error deleting order:', error)
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    console.error('Error deleting order:', error)
    return { error: 'Failed to delete order' }
  }
}
