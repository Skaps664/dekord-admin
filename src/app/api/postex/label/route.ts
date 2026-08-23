import { NextResponse } from 'next/server'
import * as postex from '@/lib/postex/client'

/**
 * The airway bill PDF to stick on the parcel.
 * PostEx caps this at 10 tracking numbers per request.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const numbers = (searchParams.get('trackingNumbers') || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

    if (numbers.length === 0) {
      return NextResponse.json({ error: 'trackingNumbers is required' }, { status: 400 })
    }

    const pdf = await postex.getAirwayBill(numbers)

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="airway-bill-${numbers[0]}.pdf"`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not generate the airway bill' },
      { status: 500 }
    )
  }
}
