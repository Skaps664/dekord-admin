/**
 * Server-side order helpers for the PostEx integration.
 *
 * Everything here runs in API routes only. The browser never sees the PostEx
 * token, and never needs to.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import * as postex from './client'
import { resolveCity, suggestCities } from './cities'
import { isForwardTransition, mapPostExStatus, type DekordStatus } from './status'

export const POSTEX_COURIER = 'Postex'

/** Public parcel tracking page shown to the customer. */
export function trackingUrlFor(trackingNumber: string): string {
  return `https://postex.pk/tracking?cn=${encodeURIComponent(trackingNumber)}`
}

let client: SupabaseClient | null = null

/**
 * Service role when it's configured, anon otherwise. Anon currently works
 * because `orders` is writable by it, but the service key is preferable and
 * picked up automatically if present.
 */
export function db(): SupabaseClient {
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) throw new Error('Supabase environment variables are missing.')

  client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  return client
}

export interface OrderRow {
  id: string
  order_number: string
  status: string
  total: number
  shipping_name: string
  shipping_phone: string
  shipping_address: string
  shipping_city: string
  shipping_province: string
  customer_notes: string | null
  courier: string | null
  tracking_number: string | null
  postex_status: string | null
  order_items?: Array<{ quantity: number; product_name: string; variant_details: string | null }>
}

const ORDER_FIELDS = `
  id, order_number, status, total,
  shipping_name, shipping_phone, shipping_address, shipping_city, shipping_province,
  customer_notes, courier, tracking_number, postex_status,
  order_items ( quantity, product_name, variant_details )
`

export async function getOrder(orderId: string): Promise<OrderRow | null> {
  const { data, error } = await db().from('orders').select(ORDER_FIELDS).eq('id', orderId).maybeSingle()
  if (error) throw new Error(error.message)
  return (data as unknown as OrderRow) ?? null
}

export async function findOrderByTracking(trackingNumber: string): Promise<OrderRow | null> {
  const { data } = await db()
    .from('orders')
    .select(ORDER_FIELDS)
    .eq('tracking_number', trackingNumber)
    .maybeSingle()
  return (data as unknown as OrderRow) ?? null
}

export async function findOrderByNumber(orderNumber: string): Promise<OrderRow | null> {
  const { data } = await db()
    .from('orders')
    .select(ORDER_FIELDS)
    .eq('order_number', orderNumber)
    .maybeSingle()
  return (data as unknown as OrderRow) ?? null
}

/** PostEx wants 03xxxxxxxxx; orders are stored as +923xxxxxxxxx. */
export function toPostExPhone(phone: string | null | undefined): string {
  const digits = (phone ?? '').replace(/\D/g, '')
  let local = digits
  if (local.startsWith('0092')) local = local.slice(4)
  else if (local.startsWith('92') && local.length > 10) local = local.slice(2)
  else if (local.startsWith('0')) local = local.slice(1)
  local = local.slice(-10)
  return local.length === 10 ? `0${local}` : (phone ?? '').trim()
}

export function isValidPostExPhone(phone: string): boolean {
  return /^03\d{9}$/.test(phone)
}

