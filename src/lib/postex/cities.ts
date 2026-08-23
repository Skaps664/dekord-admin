/**
 * Resolving a customer-typed city to a PostEx operational city.
 *
 * PostEx's list is inconsistently cased — 867 of 896 names are ALL-UPPERCASE
 * and 29 are Title Case — so `Peshawar` from checkout does not string-match
 * `PESHAWAR` in their list. Sending the wrong spelling fails the booking.
 *
 * Resolution runs exact -> alias -> fuzzy, and whatever matches, we send back
 * PostEx's own spelling.
 */
import { getOperationalCities, type OperationalCity } from './client'

export type MatchMethod = 'exact' | 'alias' | 'fuzzy'

export interface CityResolution {
  /** The spelling to send to PostEx. */
  cityName: string
  method: MatchMethod
  /** Only set for fuzzy matches: how close it was, 0-1. */
  score?: number
}

/**
 * Case, whitespace and punctuation only. Deliberately does NOT strip words
 * like "Cantt" or "City": doing so merges `Lahore` with `LAHORE CANTT` and
 * `Karachi` with `KARACHI CITY`, which are different delivery areas. With this
 * conservative form, 895 of PostEx's 896 cities stay distinct.
 */
export function normalizeCity(value: string | null | undefined): string {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Abbreviations and nicknames score too low for fuzzy matching to catch, so
 * they're listed explicitly. Keys must already be normalised.
 */
const ALIASES: Record<string, string> = {
  lhr: 'lahore',
  khi: 'karachi',
  isb: 'islamabad',
  isl: 'islamabad',
  pindi: 'rawalpindi',
  rwp: 'rawalpindi',
  psh: 'peshawar',
  pesh: 'peshawar',
  fsd: 'faisalabad',
  lyp: 'faisalabad',
  guj: 'gujranwala',
  mux: 'multan',
  skt: 'sialkot',
  abbottabad_city: 'abbottabad',
  'twin cities': 'rawalpindi',
  'islamabad rawalpindi': 'islamabad',
}

/** Auto-accept threshold. Below this we ask a human rather than guess. */
const FUZZY_THRESHOLD = 0.92

interface CityCache {
  byKey: Map<string, string>
  keys: string[]
  loadedAt: number
}

let cache: CityCache | null = null
let inflight: Promise<CityCache> | null = null

const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 hours

function buildCache(cities: OperationalCity[]): CityCache {
  const byKey = new Map<string, string>()

  for (const city of cities) {
    const name = city?.operationalCityName
    if (!name) continue
    // Deliverable cities only; PostEx currently flags every city for both.
    if (city.isDeliveryCity === false) continue
    const key = normalizeCity(name)
    if (key && !byKey.has(key)) byKey.set(key, name)
  }

  return { byKey, keys: [...byKey.keys()], loadedAt: Date.now() }
}

/**
 * The city list, cached in memory for six hours. Concurrent callers during a
 * cold start share one request rather than each fetching 93KB.
 */
async function getCache(): Promise<CityCache> {
  if (cache && Date.now() - cache.loadedAt < CACHE_TTL_MS) return cache
  if (inflight) return inflight

  inflight = (async () => {
    try {
      const cities = await getOperationalCities()
      cache = buildCache(cities)
      return cache
    } finally {
      inflight = null
    }
  })()

  return inflight
}

/**
 * Similarity between two strings, 0-1.
 *
 * Uses 2 * LCS / (len(a) + len(b)) — the same shape as Python's
 * difflib.SequenceMatcher.ratio(), which is what the 0.92 threshold below was
 * calibrated against. A bigram Dice coefficient scores real misspellings much
 * lower (peshwar/peshawar is 0.77 by Dice but 0.93 here) and would miss them.
 */
function similarity(a: string, b: string): number {
  if (a === b) return 1
  if (!a.length || !b.length) return 0

  // Longest common subsequence, rolling row to keep it O(min) in memory.
  const rows = a.length
  const cols = b.length
  let previous = new Array<number>(cols + 1).fill(0)
  let current = new Array<number>(cols + 1).fill(0)

  for (let i = 1; i <= rows; i += 1) {
    for (let j = 1; j <= cols; j += 1) {
      current[j] =
        a[i - 1] === b[j - 1]
          ? previous[j - 1] + 1
          : Math.max(previous[j], current[j - 1])
    }
    const swap = previous
    previous = current
    current = swap
    current.fill(0)
  }

  return (2 * previous[cols]) / (rows + cols)
}

/**
 * Resolve a city to PostEx's spelling, or null when they don't deliver there.
 * A null result is a routing decision (use another courier), not an error.
 */
export async function resolveCity(input: string | null | undefined): Promise<CityResolution | null> {
  const key = normalizeCity(input)
  if (!key) return null

  const { byKey, keys } = await getCache()

  const exact = byKey.get(key)
  if (exact) return { cityName: exact, method: 'exact' }

  const aliased = ALIASES[key]
  if (aliased) {
    const match = byKey.get(aliased)
    if (match) return { cityName: match, method: 'alias' }
  }

  let best = ''
  let bestScore = 0
  for (const candidate of keys) {
    // Length guard keeps this cheap across ~900 entries.
    if (Math.abs(candidate.length - key.length) > 3) continue
    const score = similarity(key, candidate)
    if (score > bestScore) {
      bestScore = score
      best = candidate
    }
  }

  if (best && bestScore >= FUZZY_THRESHOLD) {
    return { cityName: byKey.get(best)!, method: 'fuzzy', score: Number(bestScore.toFixed(2)) }
  }

  return null
}

/** Every deliverable city, for the admin's manual city picker. */
export async function listCities(): Promise<string[]> {
  const { byKey } = await getCache()
  return [...byKey.values()].sort((a, b) => a.localeCompare(b))
}

/** Closest options to show a human when automatic resolution fails. */
export async function suggestCities(input: string, limit = 5): Promise<string[]> {
  const key = normalizeCity(input)
  if (!key) return []

  const { byKey, keys } = await getCache()

  return keys
    .map((candidate) => ({ candidate, score: similarity(key, candidate) }))
    .filter((entry) => entry.score > 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => byKey.get(entry.candidate)!)
}
