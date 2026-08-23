import { NextResponse } from 'next/server'
import { applyPostExStatus, findOrderByNumber, findOrderByTracking } from '@/lib/postex/orders'

/**
 * Status updates pushed by PostEx.
 *
 * Configure it at merchant.postex.pk -> API Integration Guide -> Webhook
 * Configuration:
 *   Status Updates Webhook : https://<admin-domain>/api/postex/webhook
 *   Header Key             : x-postex-secret
 *   Header Value           : the value of POSTEX_WEBHOOK_SECRET
 *
 * PostEx does not document the payload shape, so this handler is deliberately
 * tolerant: it searches the body for anything that looks like a tracking
 * number and a status, handles single objects and arrays, and stores the raw
 * body on the order so the real shape can be confirmed from live traffic.
 *
 * It always answers 200 for anything authentic. A webhook sender that receives
 * an error may retry forever or disable the hook.
 */

const SECRET_HEADER = 'x-postex-secret'

const TRACKING_KEYS = ['trackingNumber', 'tracking_number', 'trackingNo', 'cn', 'trackingNumbers']
const STATUS_KEYS = [
  'transactionStatus', 'status', 'orderStatus', 'transactionStatusMessage',
  'statusMessage', 'orderStatusMessage',
]
const REF_KEYS = ['orderRefNumber', 'order_ref_number', 'refNumber', 'orderReference']

type Json = Record<string, unknown>

/** Depth-first search for the first non-empty value under any of `keys`. */
function pick(source: unknown, keys: string[], depth = 0): string | null {
  if (!source || typeof source !== 'object' || depth > 4) return null

  const record = source as Json

  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number') return String(value)
    if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  }

  for (const value of Object.values(record)) {
    if (value && typeof value === 'object') {
      const found = pick(value, keys, depth + 1)
      if (found) return found
    }
  }

  return null
}

/** PostEx may send one event or a batch; normalise to a list. */
function toEvents(body: unknown): unknown[] {
  if (Array.isArray(body)) return body
  if (body && typeof body === 'object') {
    const record = body as Json
    for (const key of ['dist', 'data', 'orders', 'events', 'payload']) {
      const value = record[key]
      if (Array.isArray(value)) return value
    }
  }
  return [body]
}

export async function POST(request: Request) {
  const expected = process.env.POSTEX_WEBHOOK_SECRET

  // Reject impostors, but only when a secret is actually configured.
  if (expected) {
    const provided =
      request.headers.get(SECRET_HEADER) ||
      request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
      ''
    if (provided !== expected) {
      console.warn('PostEx webhook rejected: bad or missing secret header')
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    const text = await request.text().catch(() => '')
    console.warn('PostEx webhook: body was not JSON:', text.slice(0, 500))
    return NextResponse.json({ ok: true, note: 'Body was not JSON; logged for inspection' })
  }

  // Until the payload shape is confirmed from live traffic, keep a full copy.
  console.log('PostEx webhook payload:', JSON.stringify(body).slice(0, 2000))

  const events = toEvents(body)
  const results: Array<{ tracking: string | null; matched: boolean; changed?: boolean }> = []

  for (const event of events) {
    const tracking = pick(event, TRACKING_KEYS)
    const reference = pick(event, REF_KEYS)
    const status = pick(event, STATUS_KEYS)

    let order = tracking ? await findOrderByTracking(tracking) : null
    if (!order && reference) order = await findOrderByNumber(reference)

    if (!order) {
      console.warn('PostEx webhook: no matching order', { tracking, reference })
      results.push({ tracking, matched: false })
      continue
    }

    if (!status) {
      console.warn('PostEx webhook: no status found in payload for', order.order_number)
      results.push({ tracking, matched: true, changed: false })
      continue
    }

    try {
      const applied = await applyPostExStatus(order, status, event)
      results.push({ tracking, matched: true, changed: applied.changed })
    } catch (error) {
      console.error('PostEx webhook: failed to apply status', error)
      results.push({ tracking, matched: true, changed: false })
    }
  }

  return NextResponse.json({ ok: true, processed: results.length, results })
}

/** Some webhook configurators probe with a GET before saving. */
export async function GET() {
  return NextResponse.json({ ok: true, endpoint: 'postex-webhook' })
}
