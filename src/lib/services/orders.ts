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

    // Fetch current stock for each order item
    if (data) {
      for (const order of data) {
        if (order.order_items) {
          for (const item of order.order_items) {
            let currentStock = 0

            if (item.variant_id) {
              // Get stock from product_variants
              const { data: variantData, error: variantError } = await supabase
                .from('product_variants')
                .select('stock')
                .eq('id', item.variant_id)
                .single()

              if (!variantError && variantData) {
                currentStock = variantData.stock || 0
              }
            } else if (item.product_id) {
              // Check if it's a product or merch
              const { data: productData, error: productCheckError } = await supabase
                .from('products')
                .select('stock')
                .eq('id', item.product_id)
                .single()

              if (!productCheckError && productData) {
                // It's a product
                currentStock = productData.stock || 0
              } else {
                // Check if it's merch
                const { data: merchData, error: merchError } = await supabase
                  .from('merch')
                  .select('quantity_available')
                  .eq('id', item.product_id)
                  .single()

                if (!merchError && merchData) {
                  currentStock = merchData.quantity_available || 0
                }
              }
            }

            // Add current stock to the item
            (item as any).current_stock = currentStock
          }
        }
      }
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
