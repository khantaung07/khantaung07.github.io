// Fixed to my profile; no visitor-supplied upstream URLs or player IDs.
export const steamId = '76561198156780616'
const publicApi = 'https://api-public.cs-prod.leetify.com'
const profileApi = `https://api.cs-prod.leetify.com/api/profile/${steamId}`

class LeetifyError extends Error {
  constructor(status) {
    super('Leetify request failed')
    this.status = status
  }
}

async function getJson(url, useApiKey = false) {
  const headers = { Accept: 'application/json' }
  if (useApiKey && process.env.LEETIFY_API_KEY) {
    headers.Authorization = `Bearer ${process.env.LEETIFY_API_KEY}`
  }
  const response = await fetch(url, {
    headers,
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  })
  if (!response.ok) throw new LeetifyError(response.status)
  return response.json()
}

export async function handleCs2Request(request, response) {
  if (new URL(request.url, 'http://localhost').pathname !== '/api/cs2') return false

  response.setHeader('Cache-Control', 'no-store, max-age=0')
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('X-Content-Type-Options', 'nosniff')
  response.setHeader('Vary', 'Origin')
  // Optional when hosting the API separately from a static GitHub Pages build.
  if (process.env.CS2_ALLOWED_ORIGIN && request.headers.origin === process.env.CS2_ALLOWED_ORIGIN) {
    response.setHeader('Access-Control-Allow-Origin', process.env.CS2_ALLOWED_ORIGIN)
  }
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    response.writeHead(405).end(JSON.stringify({ error: 'method_not_allowed' }))
    return true
  }

  try {
    const profile = await getJson(`${publicApi}/v3/profile?steam64_id=${steamId}`, true)
    if (profile.privacy_mode !== 'public' || profile.steam64_id !== steamId) {
      response.writeHead(404).end(JSON.stringify({ error: 'profile_unavailable' }))
      return true
    }

    // These are the same summary endpoints used by Leetify's profile UI.
    // They provide HS Kill %, K/D, and full season peaks missing from /v3/profile.
    const [recent, history, sidebar] = await Promise.allSettled([
      getJson(`${profileApi}/recent-games/5v5`),
      getJson(`${profileApi}/rank-summary`),
      getJson(`${profileApi}/sidebar-games`),
    ])
    // Leetify's profile UI uses this field for current FACEIT Elo.
    // /v3/profile's ranks.faceit_elo can differ; do not use it as a fallback.
    const faceitElo = sidebar.status === 'fulfilled'
      ? sidebar.value?.platforms?.faceit?.latestElo : null
    response.writeHead(200).end(JSON.stringify({
      profile: {
        steam64_id: profile.steam64_id, privacy_mode: profile.privacy_mode,
        name: profile.name, ranks: profile.ranks, rating: profile.rating,
        stats: profile.stats, winrate: profile.winrate,
      },
      recent: recent.status === 'fulfilled' ? recent.value : null,
      seasons: history.status === 'fulfilled' && Array.isArray(history.value?.seasons)
        ? history.value.seasons : null,
      faceit: Number.isSafeInteger(faceitElo) && faceitElo > 0 ? { elo: faceitElo } : null,
    }))
  } catch (error) {
    const limited = error instanceof LeetifyError && error.status === 429
    if (limited) response.setHeader('Retry-After', '60')
    response.writeHead(limited ? 429 : 502).end(JSON.stringify({
      error: limited ? 'rate_limited' : 'profile_unavailable',
    }))
  }
  return true
}

export function leetifyPlugin() {
  const attach = server => {
    server.middlewares.use((request, response, next) => {
      handleCs2Request(request, response).then(handled => { if (!handled) next() }).catch(next)
    })
  }
  return { name: 'leetify-profile', configureServer: attach, configurePreviewServer: attach }
}
