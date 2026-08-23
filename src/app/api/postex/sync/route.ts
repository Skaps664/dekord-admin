import { NextResponse } from 'next/server'
import * as postex from '@/lib/postex/client'
import { applyPostExStatus, db, findOrderByTracking, type OrderRow } from '@/lib/postex/orders'

/**
 * Pull statuses from PostEx instead of waiting to be pushed them.
 *
 * Two uses:
 *  - `?orderId=...`  the "Sync now" button on a single order
 *  - no parameters   the safety-net sweep for every in-flight order, in case a
 *                    webhook was missed during a deploy or outage
 */

/** Statuses that are finished; no point asking PostEx about them again. */
const SETTLED = new Set(['delivered', 'cancelled'])

const ORDER_FIELDS = `
  id, order_number, status, total,
  shipping_name, shipping_phone, shipping_address, shipping_city, shipping_province,
  customer_notes, courier, tracking_number, postex_status,
  order_items ( quantity, product_name, variant_details )
`

/**
 * This route sits outside the admin session middleware so the scheduled job can
 * reach it, which means it has to check callers itself: either a logged-in
 * admin browser, or the cron secret.
 */
function isAuthorized(request: Request): boolean {
  const sessionToken = process.env.ADMIN_SESSION_SECRET || 'dekord_admin_secure_session_2025'
  const cookie = request.headers.get('cookie') || ''
  if (cookie.includes(`admin_session=${sessionToken}`)) return true

  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = request.headers.get('authorization') || ''
    if (auth === `Bearer ${cronSecret}`) return true
  }

  // Vercel Cron identifies itself even when no secret is configured.
  if (request.headers.get('x-vercel-cron')) return true

  return false
}

export async function POST(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (orderId) return await syncOne(orderId)
    return await syncAll()
  } catch (error) {
    console.error('PostEx sync error:', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    )
  }
}

/** Vercel Cron issues GET requests. */
export async function GET(request: Request) {
  return POST(request)
}

async function syncOne(orderId: string) {
  const { data } = await db().from('orders').select(ORDER_FIELDS).eq('id', orderId).maybeSingle()
  const order = data as unknown as OrderRow | null

  if (!order) {
    return NextResponse.json({ ok: false, error: 'Order not found' }, { status: 404 })
  }

  if (!order.tracking_number) {
    return NextResponse.json({ ok: false, error: 'This order has no PostEx tracking number yet' }, { status: 400 })
  }

  try {
    const tracked = await postex.trackOrder(order.tracking_number)
    const applied = await applyPostExStatus(order, tracked?.transactionStatus, tracked)

    return NextResponse.json({
      ok: true,
      postexStatus: tracked?.transactionStatus ?? null,
      dekordStatus: applied.dekordStatus ?? order.status,
      attention: applied.attention ?? null,
      history: tracked?.transactionStatusHistory ?? [],
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Could not reach PostEx' },
      { status: 200 }
    )
  }
}

async function syncAll() {
  const { data, error } = await db()
    .from('orders')
    .select(ORDER_FIELDS)
    .not('tracking_number', 'is', null)
    .not('status', 'in', '(delivered,cancelled)')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) throw new Error(error.message)

  const orders = (data as unknown as OrderRow[]) ?? []
  const live = orders.filter(
    (order) => order.tracking_number && !SETTLED.has((order.status || '').toLowerCase())
  )

  if (live.length === 0) {
    return NextResponse.json({ ok: true, checked: 0, updated: 0 })
  }

  const byTracking = new Map(live.map((order) => [order.tracking_number as string, order]))
  let updated = 0
  const failures: string[] = []

  // Bulk tracking takes many numbers per call; chunk to keep requests sane.
  const numbers = [...byTracking.keys()]
  for (let i = 0; i < numbers.length; i += 50) {
    const chunk = numbers.slice(i, i + 50)

    try {
      const tracked = await postex.trackBulkOrders(chunk)
      const list = Array.isArray(tracked) ? tracked : [tracked]

      for (const entry of list) {
        const number = entry?.trackingNumber
        if (!number) continue

        const order = byTracking.get(number) ?? (await findOrderByTracking(number))
        if (!order) continue

        try {
          const applied = await applyPostExStatus(order, entry.transactionStatus, entry)
          if (applied.changed) updated += 1
        } catch (applyError) {
          console.error('Sync: could not apply status for', order.order_number, applyError)
          failures.push(order.order_number)
        }
      }
    } catch (chunkError) {
      console.error('Sync: bulk tracking chunk failed', chunkError)
      failures.push(...chunk)
    }
  }

  return NextResponse.json({ ok: true, checked: live.length, updated, failures: failures.length })
}
