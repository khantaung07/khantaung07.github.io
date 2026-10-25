import assert from 'node:assert/strict'
import { test } from 'node:test'
import { handleCs2Request, steamId } from './leetify.mjs'

async function requestWith(upstream, method = 'GET') {
  const originalFetch = globalThis.fetch
  const calls = []
  const headers = {}
  let status, body
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options })
    return upstream(url, options)
  }
  try {
    const handled = await handleCs2Request({ url: '/api/cs2', method, headers: {} }, {
      setHeader(key, value) { headers[key] = value },
      writeHead(value) { status = value; return this },
      end(value) { body = JSON.parse(value) },
    })
    return { handled, status, body, headers, calls }
  } finally {
    globalThis.fetch = originalFetch
  }
}

const publicProfile = { steam64_id: steamId, privacy_mode: 'public' }
const json = body => new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } })

await test('loads fresh provider summaries and season peaks without caching or replacement scores', async () => {
  const recent = { kdRatio: 1.23, headshotKillPercentage: 48.2 }
  const seasons = [{ isCs2: true, ranks: [{ dataSource: 'faceit', max: 8 }] }]
  const result = await requestWith(url => url.includes('/v3/profile') ? json(publicProfile)
    : url.endsWith('/5v5') ? json(recent) : json({ seasons }))
  assert.equal(result.status, 200)
  assert.deepEqual(result.body, { profile: publicProfile, recent, seasons, faceit: null })
  assert.equal(result.headers['Cache-Control'], 'no-store, max-age=0')
  assert.equal(result.calls.length, 4)
  assert.ok(result.calls.every(call => call.options.cache === 'no-store'))
  // A second request must fetch the provider again rather than return saved data.
  const again = await requestWith(() => json(publicProfile))
  assert.equal(again.calls.length, 4)
})

await test('keeps available profile stats when optional summaries fail', async () => {
  const result = await requestWith(url => url.includes('/v3/profile')
    ? json(publicProfile) : new Response(null, { status: 503 }))
  assert.equal(result.status, 200)
  assert.deepEqual(result.body, { profile: publicProfile, recent: null, seasons: null, faceit: null })
})

await test('respects the public API privacy decision before requesting extra data', async () => {
  const result = await requestWith(() => json({ ...publicProfile, privacy_mode: 'private' }))
  assert.equal(result.status, 404)
  assert.equal(result.calls.length, 1)
  assert.deepEqual(result.body, { error: 'profile_unavailable' })
})

await test('returns rate limiting without exposing an upstream response', async () => {
  const result = await requestWith(() => new Response('upstream details', { status: 429 }))
  assert.equal(result.status, 429)
  assert.equal(result.headers['Retry-After'], '60')
  assert.deepEqual(result.body, { error: 'rate_limited' })
})

await test('rejects writes without calling Leetify', async () => {
  const result = await requestWith(() => { throw new Error('must not fetch') }, 'POST')
  assert.equal(result.status, 405)
  assert.equal(result.calls.length, 0)
})

await test('uses the live profile sidebar Elo instead of the differing public profile field', async () => {
  const publicResponse = { ...publicProfile, ranks: { faceit: 10, faceit_elo: 1691 } }
  for (const elo of [2163, 2188]) {
    const result = await requestWith(url => url.endsWith('/sidebar-games')
      ? json({ platforms: { faceit: { latestElo: elo } } })
      : url.includes('/v3/profile') ? json(publicResponse) : json({}))
    assert.equal(result.status, 200)
    assert.deepEqual(result.body.faceit, { elo })
    assert.equal(result.body.profile.ranks.faceit_elo, 1691)
    const sidebarRequest = result.calls.find(call => call.url.endsWith('/sidebar-games'))
    assert.ok(sidebarRequest)
    assert.equal(sidebarRequest.options.cache, 'no-store')
  }
})

await test('does not substitute the public profile Elo when sidebar Elo is missing or invalid', async () => {
  const publicResponse = { ...publicProfile, ranks: { faceit_elo: 1691 } }
  for (const sidebar of [{}, { platforms: { faceit: { latestElo: null } } },
    { platforms: { faceit: { latestElo: 0 } } }, { platforms: { faceit: { latestElo: '2163' } } }]) {
    const result = await requestWith(url => url.endsWith('/sidebar-games')
      ? json(sidebar) : url.includes('/v3/profile') ? json(publicResponse) : json({}))
    assert.equal(result.status, 200)
    assert.equal(result.body.faceit, null)
  }
})

await test('a sidebar outage does not remove the other available statistics', async () => {
  const result = await requestWith(url => url.endsWith('/sidebar-games')
    ? new Response(null, { status: 503 }) : url.includes('/v3/profile') ? json(publicProfile) : json({}))
  assert.equal(result.status, 200)
  assert.deepEqual(result.body.profile, publicProfile)
  assert.equal(result.body.faceit, null)
})
