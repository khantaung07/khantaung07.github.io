export type MaybeStat = number | null

export interface Cs2Data {
  profile: {
    privacy_mode: string
    steam64_id: string
    name: string
    winrate: MaybeStat
    ranks: { premier: MaybeStat; faceit: MaybeStat; leetify: MaybeStat }
    rating: { aim: MaybeStat; clutch: MaybeStat; utility: MaybeStat; positioning: MaybeStat }
    stats: { preaim: MaybeStat; reaction_time_ms: MaybeStat }
  }
  recent: {
    matchesPlayed: MaybeStat
    kdRatio: MaybeStat
    headshotKillPercentage: MaybeStat
    leetifyRating: MaybeStat
    winRate: MaybeStat
  } | null
  seasons: Array<{
    isCs2: boolean
    ranks: Array<{ dataSource: string; max: MaybeStat }>
  }> | null
  faceit: { elo: number } | null
}

let inFlight: Promise<Cs2Data> | null = null

export function loadCs2Data(): Promise<Cs2Data> {
  // Share only a pending request (including React's development effect replay).
  // No resolved responses, snapshots, localStorage, or background polling.
  if (!inFlight) {
    const base = (import.meta.env.VITE_CS2_API_BASE_URL || '').replace(/\/$/, '')
    inFlight = fetch(`${base}/api/cs2`, { cache: 'no-store', signal: AbortSignal.timeout(35000) })
      .then(async response => {
        if (!response.ok) throw new Error(response.status === 429 ? 'rate_limited' : 'unavailable')
        const data: Cs2Data = await response.json()
        if (data.profile?.privacy_mode !== 'public' || data.profile?.steam64_id !== '76561198156780616'
          || !data.profile.ranks || !data.profile.rating || !data.profile.stats) {
          throw new Error('unavailable')
        }
        return data
      })
      .finally(() => { inFlight = null })
  }
  return inFlight
}

export function isStat(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

export function formatStat(value: MaybeStat | undefined, decimals = 0, unit = '') {
  return isStat(value) ? `${value.toFixed(decimals)}${unit}` : '—'
}

// Leetify's own formatLeetifyRating UI formatter uses 100 × the raw event rating.
// ranks.leetify is already on the display scale; do not multiply it again.
export function formatRating(value: MaybeStat | undefined) {
  return isStat(value) ? `${value >= 0 ? '+' : ''}${(value * 100).toFixed(2)}` : '—'
}

export function bestRank(data: Cs2Data | null, source: 'matchmaking' | 'faceit'): MaybeStat {
  const peaks = (data?.seasons || []).filter(season => season.isCs2)
    .flatMap(season => Array.isArray(season.ranks) ? season.ranks : [])
    .filter(rank => rank.dataSource === source && isStat(rank.max) && rank.max > 0)
    .map(rank => rank.max as number)
  return peaks.length ? Math.max(...peaks) : null
}
