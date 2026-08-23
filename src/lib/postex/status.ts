/**
 * Translating PostEx statuses into dekord order statuses.
 *
 * Two things learned from the live API rather than the PDF:
 *
 * 1. The status list has 20 entries, not the 13 documented, and some contain an
 *    unrendered `{14}` substitution token ("En-Route to {14} warehouse"). Others
 *    substitute the merchant name at runtime ("At DEKORD Warehouse"). So we
 *    match on keywords, never on exact strings.
 *
 * 2. The same order reports different statuses on different endpoints: after a
 *    cancellation, track-order says "Un-Assigned By Me" while get-all-order says
 *    "Cancelled". Both have to mean cancelled.
 */

export type DekordStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface StatusMapping {
  /** The dekord status this implies, or null to leave the order alone. */
  dekordStatus: DekordStatus | null
  /** Tell the customer when the order transitions into this state. */
  notifyCustomer: boolean
  /** Non-null puts the order in the admin "Needs attention" list. */
  attention: string | null
  /**
   * True when a human should decide rather than us flipping the status —
   * returns and expiries mean money didn't arrive and stock is coming back.
   */
  requiresDecision: boolean
}

const DEFAULT: StatusMapping = {
  dekordStatus: null,
  notifyCustomer: false,
  attention: null,
  requiresDecision: false,
}

/**
 * Names PostEx substitutes into status text for our own warehouse. Extend this
 * if the registered merchant name ever changes.
 */
const MERCHANT_NAMES = ['dekord']

interface Rule {
  match: (s: string) => boolean
  mapping: StatusMapping
}

/** Order matters: the first matching rule wins. */
const RULES: Rule[] = [
  // --- problems first, since their text often contains happier keywords ---
  {
    match: (s) => s.includes('delivery under review'),
    mapping: {
      dekordStatus: 'shipped',
      notifyCustomer: false,
      attention: 'PostEx has this delivery under review',
      requiresDecision: false,
    },
  },
  {
    match: (s) => s.includes('attempt'),
    mapping: {
      dekordStatus: 'shipped',
      notifyCustomer: false,
      attention: 'Delivery attempted but not completed',
      requiresDecision: false,
    },
  },
  {
    match: (s) => s.includes('out for return'),
    mapping: {
      dekordStatus: 'shipped',
      notifyCustomer: false,
      attention: 'Parcel is on its way back to you',
      requiresDecision: false,
    },
  },
  {
    match: (s) => s.includes('return requested'),
    mapping: {
      dekordStatus: 'shipped',
      notifyCustomer: false,
      attention: 'A return has been requested',
      requiresDecision: true,
    },
  },
  {
    match: (s) => s.includes('customer requested'),
    mapping: {
      dekordStatus: 'shipped',
      notifyCustomer: false,
      attention: 'Customer requested a change with PostEx',
      requiresDecision: true,
    },
  },
  {
    // Deliberately does not auto-cancel: your money didn't arrive and the
    // stock is coming back, so how to close this out is a business call.
    match: (s) => s.includes('returned'),
    mapping: {
      dekordStatus: null,
      notifyCustomer: false,
      attention: 'Returned to sender — decide how to close this order',
      requiresDecision: true,
    },
  },
  {
    match: (s) => s.includes('expired'),
    mapping: {
      dekordStatus: null,
      notifyCustomer: false,
      attention: 'Booking expired at PostEx',
      requiresDecision: true,
    },
  },

  // --- cancellations ---
  {
    match: (s) =>
      s.includes('cancel') || s.includes('un-assigned') || s.includes('unassigned') || s.includes('void'),
    mapping: {
      dekordStatus: 'cancelled',
      notifyCustomer: false,
      attention: null,
      requiresDecision: false,
    },
  },

  // --- the happy path ---
  {
    match: (s) => s.includes('out for delivery'),
    mapping: {
      dekordStatus: 'shipped',
      notifyCustomer: false,
      attention: null,
      requiresDecision: false,
    },
  },
  {
    match: (s) => s.includes('deliver'),
    mapping: {
      dekordStatus: 'delivered',
      notifyCustomer: true,
      attention: null,
      requiresDecision: false,
    },
  },
  {
    match: (s) => s.includes('picked'),
    mapping: {
      dekordStatus: 'shipped',
      notifyCustomer: true,
      attention: null,
      requiresDecision: false,
    },
  },
  {
    // "At DEKORD Warehouse" (message code 0001) means the parcel is still with
    // us and hasn't been collected — booked, not shipped.
    match: (s) => s.includes('warehouse') && MERCHANT_NAMES.some((n) => s.includes(n)) && !s.includes('postex'),
    mapping: {
      dekordStatus: 'processing',
      notifyCustomer: false,
      attention: null,
      requiresDecision: false,
    },
  },
  {
    match: (s) => s.includes('en-route') || s.includes('en route') || s.includes('warehouse'),
    mapping: {
      dekordStatus: 'shipped',
      notifyCustomer: false,
      attention: null,
      requiresDecision: false,
    },
  },

  // --- booked but not collected. "unbooked" must be tested before "booked". ---
  {
    match: (s) => s.includes('unbooked') || s.includes('un-booked'),
    mapping: {
      dekordStatus: 'processing',
      notifyCustomer: false,
      attention: null,
      requiresDecision: false,
    },
  },
  {
    match: (s) => s.includes('booked'),
    mapping: {
      dekordStatus: 'processing',
      notifyCustomer: false,
      attention: null,
      requiresDecision: false,
    },
  },
  {
    // "Auth" / "Account Auth" are payment states, not shipping ones.
    match: (s) => s.includes('auth'),
    mapping: DEFAULT,
  },
]

/**
 * Lower-case a PostEx status and drop the `{14}` substitution tokens their
 * templating leaves behind.
 *
 * The merchant name is deliberately NOT stripped: "At DEKORD Warehouse" means
 * the parcel is still in our shop, while "At PostEx Warehouse" means it's in
 * the courier's network. Removing the name makes those two indistinguishable
 * and would mark orders shipped before they were collected.
 */
export function normalizeStatus(raw: string | null | undefined): string {
  return (raw ?? '')
    .toLowerCase()
    .replace(/\{\d+\}/g, ' ')
    .replace(/[^a-z\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function mapPostExStatus(raw: string | null | undefined): StatusMapping {
  const status = normalizeStatus(raw)
  if (!status) return DEFAULT

  for (const rule of RULES) {
    if (rule.match(status)) return rule.mapping
  }

  return DEFAULT
}

/** How far along an order is, so a stale webhook can't move it backwards. */
const RANK: Record<DekordStatus, number> = {
  pending: 0,
  processing: 1,
  shipped: 2,
  delivered: 3,
  cancelled: 4,
}

/**
 * PostEx has no ordering guarantee on webhook delivery, so a delayed
 * "picked up" must not undo a "delivered" that already landed. Cancellations
 * are always allowed through.
 */
export function isForwardTransition(current: string, next: DekordStatus): boolean {
  if (next === 'cancelled') return current !== 'cancelled'
  const from = RANK[(current ?? '').toLowerCase() as DekordStatus] ?? 0
  return RANK[next] > from
}