export async function setAttention(orderId: string, reason: string, error?: string) {
  await db()
    .from('orders')
    .update({
      postex_needs_attention: true,
      postex_attention_reason: reason,
      ...(error !== undefined ? { postex_last_error: error } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
}

export async function clearAttention(orderId: string) {
  await db()
    .from('orders')
    .update({
      postex_needs_attention: false,
      postex_attention_reason: null,
      postex_last_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
}

/** Fire the customer email + WhatsApp for a status. Never throws. */
export async function notifyCustomer(orderId: string, type: 'processing' | 'shipped' | 'delivered') {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://dekord.online').replace(/\/$/, '')

  await Promise.allSettled(
    ['/api/send-order-email', '/api/send-whatsapp'].map((path) =>
      fetch(`${siteUrl}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, orderId }),
      })
    )
  ).then((results) => {
    results.forEach((result) => {
      if (result.status === 'rejected') {
        console.error('PostEx notification failed:', result.reason)
      }
    })
  })
}

export interface BookingOutcome {
  ok: boolean
  trackingNumber?: string
  /** Set when PostEx can't serve this city — use a different courier. */
  needsOtherCourier?: boolean
  reason?: string
  suggestions?: string[]
  cityUsed?: string
  cityMatch?: string
}

/**
 * Book an order with PostEx.
 *
 * A failure here is never fatal to the order: the caller keeps the status
 * change, and the order is flagged for attention instead.
 */
export async function bookOrder(order: OrderRow, cityOverride?: string): Promise<BookingOutcome> {
  // Never book twice. PostEx would also reject the duplicate reference, but
  // this avoids the round trip and the confusing error.
  if (order.tracking_number) {
    return { ok: true, trackingNumber: order.tracking_number, reason: 'Already booked' }
  }

  const phone = toPostExPhone(order.shipping_phone)
  if (!isValidPostExPhone(phone)) {
    const reason = `"${order.shipping_phone}" isn't a valid Pakistani mobile number`
    await setAttention(order.id, 'Invalid phone number for booking', reason)
    return { ok: false, reason }
  }

  const resolved = cityOverride
    ? { cityName: cityOverride, method: 'exact' as const }
    : await resolveCity(order.shipping_city)

  if (!resolved) {
    const suggestions = await suggestCities(order.shipping_city)
    const reason = `PostEx doesn't deliver to "${order.shipping_city}"`
    await setAttention(order.id, `No PostEx coverage for "${order.shipping_city}" — use another courier`, reason)
    return { ok: false, needsOtherCourier: true, reason, suggestions }
  }

  const itemCount = order.order_items?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) || 1
  const orderDetail =
    order.order_items
      ?.map((item) => `${item.quantity}x ${item.product_name}${item.variant_details ? ` (${item.variant_details})` : ''}`)
      .join(', ')
      .slice(0, 500) || undefined

  try {
    const result = await postex.createOrder({
      orderRefNumber: order.order_number,
      invoicePayment: Number(order.total) || 0,
      customerName: order.shipping_name,
      customerPhone: phone,
      deliveryAddress: `${order.shipping_address}, ${order.shipping_city}, ${order.shipping_province}`.slice(0, 250),
      cityName: resolved.cityName,
      items: Math.max(1, itemCount),
      invoiceDivision: 1,
      orderType: 'Normal',
      orderDetail,
      transactionNotes: order.customer_notes || undefined,
      pickupAddressCode: process.env.POSTEX_PICKUP_ADDRESS_CODE || undefined,
    })

    if (!result?.trackingNumber) {
      const reason = 'PostEx accepted the booking but returned no tracking number'
      await setAttention(order.id, 'Booking incomplete', reason)
      return { ok: false, reason }
    }

    await db()
      .from('orders')
      .update({
        courier: POSTEX_COURIER,
        tracking_number: result.trackingNumber,
        tracking_url: trackingUrlFor(result.trackingNumber),
        postex_status: result.orderStatus || 'Unbooked',
        postex_booked_at: new Date().toISOString(),
        postex_last_event_at: new Date().toISOString(),
        postex_needs_attention: false,
        postex_attention_reason: null,
        postex_last_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)

    return {
      ok: true,
      trackingNumber: result.trackingNumber,
      cityUsed: resolved.cityName,
      cityMatch: resolved.method,
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'PostEx booking failed'
    await setAttention(order.id, 'PostEx booking failed', reason)
    return { ok: false, reason }
  }
}

export interface StatusApplication {
  changed: boolean
  dekordStatus?: DekordStatus
  attention?: string | null
}

/**
 * Apply a PostEx status to an order: store it, move the dekord status when the
 * transition moves forward, flag anything needing a human, and notify the
 * customer on the transitions that matter.
 */
export async function applyPostExStatus(
  order: OrderRow,
  rawStatus: string | null | undefined,
  rawWebhook?: unknown
): Promise<StatusApplication> {
  const mapping = mapPostExStatus(rawStatus)
  const now = new Date().toISOString()

  const update: Record<string, unknown> = {
    postex_status: rawStatus ?? order.postex_status,
    postex_last_event_at: now,
    updated_at: now,
  }

  if (rawWebhook !== undefined) update.postex_last_webhook = rawWebhook

  if (mapping.attention) {
    update.postex_needs_attention = true
    update.postex_attention_reason = mapping.attention
  } else if (!mapping.requiresDecision) {
    update.postex_needs_attention = false
    update.postex_attention_reason = null
  }

  let moved: DekordStatus | undefined
  const target = mapping.dekordStatus

  if (target && !mapping.requiresDecision && isForwardTransition(order.status, target)) {
    update.status = target
    moved = target
    if (target === 'shipped') update.shipped_at = now
    if (target === 'delivered') update.delivered_at = now
  }

  const { error } = await db().from('orders').update(update).eq('id', order.id)
  if (error) throw new Error(error.message)

  // Only tell the customer when the order actually moved into that state.
  if (moved && mapping.notifyCustomer && (moved === 'shipped' || moved === 'delivered')) {
    await notifyCustomer(order.id, moved)
  }

  return {
    changed: Boolean(moved) || order.postex_status !== rawStatus,
    dekordStatus: moved,
    attention: mapping.attention,
  }
}
