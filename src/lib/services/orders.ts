import { supabase } from '@/lib/supabase/client'
import { Order, OrderWithDetails } from '@/lib/types/database'

/** What /api/postex/book reports back after an order moves to Processing. */
export interface PostExBookingResult {
  ok: boolean
  trackingNumber?: string
  /** PostEx doesn't serve this city — ship it with a different courier. */
  needsOtherCourier?: boolean
  reason?: string
  suggestions?: string[]
  cityUsed?: string
  cityMatch?: string
}

interface GetOrdersFilters {
  status?: string
  search?: string
  limit?: number
  offset?: number
  /**
   * Courier problems, as their own view. Overrides `status`.
   *  - 'needs-courier'  flagged but never booked — no PostEx coverage, bad
   *                     phone, or the booking failed. Needs a courier decision.
   *  - 'delivery-issue' booked, but something went wrong in transit.
   */
  attention?: 'needs-courier' | 'delivery-issue'
}

export async function getOrders(filters?: GetOrdersFilters) {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          variant_id,
          quantity,
          product_name,
          variant_details,
          unit_price,
          total_price,
          sku
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    // Courier problems are their own view, independent of order status.
    // Whether a tracking number exists is what separates "never got booked"
    // from "booked but the delivery went wrong".
    if (filters?.attention === 'needs-courier') {
      query = query.eq('postex_needs_attention', true).is('tracking_number', null)
    } else if (filters?.attention === 'delivery-issue') {
      query = query.eq('postex_needs_attention', true).not('tracking_number', 'is', null)
    } else if (filters?.status && filters.status !== 'All') {
      query = query.eq('status', filters.status.toLowerCase())
    }

    // Search by order number, customer name, phone
    if (filters?.search) {
      query = query.or(`order_number.ilike.%${filters.search}%,shipping_name.ilike.%${filters.search}%,shipping_phone.ilike.%${filters.search}%`)
    }

    if (filters?.limit) {
      const offset = filters.offset || 0
      query = query.range(offset, offset + filters.limit - 1)
    }

    const { data, count, error } = await query

    if (error) {
      console.error('Error fetching orders:', error)
      return { data: null, error: error.message, count: null }
    }

    // Fetch current stock efficiently
    if (data && data.length > 0) {
      const variantIds = new Set<string>();
      const productIds = new Set<string>();

      data.forEach(order => {
        if (order.order_items) {
          order.order_items.forEach(item => {
            if (item.variant_id) variantIds.add(item.variant_id);
            else if (item.product_id) productIds.add(item.product_id);
          });
        }
      });

      // Bulk fetch stocks
      let variantsStock: Record<string, number> = {};
      let productsStock: Record<string, number> = {};
      let merchStock: Record<string, number> = {};

      if (variantIds.size > 0) {
        const { data: vData } = await supabase.from('product_variants').select('id, stock').in('id', Array.from(variantIds));
        if (vData) vData.forEach(v => { variantsStock[v.id] = v.stock || 0; });
      }

      if (productIds.size > 0) {
        const { data: pData } = await supabase.from('products').select('id, stock').in('id', Array.from(productIds));
        if (pData) pData.forEach(p => { productsStock[p.id] = p.stock || 0; });

        const { data: mData } = await supabase.from('merch').select('id, quantity_available').in('id', Array.from(productIds));
        if (mData) mData.forEach(m => { merchStock[m.id] = m.quantity_available || 0; });
      }

      // Assign stock
      for (const order of data) {
        if (order.order_items) {
          for (const item of order.order_items) {
            let stock = 0;
            if (item.variant_id) stock = variantsStock[item.variant_id] || 0;
            else if (item.product_id) stock = productsStock[item.product_id] ?? merchStock[item.product_id] ?? 0;
            (item as any).current_stock = stock;
          }
        }
      }
    }

    return { data: data as OrderWithDetails[], error: null, count }
  } catch (error) {
    console.error('Error fetching orders:', error)
    return { data: null, error: 'Failed to fetch orders', count: null }
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
    // If status is changing to "processing", reduce stock
    if (status.toLowerCase() === 'processing') {
      // Get order items
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          id,
          order_items (
            id,
            product_id,
            variant_id,
            quantity,
            product_name
          )
        `)
        .eq('id', orderId)
        .single()

      if (orderError) {
        console.error('Error fetching order for stock reduction:', orderError)
        return { error: 'Failed to fetch order details for stock reduction' }
      }

      if (orderData?.order_items) {
        for (const item of orderData.order_items) {
          const quantity = item.quantity

          if (item.variant_id) {
            // Reduce stock in product_variants table
            // First get current stock
            const { data: currentVariant, error: getVariantError } = await supabase
              .from('product_variants')
              .select('stock')
              .eq('id', item.variant_id)
              .single()

            if (getVariantError) {
              console.error('Error getting current variant stock:', getVariantError)
              return { error: 'Failed to get current variant stock' }
            }

            const newVariantStock = (currentVariant.stock || 0) - quantity
            
            const { error: variantError } = await supabase
              .from('product_variants')
              .update({ stock: newVariantStock })
              .eq('id', item.variant_id)

            if (variantError) {
              console.error('Error reducing variant stock:', variantError)
              return { error: 'Failed to reduce variant stock' }
            }
          } else if (item.product_id) {
            // Check if it's a product or merch
            const { data: productData, error: productCheckError } = await supabase
              .from('products')
              .select('id')
              .eq('id', item.product_id)
              .single()

            if (productCheckError && productCheckError.code !== 'PGRST116') { // PGRST116 = not found
              console.error('Error checking product:', productCheckError)
              return { error: 'Failed to check product existence' }
            }

            if (productData) {
              // It's a product, reduce stock in products table
              // First get current stock
              const { data: currentProduct, error: getProductError } = await supabase
                .from('products')
                .select('stock')
                .eq('id', item.product_id)
                .single()

              if (getProductError) {
                console.error('Error getting current product stock:', getProductError)
                return { error: 'Failed to get current product stock' }
              }

              const newProductStock = (currentProduct.stock || 0) - quantity
              
              const { error: productError } = await supabase
                .from('products')
                .update({ stock: newProductStock })
                .eq('id', item.product_id)

              if (productError) {
                console.error('Error reducing product stock:', productError)
                return { error: 'Failed to reduce product stock' }
              }
            } else {
              // It's merch, reduce quantity_available in merch table
              // First get current stock
              const { data: currentMerch, error: getMerchError } = await supabase
                .from('merch')
                .select('quantity_available')
                .eq('id', item.product_id)
                .single()

              if (getMerchError) {
                console.error('Error getting current merch stock:', getMerchError)
                return { error: 'Failed to get current merch stock' }
              }

              const newMerchStock = (currentMerch.quantity_available || 0) - quantity
              
              const { error: merchError } = await supabase
                .from('merch')
                .update({ quantity_available: newMerchStock })
                .eq('id', item.product_id)

              if (merchError) {
                console.error('Error reducing merch stock:', merchError)
                return { error: 'Failed to reduce merch stock' }
              }
            }
          }
        }

        // Set a flag in localStorage to indicate stock has been updated
        if (typeof window !== 'undefined') {
          localStorage.setItem('stockLastUpdated', new Date().toISOString())
        }
      }
    }

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

    // Book with PostEx as soon as an order starts being prepared.
    // Runs through an API route because the PostEx token is server-side only.
    // A courier problem must never undo the status change or the stock
    // deduction that already happened above, so failures are reported, not thrown.
    let postexResult: PostExBookingResult | undefined
    if (status.toLowerCase() === 'processing' && !trackingInfo?.tracking_number) {
      try {
        const response = await fetch('/api/postex/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        })
        postexResult = await response.json()
      } catch (bookingError) {
        console.error('PostEx booking request failed:', bookingError)
        postexResult = { ok: false, reason: 'Could not reach the booking service' }
      }
    }

    // Fire the customer notifications without blocking.
    //
    // These used to be awaited one after the other, so if the storefront was
    // unreachable the whole status update sat there until the browser gave up
    // — minutes, and worse again for every order in a bulk action. The order is
    // already saved by this point; telling the customer is best-effort.
    //
    // Deliberately no AbortSignal timeout: nothing awaits these, so a timeout
    // buys nothing, and aborting mid-flight truncates the request body — the
    // receiving route then fails on request.json() and the notification is lost
    // for a request that would otherwise have succeeded. A cold Next dev route
    // can take 40s+ to compile on its first hit, which is exactly when that
    // used to bite.
    const notificationType = status.toLowerCase()
    if (['processing', 'shipped', 'delivered'].includes(notificationType)) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://dekord.online'

      void Promise.allSettled(
        ['/api/send-order-email', '/api/send-whatsapp'].map(async (path) => {
          try {
            const response = await fetch(`${siteUrl}${path}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type: notificationType, orderId }),
            })
            if (!response.ok) {
              const detail = await response.json().catch(() => ({}))
              console.error(`Notification ${path} failed:`, detail?.error ?? response.status)
            }
          } catch (notifError) {
            console.error(`Notification ${path} failed:`, notifError)
          }
        })
      )
    }

    return { error: null, postex: postexResult }
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

// Get order statistics
export async function getOrderStats() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('status, postex_needs_attention, tracking_number')

    if (error) {
      console.error('Error fetching order stats:', error)
      return { data: null, error: error.message }
    }

    const stats = {
      all: data.length,
      pending: data.filter(o => o.status === 'pending').length,
      processing: data.filter(o => o.status === 'processing').length,
      shipped: data.filter(o => o.status === 'shipped').length,
      delivered: data.filter(o => o.status === 'delivered').length,
      cancelled: data.filter(o => o.status === 'cancelled').length,
      // Flagged but never booked — these need a courier decision from you.
      'needs-courier': data.filter((o) => {
        const row = o as { postex_needs_attention?: boolean; tracking_number?: string | null }
        return row.postex_needs_attention && !row.tracking_number
      }).length,
      // Booked, but something went wrong on the way.
      'delivery-issue': data.filter((o) => {
        const row = o as { postex_needs_attention?: boolean; tracking_number?: string | null }
        return row.postex_needs_attention && Boolean(row.tracking_number)
      }).length,
    }

    return { data: stats, error: null }
  } catch (error: any) {
    console.error('Unexpected error fetching order stats:', error)
    return { data: null, error: 'Failed to fetch order stats' }
  }
}
