/**
 * PostEx Merchant API client. Server-side only — the token is a permanent
 * credential and must never reach the browser.
 *
 * Endpoint paths and parameter names here were verified against the live API,
 * not taken from the PDF: the v4.1.9 guide is wrong in several places (it
 * documents `fromDate`/`toDate` instead of `startDate`/`endDate`, capitalised
 * enum values that return 400, and a tracking number format that isn't used).
 */

const BASE = 'https://api.postex.pk/services/integration/api/order'

export interface PostExResponse<T> {
  statusCode?: string
  statusMessage?: string
  dist?: T
}

export class PostExError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly statusCode?: string
  ) {
    super(message)
    this.name = 'PostExError'
  }
}

function token(): string {
  const value = process.env.POSTEX_API_TOKEN
  if (!value) {
    throw new PostExError('POSTEX_API_TOKEN is not configured on the server.')
  }
  return value
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT'
  body?: unknown
  /** Total attempts including the first. Network blips are common. */
  attempts?: number
  timeoutMs?: number
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, attempts = 3, timeoutMs = 20000 } = options
  let lastError: unknown

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(`${BASE}${path}`, {
        method,
        headers: {
          token: token(),
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
        cache: 'no-store',
      })
      clearTimeout(timer)

      const text = await response.text()
      let parsed: unknown
      try {
        parsed = text ? JSON.parse(text) : {}
      } catch {
        parsed = { statusMessage: text }
      }

      const payload = parsed as PostExResponse<T> & { statusMessage?: string }

      if (!response.ok) {
        // 4xx means our request is wrong — retrying won't help.
        const message = payload?.statusMessage || `PostEx returned HTTP ${response.status}`
        throw new PostExError(message, response.status, payload?.statusCode)
      }

      // PostEx can return HTTP 200 with a non-200 statusCode in the body.
      if (payload?.statusCode && payload.statusCode !== '200') {
        throw new PostExError(
          payload.statusMessage || `PostEx error ${payload.statusCode}`,
          response.status,
          payload.statusCode
        )
      }

      return (payload?.dist ?? payload) as T
    } catch (error) {
      clearTimeout(timer)
      lastError = error

      // Don't retry a request PostEx has already rejected on its merits.
      const status = error instanceof PostExError ? error.status : undefined
      if (status && status >= 400 && status < 500) throw error

      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** (attempt - 1)))
      }
    }
  }

  if (lastError instanceof PostExError) throw lastError
  throw new PostExError(
    lastError instanceof Error ? lastError.message : 'PostEx request failed'
  )
}

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface OperationalCity {
  operationalCityName: string
  countryName?: string
  isPickupCity?: boolean
  isDeliveryCity?: boolean
}

export interface MerchantAddress {
  addressCode: string
  cityName: string
  address: string
  contactPersonName?: string
  phone1?: string
  phone2?: string
}

export interface CreateOrderPayload {
  orderRefNumber: string
  invoicePayment: number
  customerName: string
  customerPhone: string
  deliveryAddress: string
  cityName: string
  items: number
  invoiceDivision: number
  orderType: string
  orderDetail?: string
  transactionNotes?: string
  pickupAddressCode?: string
  /**
   * Parcel weight in kg — the portal's "Booking Weight" column. Absent from the
   * v4.1.9 guide entirely, but verified against the live API: booking with this
   * set and reading the order back through `/v1/track-order` returns the exact
   * value under `bookingWeight`. Omitting it books the parcel at 0 kg.
   *
   * PostEx silently discards fields it doesn't recognise, so a wrong name here
   * fails quietly rather than erroring — don't rename it without re-testing.
   */
  bookingWeight?: number
}

export interface CreateOrderResult {
  trackingNumber: string
  orderStatus?: string
  orderDate?: string
}

export interface TrackingStatusEntry {
  transactionStatusMessage?: string
  transactionStatusMessageCode?: string
  updatedAt?: string
}

