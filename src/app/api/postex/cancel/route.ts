import { NextResponse } from 'next/server'
import * as postex from '@/lib/postex/client'
import { db, getOrder } from '@/lib/postex/orders'

/**
 * Cancel a PostEx booking so no rider comes to collect it.
 *
 * The dekord order status is left alone — cancelling a shipment and cancelling
 * a customer's order are different decisions, and the caller makes the second.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const orderId = typeof body?.orderId === 'string' ? body.orderId : ''

    if (!orderId) {
      return NextResponse.json({ ok: false, error: 'orderId is required' }, { status: 400 })
    }

    const order = await getOrder(orderId)
    if (!order) {
      return NextResponse.json({ ok: false, error: 'Order not found' }, { status: 404 })
    }

    if (!order.tracking_number) {
      return NextResponse.json({ ok: false, error: 'This order has no PostEx booking to cancel' }, { status: 400 })
    }

    await postex.cancelOrder(order.tracking_number)

    await db()
      .from('orders')
      .update({
        postex_status: 'Cancelled',
        postex_last_event_at: new Date().toISOString(),
        postex_needs_attention: false,
        postex_attention_reason: null,
        postex_last_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Could not cancel the booking' },
      { status: 200 }
    )
  }
}
