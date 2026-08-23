import { NextResponse } from 'next/server'
import { listCities, suggestCities } from '@/lib/postex/cities'

/**
 * PostEx delivery cities, for the admin's manual city picker.
 * `?q=` returns the closest matches to what the customer typed.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (query) {
      return NextResponse.json({ cities: await suggestCities(query, 10) })
    }

    return NextResponse.json({ cities: await listCities() })
  } catch (error) {
    return NextResponse.json(
      { cities: [], error: error instanceof Error ? error.message : 'Could not load cities' },
      { status: 200 }
    )
  }
}