export interface TrackedOrder {
  orderRefNumber?: string
  trackingNumber?: string
  transactionStatus?: string
  customerName?: string
  customerPhone?: string
  deliveryAddress?: string
  cityName?: string
  invoicePayment?: number
  transactionDate?: string
  orderPickupDate?: string
  orderDeliveryDate?: string
  transactionStatusHistory?: TrackingStatusEntry[]
}

/* -------------------------------------------------------------------------- */
/* Endpoints                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Every operational city. The `operationalCityType` filter is deliberately not
 * used: it only accepts lowercase values (the PDF's capitalised ones return
 * 400) and every city comes back flagged for both pickup and delivery anyway.
 */
export function getOperationalCities(): Promise<OperationalCity[]> {
  return request<OperationalCity[]>('/v2/get-operational-city', { timeoutMs: 30000 })
}

export function getMerchantAddresses(): Promise<MerchantAddress[]> {
  return request<MerchantAddress[]>('/v1/get-merchant-address')
}

export function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResult> {
  // Booking must never be retried automatically: a timed-out request may still
  // have created the shipment, and a second attempt would duplicate it.
  return request<CreateOrderResult>('/v3/create-order', {
    method: 'POST',
    body: payload,
    attempts: 1,
    timeoutMs: 30000,
  })
}

export function trackOrder(trackingNumber: string): Promise<TrackedOrder> {
  return request<TrackedOrder>(`/v1/track-order/${encodeURIComponent(trackingNumber)}`)
}

/**
 * Bulk tracking. Three things the PDF gets wrong, all confirmed against the
 * live API:
 *   - it's a GET, not a POST (POST returns 405)
 *   - the parameter is `TrackingNumbers`, not `trackingNumber` (400 otherwise)
 *   - each result is nested under `trackingResponse`, unlike the single-order
 *     endpoint which returns the order directly
 */
export async function trackBulkOrders(trackingNumbers: string[]): Promise<TrackedOrder[]> {
  if (trackingNumbers.length === 0) return []

  const query = encodeURIComponent(trackingNumbers.join(','))
  const raw = await request<Array<TrackedOrder | { trackingResponse?: TrackedOrder }>>(
    `/v1/track-bulk-order?TrackingNumbers=${query}`,
    { timeoutMs: 30000 }
  )

  const list = Array.isArray(raw) ? raw : [raw]

  return list
    .map((entry) => {
      const wrapped = (entry as { trackingResponse?: TrackedOrder })?.trackingResponse
      return wrapped ?? (entry as TrackedOrder)
    })
    .filter((entry): entry is TrackedOrder => Boolean(entry?.trackingNumber))
}

export function cancelOrder(trackingNumber: string): Promise<unknown> {
  return request('/v1/cancel-order', {
    method: 'PUT',
    body: { trackingNumber },
    attempts: 1,
  })
}

/** Shipper advice: 1 = mark return requested, 2 = mark retry attempt. */
export function saveShipperAdvice(
  trackingNumber: string,
  statusId: 1 | 2,
  remarks: string
): Promise<unknown> {
  return request('/v2/save-shipper-advice', {
    method: 'PUT',
    body: { trackingNumber, statusId, remarks },
    attempts: 1,
  })
}

/** The airway bill PDF. Returned raw because it isn't JSON. */
export async function getAirwayBill(trackingNumbers: string[]): Promise<ArrayBuffer> {
  // PostEx caps this at 10 tracking numbers per request.
  const list = trackingNumbers.slice(0, 10).join(',')
  const response = await fetch(
    `${BASE}/v1/get-invoice?trackingNumbers=${encodeURIComponent(list)}`,
    { headers: { token: token() }, cache: 'no-store' }
  )

  if (!response.ok) {
    throw new PostExError(`Could not generate the airway bill (HTTP ${response.status})`, response.status)
  }

  return response.arrayBuffer()
}
