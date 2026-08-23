import { NextResponse } from 'next/server'
import { bookOrder, getOrder } from '@/lib/postex/orders'

/**
 * Book an order with PostEx. Called by the admin panel when an order moves to
 * Processing, and by the Retry button.
 *
 * Booking failure is reported, never thrown at the caller — the order's status
 * change and stock deduction must stand regardless of what the courier does.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const orderId = typeof body?.orderId === 'string' ? body.orderId : ''
    const cityOverride = typeof body?.cityName === 'string' && body.cityName ? body.cityName : undefined

    if (!orderId) {
      return NextResponse.json({ ok: false, reason: 'orderId is required' }, { status: 400 })
    }

    const order = await getOrder(orderId)
    if (!order) {
      return NextResponse.json({ ok: false, reason: 'Order not found' }, { status: 404 })
    }

    const result = await bookOrder(order, cityOverride)

    // Always 200: the caller needs the detail, not an exception.
    return NextResponse.json(result)
  } catch (error) {
    console.error('PostEx booking route error:', error)
    return NextResponse.json(
      { ok: false, reason: error instanceof Error ? error.message : 'Booking failed' },
      { status: 200 }
    )
  }
}
